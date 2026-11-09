/**
 * /api/assistant — Vercel serverless function.
 *
 * Visitor question → Gemini Flash answer, grounded in this portfolio's
 * content (site.config.json). Free to run: Gemini's free tier gives
 * ~1500 req/day with no credit card. Get a key from
 * https://aistudio.google.com/app/apikey
 *
 * Env required:
 *   GEMINI_API_KEY — Google AI Studio key (free tier, no card)
 *
 * The prompt-building + Gemini call live in ./_lib/assistant-core.js so the
 * Vite dev middleware can reuse them and answer locally too.
 *
 * Response shape (JSON):
 *   200 { ok: true, reply: "...", suggestSection: "#about" | null }
 *   400 { ok: false, error: "invalid_request" }
 *   429 { ok: false, error: "rate_limited" }
 *   500 { ok: false, error: "assistant_unavailable" | "assistant_not_configured" }
 */

import data from '../src/config/site.config.json' with { type: 'json' };
import { askGemini } from './_lib/assistant-core.js';

/* ── Best-effort rate limit per cold start ───────────────────── */
const rateBucket = new Map();
const RATE_LIMIT = 8;
const RATE_WINDOW_MS = 5 * 60 * 1000;

const isRateLimited = (ip) => {
    const now = Date.now();
    const stamps = (rateBucket.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
    if (stamps.length >= RATE_LIMIT) return true;
    stamps.push(now);
    rateBucket.set(ip, stamps);
    return false;
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

    if (!process.env.GEMINI_API_KEY) {
        return json(res, 500, { ok: false, error: 'assistant_not_configured' });
    }

    let body;
    try {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const raw = Buffer.concat(chunks).toString('utf8');
        body = raw ? JSON.parse(raw) : {};
    } catch {
        return json(res, 400, { ok: false, error: 'malformed_json' });
    }

    const query = typeof body.query === 'string' ? body.query.trim().slice(0, 800) : '';
    if (!query || query.length < 2) return json(res, 400, { ok: false, error: 'invalid_request' });

    try {
        const { clean, section } = await askGemini({
            apiKey: process.env.GEMINI_API_KEY,
            query,
            data,
        });
        return json(res, 200, { ok: true, reply: clean, suggestSection: section });
    } catch (err) {
        return json(res, 500, { ok: false, error: 'assistant_unavailable', code: err.message });
    }
}
