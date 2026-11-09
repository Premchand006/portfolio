import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/Button';
import Footer from '../components/Footer';
import Spectacles from '../components/Spectacles';
import { socials, resume, sections, identity, interpolate } from '../config';
import { flowContainerProps, flowItemProps, flowTitleProps } from '../hooks/useSectionFlow';
import './Sections.css';
import './ContactSection.css';

/* ── Inline social icons (preserved from original) ───────────── */
const Icons = {
    GitHub: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
    ),
    LinkedIn: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
    ),
    GoogleScholar: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M5.242 13.769L0 9.5 12 2l12 7.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z" />
        </svg>
    ),
    Discord: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
        </svg>
    ),
    Email: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
        </svg>
    ),
    Gmail: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
        </svg>
    ),
    Instagram: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
    ),
    ResearchGate: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.586 0H4.414A4.414 4.414 0 0 0 0 4.414v15.172A4.414 4.414 0 0 0 4.414 24h15.172A4.414 4.414 0 0 0 24 19.586V4.414A4.414 4.414 0 0 0 19.586 0z" opacity="0" />
        <path d="M5.587 16.855H4.15V5.597c2.091 0 3.527.104 4.307.311a3.4 3.4 0 0 1 1.954 1.258 3.511 3.511 0 0 1 .637 2.06c0 1.054-.265 1.931-.794 2.63a3.834 3.834 0 0 1-2.222 1.488l3.141 3.511H9.378l-2.735-3.344h-1.056v3.344zm0-4.63h1.16c1.196 0 2.023-.197 2.483-.591.46-.394.69-1.002.69-1.824 0-.742-.218-1.32-.656-1.733-.437-.413-1.193-.62-2.268-.62H5.587v4.768zm10.741-6.195c1.472 0 2.607.411 3.404 1.233.797.822 1.196 2.016 1.196 3.582 0 1.58-.403 2.784-1.21 3.61-.806.826-1.957 1.239-3.454 1.239-1.15 0-2.112-.241-2.885-.722v1.39c0 .591.139 1.011.417 1.261.278.25.753.375 1.425.375h1.155v1.23c-.502.046-1.116.069-1.841.069-1.054 0-1.846-.234-2.378-.703-.531-.469-.797-1.2-.797-2.191V8.924h1.794V7.545h-1.794V6.297h1.794c0-.987.27-1.745.811-2.274.54-.529 1.341-.794 2.404-.794z" />
    </svg>
    ),

    Medium: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M2.846 6.887c.03-.295-.083-.586-.303-.784L.61 3.74V3.4h6.937L12.91 15.18 17.626 3.4H24v.34l-1.652 1.587a.485.485 0 0 0-.18.461v11.62c-.027.176.05.351.181.461l1.617 1.587v.34h-8.13v-.34l1.674-1.626c.165-.165.165-.213.165-.461V7.482l-4.66 11.835h-.628L6.97 7.482v7.93c-.044.33.063.661.297.91l2.18 2.645v.34H3.27v-.34l2.18-2.645c.227-.226.327-.554.272-.91V6.887z" />
        </svg>
    ),
    X: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932zM17.61 20.644h2.039L6.486 3.24H4.298z" />
        </svg>
    ),
    Snapchat: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.299 1.104.299.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z" />
        </svg>
    ),
    Letterboxd: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="5" cy="12" r="3.1" />
            <circle cx="12" cy="12" r="3.1" />
            <circle cx="19" cy="12" r="3.1" />
        </svg>
    ),
    Paperclip: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21.44 11.05L12.25 20.24a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
        </svg>
    ),
    Check: () => (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
};

const contact = sections.contact;
const form = contact.form;
const messages = contact.messages;
const INQUIRY_TYPES = contact.inquiryTypes;

const MAILTO = identity.email;
const MAX_FILES = contact.maxFiles;
const MAX_TOTAL_BYTES = contact.maxTotalBytes;

const formatBytes = (n) => {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

const ContactSection = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '', link: '' });
    const [inquiry, setInquiry] = useState('general');
    const [files, setFiles] = useState([]);
    const [status, setStatus] = useState('idle'); // idle | sending | success | error
    const [errorMsg, setErrorMsg] = useState('');
    const [turnstileToken, setTurnstileToken] = useState('');
    const widgetIdRef = useRef(null);
    const turnstileMountRef = useRef(null);

    const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

    /* ── Cloudflare Turnstile (loaded only if site key configured) ── */
    useEffect(() => {
        if (!turnstileSiteKey || turnstileSiteKey.startsWith('0x4AAAAAAA_replace')) return;
        if (document.querySelector('script[data-turnstile]')) return;
        const s = document.createElement('script');
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        s.async = true;
        s.defer = true;
        s.dataset.turnstile = '1';
        document.head.appendChild(s);
    }, [turnstileSiteKey]);

    useEffect(() => {
        if (!turnstileSiteKey || turnstileSiteKey.startsWith('0x4AAAAAAA_replace')) return;
        let cancelled = false;
        const tryRender = () => {
            if (cancelled) return;
            if (window.turnstile && turnstileMountRef.current && widgetIdRef.current === null) {
                widgetIdRef.current = window.turnstile.render(turnstileMountRef.current, {
                    sitekey: turnstileSiteKey,
                    theme: 'dark',
                    appearance: 'interaction-only',
                    callback: (token) => setTurnstileToken(token),
                    'expired-callback': () => setTurnstileToken(''),
                });
            } else {
                setTimeout(tryRender, 200);
            }
        };
        tryRender();
        return () => { cancelled = true; };
    }, [turnstileSiteKey]);

    const handleChange = (e) => setFormData((d) => ({ ...d, [e.target.name]: e.target.value }));

    const handleFiles = useCallback((incoming) => {
        const list = Array.from(incoming);
        const next = [...files];
        let totalBytes = next.reduce((a, f) => a + f.size, 0);
        for (const file of list) {
            if (next.length >= MAX_FILES) break;
            if (totalBytes + file.size > MAX_TOTAL_BYTES) break;
            next.push(file);
            totalBytes += file.size;
        }
        setFiles(next);
    }, [files]);

    const removeFile = (idx) => {
        setFiles((f) => f.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (status === 'sending') return;
        setErrorMsg('');
        setStatus('sending');

        const fd = new FormData();
        fd.set('name', formData.name);
        fd.set('email', formData.email);
        fd.set('message', formData.message);
        fd.set('inquiry', inquiry);
        if (formData.link) fd.set('link', formData.link);
        if (turnstileToken) fd.set('cf-turnstile-response', turnstileToken);
        files.forEach((file) => fd.append('attachments', file, file.name));

        try {
            const res = await fetch('/api/contact', { method: 'POST', body: fd });
            if (res.status === 404) {
                /* Vite dev without `vercel dev` — gracefully fall back to mailto */
                const subject = `Portfolio · ${inquiry} · ${formData.name}`;
                const body = `${formData.message}\n\nFrom: ${formData.email}${formData.link ? `\nLink: ${formData.link}` : ''}`;
                window.location.href = `mailto:${MAILTO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                setStatus('idle');
                setErrorMsg(messages.localPreview);
                return;
            }
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.ok) {
                setStatus('error');
                setErrorMsg(humaniseError(data.error || 'unknown'));
                return;
            }
            setStatus('success');
            setFormData({ name: '', email: '', message: '', link: '' });
            setFiles([]);
            setInquiry('general');
            if (window.turnstile && widgetIdRef.current !== null) window.turnstile.reset(widgetIdRef.current);
            setTurnstileToken('');
        } catch {
            setStatus('error');
            setErrorMsg(messages.network);
        }
    };

    const isSending = status === 'sending';
    const totalBytes = files.reduce((a, f) => a + f.size, 0);

    return (
        <section className="section section--contact" id="contact" aria-label="Contact">
            <motion.div className="section__content container" {...flowContainerProps}>
                <motion.div className="contact__header" {...flowTitleProps}>
                    <span className="section-label">{contact.label}</span>

                    <div className="creative-heading-wrapper">
                        <h2 className="creative-heading-text creative-heading-ghost" aria-hidden="true">{contact.heading}</h2>
                        <div className="creative-heading-top" aria-hidden="true">
                            <h2 className="creative-heading-text">{contact.heading}</h2>
                        </div>
                        <div className="creative-heading-middle">{contact.headingAccent}</div>
                        <div className="creative-heading-bottom">
                            <h2 className="creative-heading-text">{contact.heading}</h2>
                        </div>
                    </div>

                    <p className="section__subtitle text-secondary contact__subtitle">
                        {contact.description}
                    </p>
                </motion.div>

                {/* Social band — round icon-only buttons (LinkedIn, GitHub,
                    Instagram, Gmail, ResearchGate, Medium, Discord, Google Scholar).
                    Hover reveals the handle via the native tooltip + class
                    animations defined in ContactSection.css. */}
                <motion.div
                    className="contact__social-band"
                    {...flowItemProps}
                    aria-label={contact.socialBandLabel}
                >
                    {socials.map((social) => {
                        const platformKey = social.platform.replace(/\s+/g, '');
                        const IconComponent = Icons[platformKey] || Icons.GitHub;
                        const external = !social.link.startsWith('mailto:') && !social.link.startsWith('tel:');
                        return (
                            <a
                                key={social.id}
                                href={social.link}
                                className="contact__social-dot"
                                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                aria-label={`${social.platform} — ${social.handle}`}
                                title={`${social.platform} · ${social.handle}`}
                                data-magnetic
                            >
                                <span className="contact__social-dot-icon" aria-hidden="true">
                                    <IconComponent />
                                </span>
                                <span className="contact__social-dot-tip">{social.platform}</span>
                            </a>
                        );
                    })}
                </motion.div>

                {/* 2-col layout: left reserved for a future block, right = form. */}
                <motion.div className="contact__grid" {...flowItemProps}>
                    <Spectacles />

                    <motion.form
                        className="contact-form"
                        onSubmit={handleSubmit}
                        {...flowItemProps}
                        noValidate
                    >
                    {/* Inquiry-type chips */}
                    <fieldset className="contact-form__chips" aria-label="Inquiry type">
                        {INQUIRY_TYPES.map((t) => (
                            <button
                                type="button"
                                key={t.id}
                                className={`contact-chip${inquiry === t.id ? ' is-active' : ''}`}
                                onClick={() => setInquiry(t.id)}
                                aria-pressed={inquiry === t.id}
                                data-magnetic
                            >
                                <span className="contact-chip__dot" aria-hidden="true" />
                                {t.label}
                            </button>
                        ))}
                    </fieldset>

                    <div className="contact-form__row">
                        <div className="contact-form__group">
                            <label htmlFor="name" className="contact-form__label">{form.nameLabel}</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className="contact-form__input"
                                placeholder={form.namePlaceholder}
                                value={formData.name}
                                onChange={handleChange}
                                required
                                maxLength={80}
                                autoComplete="name"
                            />
                        </div>

                        <div className="contact-form__group">
                            <label htmlFor="email" className="contact-form__label">{form.emailLabel}</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="contact-form__input"
                                placeholder={form.emailPlaceholder}
                                value={formData.email}
                                onChange={handleChange}
                                required
                                maxLength={200}
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="contact-form__group">
                        <label htmlFor="message" className="contact-form__label">{form.messageLabel}</label>
                        <textarea
                            id="message"
                            name="message"
                            className="contact-form__textarea"
                            placeholder={form.messagePlaceholder}
                            value={formData.message}
                            onChange={handleChange}
                            required
                            minLength={10}
                            maxLength={form.messageMaxLength}
                        />
                        <span className="contact-form__counter" aria-live="polite">
                            {formData.message.length} / {form.messageMaxLength}
                        </span>
                    </div>

                    <div className="contact-form__row">
                        <div className="contact-form__group">
                            <label htmlFor="link" className="contact-form__label">
                                {form.linkLabel} <span className="contact-form__optional">{form.optionalText}</span>
                            </label>
                            <input
                                type="url"
                                id="link"
                                name="link"
                                className="contact-form__input"
                                placeholder={form.linkPlaceholder}
                                value={formData.link}
                                onChange={handleChange}
                                maxLength={500}
                                inputMode="url"
                            />
                        </div>

                        {/* Attachments */}
                        <div className="contact-form__group">
                            <label className="contact-form__label">
                                {form.attachmentsLabel} <span className="contact-form__optional">{interpolate(form.attachmentsHint, { maxFiles: MAX_FILES })}</span>
                            </label>
                            <label className="contact-attach">
                                <Icons.Paperclip />
                                <span>{files.length === 0 ? form.attachmentsPlaceholder : `${files.length} attached · ${formatBytes(totalBytes)}`}</span>
                                <input
                                    type="file"
                                    className="contact-attach__input"
                                    multiple
                                    accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.txt,.md,.zip,.doc,.docx"
                                    onChange={(e) => handleFiles(e.target.files)}
                                    disabled={files.length >= MAX_FILES || isSending}
                                />
                            </label>
                        </div>
                    </div>

                    {files.length > 0 && (
                        <ul className="contact-attach__list" aria-label="Attached files">
                            {files.map((f, i) => (
                                <li key={`${f.name}-${i}`} className="contact-attach__item">
                                    <span className="contact-attach__name" title={f.name}>{f.name}</span>
                                    <span className="contact-attach__size">{formatBytes(f.size)}</span>
                                    <button
                                        type="button"
                                        className="contact-attach__remove"
                                        onClick={() => removeFile(i)}
                                        aria-label={`Remove ${f.name}`}
                                    >
                                        ×
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Honeypot — hidden from humans, bots fill it */}
                    <div className="contact-form__honeypot" aria-hidden="true">
                        <label>Website (leave blank)
                            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                        </label>
                    </div>

                    {/* Cloudflare Turnstile mount (only renders when site key configured) */}
                    {turnstileSiteKey && !turnstileSiteKey.startsWith('0x4AAAAAAA_replace') && (
                        <div className="contact-form__turnstile" ref={turnstileMountRef} />
                    )}

                    <div className="contact-form__actions">
                        <Button
                            size="lg"
                            type="submit"
                            className="contact-form__submit"
                            disabled={isSending || status === 'success'}
                            aria-busy={isSending}
                        >
                            {isSending ? form.submitSending : status === 'success' ? form.submitSent : form.submitIdle}
                        </Button>

                        {resume?.url && (
                            <a
                                href={resume.url}
                                download={resume.filename || true}
                                className="contact-form__resume"
                                data-magnetic
                                aria-label={resume.label || 'Download résumé PDF'}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                {resume.label || 'Download résumé'}
                            </a>
                        )}
                    </div>

                    {/* Live status region (a11y) */}
                    <AnimatePresence mode="wait">
                        {status === 'success' && (
                            <motion.div
                                key="ok"
                                className="contact-state contact-state--ok"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                role="status"
                                aria-live="polite"
                            >
                                <span className="contact-state__icon"><Icons.Check /></span>
                                <div>
                                    <strong>{messages.successTitle}</strong>
                                    <span> {messages.successBody}</span>
                                </div>
                            </motion.div>
                        )}
                        {status === 'error' && (
                            <motion.div
                                key="err"
                                className="contact-state contact-state--err"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                role="alert"
                            >
                                <span className="contact-state__icon">!</span>
                                <div>
                                    <strong>{messages.errorTitle}</strong>
                                    <span> {errorMsg || messages.errorFallback} </span>
                                    <a href={`mailto:${MAILTO}`} className="contact-state__link">{MAILTO}</a>
                                </div>
                            </motion.div>
                        )}
                        {errorMsg && status === 'idle' && (
                            <motion.div
                                key="info"
                                className="contact-state contact-state--info"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                role="status"
                            >
                                {errorMsg}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    </motion.form>
                </motion.div>

                <Footer />
            </motion.div>
        </section>
    );
};

const humaniseError = (code) =>
    interpolate(messages.errors[code] || messages.errors.default, { maxFiles: MAX_FILES });

export default ContactSection;
