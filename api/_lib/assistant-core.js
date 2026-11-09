/**
 * Shared assistant core — used by BOTH the Vercel function (api/assistant.js)
 * and the Vite dev middleware (vite.config.js), so the AI answers identically
 * whether the site is deployed or running under local `npm run dev`.
 *
 * Note: this module does NOT import the portfolio JSON itself — the caller
 * passes `data` in. (The Vercel side imports it with an import attribute; the
 * dev side reads it from disk.) Keeping the JSON out of here avoids the
 * Node-vs-Vite import-attribute differences.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

export const VALID_SECTIONS = new Set([
    '#home', '#about', '#techstack', '#experience',
    '#education', '#code', '#projects', '#journey', '#contact',
]);

/* Build the grounding prompt from the portfolio data. EVERYTHING the visitor
   might ask about is included — with links (papers, projects, certificates,
   socials, résumé) — so the assistant can answer completely and hand out URLs. */
export const buildSystemPrompt = (data) => {
    const summary = {
        identity: {
            name: 'Korukonda L K M Prem Chand',
            shortName: 'Prem Chand',
            role: 'ELC engineer · Embedded AI · Deep Learning · WebGL',
            email: data.identity?.email,
            availability: data.availability?.label,
            resume: data.resume?.url,
        },
        education: data.education?.map((e) => `${e.degree} @ ${e.institution} (${e.period})${e.focus ? ` — ${e.focus}` : ''}`),
        skills: data.skills?.map((s) => `${s.name} (${s.proficiency}) — ${s.category}`),
        experience: data.experience?.map((x) => `${x.title} @ ${x.company} (${x.period}): ${x.description}`),
        projects: data.projects?.map((p) => ({ title: p.title, summary: p.description, tags: p.tags, link: p.link })),
        publications: data.publications?.map((p) => ({ title: p.title, venue: p.venue, summary: p.description, link: p.url })),
        certificates: data.certificates?.map((c) => ({ title: c.title, issuer: c.issuer, date: c.date, link: c.url })),
        awards: data.awards?.map((a) => `${a.title}${a.organization ? ` — ${a.organization}` : ''}${a.description ? ` (${a.description})` : ''}`),
        journey: data.journey?.map((j) => `${j.title} (${j.date}) — ${j.description}`),
        socials: data.socials?.map((s) => `${s.platform}: ${s.link}`),
    };

    return [
        `You are Arceus, the AI assistant on Prem Chand's portfolio. You know his full profile (below), but you answer accurately and CONCISELY.`,
        ``,
        `Rules:`,
        `1. BE SHORT. Default to 2-3 sentences. For broad / intro questions ("tell me about Prem", "who is he"), give a 2-sentence summary only — never a full data dump or a long list.`,
        `2. Only enumerate (a tight one-line-per-item list) when the visitor EXPLICITLY asks to list something (e.g. "list his papers", "what projects has he built") — and even then keep it to ~5 items max, one short line each.`,
        `3. Use ONLY the data below. Never invent numbers, employers, papers, dates, or skills. If something isn't covered, say so in one line and point to his GitHub/LinkedIn or the relevant section.`,
        `4. Share a direct link only when it's clearly useful or explicitly asked for — paper URLs (publications[].link), project / certificate links, socials, résumé. Output plain, complete URLs.`,
        `5. When a question maps to a section, end your reply with exactly: SECTION:#name (one of #home #about #techstack #experience #education #code #projects #journey #contact). Omit if there's no clear match.`,
        `6. Tone: warm, professional, third-person ("Prem is…", "He built…"). No filler, no repetition.`,
        `7. Politely decline off-topic or harmful requests.`,
        ``,
        `Portfolio data (JSON):`,
        JSON.stringify(summary, null, 2),
    ].join('\n');
};

/* Pull the trailing SECTION:#id marker (if any) off the model's reply. */
export const parseSectionMarker = (text) => {
    const match = text.match(/SECTION:\s*(#[a-z]+)/i);
    if (!match) return { clean: text.trim(), section: null };
    const section = match[1].toLowerCase();
    const clean = text.replace(/\n?SECTION:\s*#[a-z]+\s*\.?\s*$/i, '').trim();
    return { clean, section: VALID_SECTIONS.has(section) ? section : null };
};

/* One Gemini round-trip. Returns { clean, section }. */
export const askGemini = async ({ apiKey, query, data }) => {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: buildSystemPrompt(data),
        generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 350,
            topP: 0.9,
        },
    });

    const result = await model.generateContent(query);
    const rawText = result?.response?.text?.() || "I'm not sure — try opening a section directly.";
    return parseSectionMarker(rawText);
};
