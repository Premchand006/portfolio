/**
 * /api/contact — Vercel serverless function.
 *
 * Accepts a multipart/form-data POST from ContactSection with optional
 * file attachments. Verifies a Cloudflare Turnstile token, validates the
 * payload, and forwards a Resend email to the inbox configured in env.
 *
 * Env required:
 *   RESEND_API_KEY      — Resend API key (re_xxx)
 *   RESEND_TO           — destination inbox (e.g. premchand.korukonda@sima.ai)
 *   RESEND_FROM         — verified sender (e.g. portfolio@premchand.dev)
 *   TURNSTILE_SECRET    — Cloudflare Turnstile server-side secret
 *
 * Response shape (all JSON):
 *   200 { ok: true, id }
 *   400 { ok: false, error, code }
 *   429 { ok: false, error: 'rate_limited' }   (in-memory IP bucket)
 *   500 { ok: false, error: 'send_failed' }
 *
 * Notes
 *   - In-memory rate limit is best-effort; serverless cold starts reset it.
 *     For hard guarantees, swap in Upstash Redis. Sufficient as a first
 *     layer paired with Turnstile + honeypot.
 *   - Attachments capped at 3 files, 10 MB total.
 */

import { Resend } from 'resend';
import { buildEmailHtml, buildEmailText } from './_lib/email-template.js';

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const MAX_FILES = 3;
const MAX_TOTAL_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = new Set([
    'application/pdf',
    'image/png', 'image/jpeg', 'image/webp', 'image/gif',
    'text/plain', 'text/markdown',
    'application/zip',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const ALLOWED_INQUIRIES = new Set(['general', 'project', 'hire', 'research']);

/* In-memory IP bucket. Resets on cold start. */
const rateBucket = new Map();
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 10 * 60 * 1000; // 3 reqs / 10 min / IP

const isRateLimited = (ip) => {
    const now = Date.now();
    const stamps = (rateBucket.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
    if (stamps.length >= RATE_LIMIT) return true;
    stamps.push(now);
    rateBucket.set(ip, stamps);
    return false;
};

const verifyTurnstile = async (token, ip) => {
    if (!process.env.TURNSTILE_SECRET) return { ok: true, dev: true };
    if (!token) return { ok: false, reason: 'missing_token' };
    const params = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET, response: token });
    if (ip) params.set('remoteip', ip);
    const res = await fetch(TURNSTILE_VERIFY_URL, { method: 'POST', body: params });
    const data = await res.json();
    return { ok: !!data.success, raw: data };
};

const validate = ({ name, email, message }) => {
    if (typeof name !== 'string' || name.trim().length < 1 || name.length > 80)
        return 'invalid_name';
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200)
        return 'invalid_email';
    if (typeof message !== 'string' || message.trim().length < 10 || message.length > 5000)
        return 'invalid_message';
    return null;
};

const json = (res, status, body) => {
    res.status(status).setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(body));
};

export default async function handler(req, res) {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'method_not_allowed' });

    const ip =
        (req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim()) ||
        req.socket?.remoteAddress ||
        'unknown';

    if (isRateLimited(ip)) return json(res, 429, { ok: false, error: 'rate_limited' });

    /* Vercel Node runtime gives us a parsed body for JSON, and a raw stream
       for multipart. We read the raw stream and parse with `Web FormData`
       (available in Node 20+ which Vercel uses by default). */
    let form;
    try {
        const contentType = req.headers['content-type'] || '';
        if (!contentType.includes('multipart/form-data') && !contentType.includes('application/x-www-form-urlencoded')) {
            return json(res, 400, { ok: false, error: 'invalid_content_type' });
        }
        const buffer = await new Promise((resolve, reject) => {
            const chunks = [];
            req.on('data', (c) => chunks.push(c));
            req.on('end', () => resolve(Buffer.concat(chunks)));
            req.on('error', reject);
        });
        const fakeRes = new Response(buffer, { headers: { 'content-type': contentType } });
        form = await fakeRes.formData();
    } catch {
        return json(res, 400, { ok: false, error: 'malformed_form' });
    }

    /* Honeypot — bots fill 'website'; humans never see it. */
    if (form.get('website')) {
        // Pretend success so we don't tip off the bot.
        return json(res, 200, { ok: true, id: 'honeypot' });
    }

    const name = form.get('name')?.toString().trim() || '';
    const email = form.get('email')?.toString().trim() || '';
    const message = form.get('message')?.toString() || '';
    const inquiry = (form.get('inquiry')?.toString() || 'general').toLowerCase();
    const link = form.get('link')?.toString().trim() || '';
    const turnstileToken = form.get('cf-turnstile-response')?.toString();

    const vErr = validate({ name, email, message });
    if (vErr) return json(res, 400, { ok: false, error: vErr });
    if (!ALLOWED_INQUIRIES.has(inquiry)) return json(res, 400, { ok: false, error: 'invalid_inquiry' });
    if (link && !/^https?:\/\//.test(link)) return json(res, 400, { ok: false, error: 'invalid_link' });

    const ts = await verifyTurnstile(turnstileToken, ip);
    if (!ts.ok) return json(res, 400, { ok: false, error: 'turnstile_failed' });

    /* Files: validate and convert to Resend attachments */
    const files = form.getAll('attachments').filter((f) => f && typeof f === 'object' && f.size > 0);
    if (files.length > MAX_FILES) return json(res, 400, { ok: false, error: 'too_many_files' });

    let totalBytes = 0;
    const attachments = [];
    const attachmentNames = [];
    for (const file of files) {
        if (!ALLOWED_TYPES.has(file.type)) return json(res, 400, { ok: false, error: 'unsupported_file_type', code: file.type });
        totalBytes += file.size;
        if (totalBytes > MAX_TOTAL_BYTES) return json(res, 400, { ok: false, error: 'attachments_too_large' });
        const buf = Buffer.from(await file.arrayBuffer());
        attachments.push({ filename: file.name, content: buf });
        attachmentNames.push(file.name);
    }

    if (!process.env.RESEND_API_KEY || !process.env.RESEND_TO || !process.env.RESEND_FROM) {
        return json(res, 500, { ok: false, error: 'email_not_configured' });
    }

    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const subjectPrefix = inquiry === 'hire'
            ? '🟢 Hire'
            : inquiry === 'project'
                ? '◇ Project'
                : inquiry === 'research'
                    ? '◆ Research'
                    : '·';
        const result = await resend.emails.send({
            from: process.env.RESEND_FROM,
            to: process.env.RESEND_TO,
            replyTo: email,
            subject: `${subjectPrefix} ${name} — ${inquiry}`,
            html: buildEmailHtml({ name, email, message, inquiry, link, attachmentNames }),
            text: buildEmailText({ name, email, message, inquiry, link, attachmentNames }),
            attachments,
        });
        if (result.error) return json(res, 500, { ok: false, error: 'send_failed', code: result.error.message });
        return json(res, 200, { ok: true, id: result.data?.id || null });
    } catch (err) {
        return json(res, 500, { ok: false, error: 'send_failed', code: err.message });
    }
}
