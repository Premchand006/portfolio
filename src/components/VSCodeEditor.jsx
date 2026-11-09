import { useState, useCallback } from 'react';
import CertificateRollout from './CertificateRollout';
import { certificates, sections } from '../config';
import './VSCodeEditor.css';

// ─── File Contents ───────────────────────────────────────────────────────────
// The mock C file is generated from `certificates` + the editor strings in
// site.config.json (sections.certifications) — single source of truth, so the
// credentials shown here always match the rollout overlay.

const certCfg = sections.certifications;
const FILENAME = certCfg.editorFilename;

const buildCertFile = () => {
    const list = certificates || [];
    const entries = list
        .map((c) => `        {\n            ${JSON.stringify(c.title)},\n            ${JSON.stringify(c.issuer)},\n            ${JSON.stringify(c.date)}\n        }`)
        .join(',\n');

    const content = `/**
 * ${FILENAME} — ${certCfg.editorTitle}
 * Author : ${certCfg.editorAuthor}
 */

#include <stdio.h>

typedef struct {
    char *name;
    char *issuer;
    char *date;
} Certificate;

int main() {
    Certificate certs[] = {
${entries}
    };

    printf("\\n╔══════════════════════════════════════════════╗\\n");
    printf("║           ${certCfg.bannerText}        ║\\n");
    printf("╚══════════════════════════════════════════════╝\\n\\n");

    for(int i = 0; i < ${list.length}; i++) {
        printf("  ▶  %s\\n", certs[i].name);
        printf("     Issued by : %s\\n", certs[i].issuer);
        printf("     Date      : %s\\n\\n", certs[i].date);
    }

    return 0;
}`;

    const rows = list
        .map((c) => `  ▶  ${c.title}\n     Issued by : ${c.issuer}\n     Date      : ${c.date}\n`)
        .join('\n');

    const runOutput = `
╔══════════════════════════════════════════════╗
║           ${certCfg.bannerText}        ║
╚══════════════════════════════════════════════╝

${rows}`;

    return { lang: 'c', content, runOutput };
};

const FILES = {
    'README.md': {
        lang: 'markdown',
        content: '',
        runOutput: ''
    },
    [FILENAME]: buildCertFile(),
};

// ─── Syntax Highlighter ───────────────────────────────────────────────────────

function highlight(raw, lang) {
    // Step 1 — HTML-escape raw text
    let s = raw
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Step 2 — Extract comments & strings into placeholders so keyword
    //           regexes can't corrupt them.
    //   The index is wrapped as \x00Z<n>Z\x00. The inner `Z` letters are
    //   essential: a bare NUL-delimited digit (\x00<n>\x00) sits on a word
    //   boundary, so the later \b\d+\b number pass would match the index
    //   itself and overwrite the placeholder — which is exactly what turned
    //   every token into a stray `0`/`1`. Flanking with a word char removes
    //   that boundary, so the number pass leaves placeholders untouched.
    const slots = [];
    const ph = (html) => { slots.push(html); return `\x00Z${slots.length - 1}Z\x00`; };

    if (lang === 'c') {
        // block comments
        s = s.replace(/\/\*[\s\S]*?\*\//g, m => ph(`<span class="tok-comment">${m}</span>`));
        // line comments
        s = s.replace(/\/\/[^\n]*/g, m => ph(`<span class="tok-comment">${m}</span>`));
        // strings
        s = s.replace(/"(?:[^"\\]|\\.)*"/g, m => ph(`<span class="tok-string">${m}</span>`));
        // preprocessor
        s = s.replace(/(#\w+)/g, m => ph(`<span class="tok-preproc">${m}</span>`));
        // keywords
        s = s.replace(
            /\b(int|char|void|return|typedef|struct|enum|for|while|if|else|static|const|printf|putchar|sizeof|EXIT_SUCCESS)\b/g,
            m => ph(`<span class="tok-keyword">${m}</span>`)
        );
        // numbers
        s = s.replace(/\b(\d+(?:\.\d+)?f?)\b/g, m => ph(`<span class="tok-number">${m}</span>`));
    } else if (lang === 'python') {
        // triple-quoted docstrings
        s = s.replace(/"""[\s\S]*?"""/g, m => ph(`<span class="tok-comment">${m}</span>`));
        // line comments
        s = s.replace(/#[^\n]*/g, m => ph(`<span class="tok-comment">${m}</span>`));
        // strings
        s = s.replace(/"[^"]*"|'[^']*'/g, m => ph(`<span class="tok-string">${m}</span>`));
        // decorators
        s = s.replace(/@\w+/g, m => ph(`<span class="tok-decorator">${m}</span>`));
        // keywords
        s = s.replace(
            /\b(def|class|from|import|return|if|elif|else|for|in|and|or|not|True|False|None|print|round|sum|min|max|len|Optional|List|self)\b/g,
            m => ph(`<span class="tok-keyword">${m}</span>`)
        );
        // numbers
        s = s.replace(/\b(\d+(?:\.\d+)?)\b/g, m => ph(`<span class="tok-number">${m}</span>`));
    }

    // Step 3 — Restore placeholders (NUL bytes are intentional sentinels)
    // eslint-disable-next-line no-control-regex
    s = s.replace(/\x00Z(\d+)Z\x00/g, (_, i) => slots[+i]);
    return s;
}

// ─── File Language Icons ─────────────────────────────────────────────────────

const CIcon = () => (
    <svg width="15" height="15" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-label="C">
        <rect width="32" height="32" rx="5" fill="#283593" />
        <text x="16" y="23" textAnchor="middle" fill="#90CAF9"
            fontFamily="'Clash Display', sans-serif" fontSize="20" fontWeight="800">C</text>
    </svg>
);

const PyIcon = () => (
    <svg width="15" height="15" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-label="Python">
        <linearGradient id="pyB" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4B8BBE" />
            <stop offset="100%" stopColor="#306998" />
        </linearGradient>
        <linearGradient id="pyY" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE873" />
            <stop offset="100%" stopColor="#FFD43B" />
        </linearGradient>
        <path d="M24 3.5c-5.7 0-9.5 1.2-9.5 5.2v3.8h10v1.5H11C7.4 14 5 16.5 5 24s2.7 9.8 6 10.5h3.5V30c0-4.2 2.8-5.5 9.5-5.5s9.5 1.3 9.5 5.5v4.5h-10v1.5h12.5C39.8 36 43 33.5 43 24s-3-10-6-10.5H33V17c0-4.2-2.8-5.5-9-5.5zm-3 4a1.8 1.8 0 110 3.6 1.8 1.8 0 010-3.6z" fill="url(#pyB)" />
        <path d="M33 13.5H19.5C16 13.5 14 15 14 18v4.5h10V24H11C7.4 24 5 26.5 5 34s2.7 9.8 6 10.5h3.5V40c0-4.2 2.8-5.5 9.5-5.5s9.5 1.3 9.5 5.5v4.5h-10v1.5h12.5C39.8 46 43 43.5 43 35v-5c0-3-2-4.5-5-4.5H24v-1.5h13.5C41 24 43 21.5 43 14c0-4.5-2-7-5.5-7H33zm-3.5 24a1.8 1.8 0 110 3.6 1.8 1.8 0 010-3.6z" fill="url(#pyY)" />
    </svg>
);

const MDIcon = () => (
    <svg width="15" height="15" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-label="Markdown">
        <path d="M6 24.5v-17h4.5l4 5.5 4-5.5h4.5v17h-3.5v-10l-3 4h-4l-3-4v10H6z" fill="#007ACC" />
    </svg>
);

const FILE_ICON_MAP = { '.c': CIcon, '.py': PyIcon, '.md': MDIcon };

const FileIcon = ({ filename, size = 15 }) => {
    const ext = Object.keys(FILE_ICON_MAP).find((e) => filename.endsWith(e));
    const Icon = ext ? FILE_ICON_MAP[ext] : null;
    return Icon ? <Icon size={size} /> : <span style={{ width: size, display: 'inline-block' }} />;
};

// ─── Component ────────────────────────────────────────────────────────────────

const TERMINAL_TABS = ['PROBLEMS', 'OUTPUT', 'TERMINAL', 'DEBUG CONSOLE'];

const VSCodeEditor = () => {
    const [activeFile, setActiveFile] = useState('README.md');
    const [openTabs, setOpenTabs] = useState(['README.md', FILENAME]);
    const [explorerOpen, setExplorerOpen] = useState(true);
    const [termOpen, setTermOpen] = useState(false);
    const [activeTermTab, setActiveTermTab] = useState('TERMINAL');
    const [running, setRunning] = useState(false);
    const [termOutput, setTermOutput] = useState('');
    const [certOpen, setCertOpen] = useState(false);

    const openFile = (name) => {
        setActiveFile(name);
        setOpenTabs((t) => t.includes(name) ? t : [...t, name]);
    };

    const closeTab = (e, name) => {
        e.stopPropagation();
        const next = openTabs.filter((t) => t !== name);
        setOpenTabs(next);
        if (activeFile === name) setActiveFile(next.at(-1) ?? '');
    };

    const runFile = useCallback(() => {
        const file = FILES[activeFile];
        if (!file) return;

        /* Special case — certifications.c triggers the credentials rollout
           ceremony instead of plain terminal output. The terminal still
           writes a short banner so the editor narrative stays consistent. */
        if (activeFile === FILENAME) {
            setTermOpen(true);
            setActiveTermTab('TERMINAL');
            setRunning(true);
            setTermOutput(`$ ./certifications\n[boot] unrolling credentials…\n`);
            setTimeout(() => {
                setRunning(false);
                setTermOutput(`$ ./certifications\n[boot] unrolling credentials…\n[ok] ${activeFile} executed — opening rollout.\n`);
                setCertOpen(true);
            }, 700);
            return;
        }

        setTermOpen(true);
        setActiveTermTab('TERMINAL');
        setRunning(true);
        setTermOutput(`$ ./${activeFile.replace('.c', '').replace('.py', '')}\nRunning...\n`);
        setTimeout(() => {
            setTermOutput(`$ ./${activeFile.replace('.c', '').replace('.py', '')}${file.runOutput}`);
            setRunning(false);
        }, 900);
    }, [activeFile]);

    const [termHeight, setTermHeight] = useState(180);
    const [explorerWidth, setExplorerWidth] = useState(200);

    const startResize = useCallback((e) => {
        e.preventDefault();
        const startY = e.clientY;
        const startH = termHeight;

        const onMove = (ev) => {
            const delta = startY - ev.clientY;          // drag up = grow
            setTermHeight(Math.max(80, Math.min(500, startH + delta)));
        };
        const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }, [termHeight]);

    /* Drag the divider between the explorer and the editor to widen or
       narrow the file tree, just like real VS Code. */
    const startResizeExplorer = useCallback((e) => {
        e.preventDefault();
        const startX = e.clientX;
        const startW = explorerWidth;

        const onMove = (ev) => {
            const delta = ev.clientX - startX;          // drag right = grow
            setExplorerWidth(Math.max(120, Math.min(420, startW + delta)));
        };
        const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }, [explorerWidth]);

    const file = FILES[activeFile];
    const lines = file?.content.split('\n') ?? [];

    /* Body rendered inside the active terminal tab. Only TERMINAL has
       a live shell session; the other tabs render a quiet empty state
       so the layout matches a real VS Code window. */
    const renderTermBody = () => {
        if (activeTermTab === 'TERMINAL') {
            return <pre className="vsc-terminal__output">{termOutput || '$ '}</pre>;
        }
        const empty = {
            PROBLEMS: 'No problems have been detected in the workspace.',
            OUTPUT: 'No output to display.',
            'DEBUG CONSOLE': 'No active debug session.',
        }[activeTermTab];
        return <div className="vsc-terminal__empty">{empty}</div>;
    };

    return (
        <div className="vsc">
            <CertificateRollout open={certOpen} onClose={() => setCertOpen(false)} />
            {/* Title bar */}
            <div className="vsc-titlebar">
                <div className="vsc-titlebar__dots">
                    <span className="dot dot--red" />
                    <span className="dot dot--yellow" />
                    <span className="dot dot--green" />
                </div>
                <span className="vsc-titlebar__name">
                    {activeFile || 'No file'} — Visual Studio Code
                </span>
                <button className="vsc-icon-btn" title="Toggle Terminal" onClick={() => setTermOpen((o) => !o)}>⌨</button>
            </div>

            {/* Menu bar */}
            <div className="vsc-menubar">
                {['File', 'Edit', 'View', 'Go', 'Run', 'Terminal', 'Help'].map((m) => (
                    <span key={m} className="vsc-menubar__item">{m}</span>
                ))}
            </div>

            <div className="vsc-body">
                {/* Activity bar */}
                <div className="vsc-activitybar">
                    <button className={`vsc-actbtn ${explorerOpen ? 'vsc-actbtn--active' : ''}`} title="Explorer" onClick={() => setExplorerOpen((o) => !o)}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>
                    </button>
                    <button className="vsc-actbtn" title="Search">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
                    </button>
                    <button className="vsc-actbtn" title="Run and Debug">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="6 4 20 12 6 20 6 4" /></svg>
                    </button>
                    <button className="vsc-actbtn" title="Extensions">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
                    </button>
                </div>

                {/* Explorer */}
                {explorerOpen && (
                    <div className="vsc-explorer" style={{ width: explorerWidth }}>
                        <div className="vsc-explorer__header">EXPLORER</div>
                        <div className="vsc-explorer__section">
                            <div className="vsc-explorer__folder">
                                <span className="vsc-explorer__chevron">▾</span>
                                <span>port-prem</span>
                            </div>
                            {Object.keys(FILES).map((name) => (
                                <div
                                    key={name}
                                    className={`vsc-explorer__file ${activeFile === name ? 'vsc-explorer__file--active' : ''}`}
                                    onClick={() => openFile(name)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && openFile(name)}
                                >
                                    <span className="vsc-explorer__file-icon">
                                        <FileIcon filename={name} />
                                    </span>
                                    {name}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Drag handle to resize the explorer width */}
                {explorerOpen && (
                    <div
                        className="vsc-explorer-resizer"
                        onMouseDown={startResizeExplorer}
                        role="separator"
                        aria-orientation="vertical"
                        aria-label="Resize file explorer"
                        title="Drag to resize the explorer"
                    />
                )}

                {/* Main */}
                <div className="vsc-main">
                    {/* Tabs */}
                    <div className="vsc-tabs">
                        {openTabs.map((tab) => (
                            <div key={tab} className={`vsc-tab ${activeFile === tab ? 'vsc-tab--active' : ''}`} onClick={() => setActiveFile(tab)} role="button" tabIndex={0}>
                                <FileIcon filename={tab} size={13} />
                                {tab}
                                <button className="vsc-tab__close" onClick={(e) => closeTab(e, tab)} aria-label={`Close ${tab}`}>×</button>
                            </div>
                        ))}
                        {file && (
                            <button className="vsc-run-btn" onClick={runFile} disabled={running} title={`Run ${activeFile}`}>
                                {running ? '⏳' : '▶'} {running ? 'Running…' : 'Run'}
                            </button>
                        )}
                    </div>

                    {/* Breadcrumb */}
                    {file && <div className="vsc-breadcrumb">port-prem › {activeFile}</div>}

                    {/* Editor */}
                    <div className="vsc-editor">
                        {file ? (
                            file.lang === 'markdown' ? (
                                <div className="vsc-markdown">
                                    <h2 className="vsc-markdown__title">Welcome to my Certifications section.</h2>
                                    <p className="vsc-markdown__subtitle">Explore my professional credentials while enjoying a VS Code-themed experience.</p>
                                    <ol className="vsc-markdown__list">
                                        <li>Open any file from the Explorer.</li>
                                        <li>Click the Run (▶) button to execute the code.</li>
                                        <li>The terminal output will reveal the corresponding details.</li>
                                        <li>For example, running <code>{FILENAME}</code> will unroll my certifications.</li>
                                    </ol>
                                </div>
                            ) : (
                                <div className="vsc-code">
                                    {lines.map((line, i) => (
                                        <div key={i} className="vsc-code__line">
                                            <span className="vsc-code__ln">{i + 1}</span>
                                            <span className="vsc-code__text" dangerouslySetInnerHTML={{ __html: highlight(line, file.lang) || '&nbsp;' }} />
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            <div className="vsc-empty">
                                <p>No file open</p>
                                <p className="vsc-empty__hint">Select a file from the explorer</p>
                            </div>
                        )}
                    </div>

                    {/* Terminal panel */}
                    {termOpen && (
                        <div className="vsc-terminal" style={{ height: termHeight }}>
                            {/* Resize grip — drag up to expand, down to shrink */}
                            <div
                                className="vsc-terminal__resizer"
                                onMouseDown={startResize}
                                title="Drag to resize terminal"
                            />
                            <div className="vsc-terminal__header">
                                <div className="vsc-terminal__tabs" role="tablist">
                                    {TERMINAL_TABS.map((t) => (
                                        <button
                                            key={t}
                                            role="tab"
                                            aria-selected={activeTermTab === t}
                                            className={`vsc-terminal__tab${activeTermTab === t ? ' vsc-terminal__tab--active' : ''}`}
                                            onClick={() => setActiveTermTab(t)}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                                <button className="vsc-icon-btn" onClick={() => setTermOpen(false)} aria-label="Close terminal">×</button>
                            </div>
                            <div className="vsc-terminal__body">
                                {renderTermBody()}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Status bar */}
            <div className="vsc-statusbar">
                <span className="vsc-statusbar__left">
                    <span className="vsc-statusbar__branch">⎇ main</span>
                    {file && <span className="vsc-statusbar__lang">{file.lang === 'c' ? 'C' : 'Python'}</span>}
                </span>
                <span className="vsc-statusbar__right">Ln 1, Col 1</span>
            </div>
        </div>
    );
};

export default VSCodeEditor;
