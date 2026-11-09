/* ───────────────────────────────────────────────────────────────
   Centralized config accessor — the ONLY place the UI reads content.

   Everything editable (copy, links, assets, navigation, theme,
   typography, SEO) lives in `site.config.json`. Components import the
   named slices below; they never import the raw JSON directly. This
   keeps the JSON shape decoupled from component code and gives one
   place for helpers + fallbacks.

   API secrets are the one exception — they stay in `api.js` (env vars),
   never in the JSON.
   ─────────────────────────────────────────────────────────────── */
import siteConfig from './site.config.json';

export const {
    meta,
    identity,
    resume,
    theme,
    assets,
    navigation,
    sections,
    techStack,
    projects,
    skills,
    experience,
    education,
    certificates,
    publications,
    awards,
    socials,
    journey,
    timeline,
    cta,
    availability,
    footer,
    loading,
    arceus,
    omnibar,
    mobile,
    blogs,
} = siteConfig;

/* Ordered section ids (DOM / scroll order) — derived once from the
   single navigation list so App, observers and nav widgets agree. */
export const sectionIds = navigation.map((n) => n.id);

/* Look up a social entry by platform name (case-insensitive). */
export const getSocial = (platform) =>
    socials.find((s) => s.platform.toLowerCase() === String(platform).toLowerCase()) || null;

/* Replace {token} placeholders in a string from a vars object.
   Unknown tokens are left untouched. */
export const interpolate = (template, vars = {}) =>
    String(template ?? '').replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));

export default siteConfig;
