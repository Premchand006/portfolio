import { useRef } from 'react';
import { resume } from '../config';
import './ResumeButton.css';

const RESUME_URL = resume.url;
const RESUME_FILENAME = resume.filename || 'resume.pdf';

const PdfIcon = () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <text x="7" y="17" fontFamily="'Clash Display', sans-serif" fontSize="5.5" fontWeight="700" fill="currentColor" stroke="none">PDF</text>
    </svg>
);

const ResumeButton = () => {
    const linkRef = useRef(null);

    const handleClick = () => {
        window.open(RESUME_URL, '_blank', 'noopener');
        if (linkRef.current) linkRef.current.click();
    };

    return (
        <>
            <button
                type="button"
                className="resume-btn"
                onClick={handleClick}
                aria-label="Open résumé in a new tab and download"
                title="Résumé · click to open + download"
            >
                <span className="resume-btn__inner">
                    <span className="resume-btn__face resume-btn__face--front">
                        <PdfIcon />
                    </span>
                    <span className="resume-btn__face resume-btn__face--back">
                        Resume
                    </span>
                </span>
            </button>
            <a
                ref={linkRef}
                href={RESUME_URL}
                download={RESUME_FILENAME}
                aria-hidden="true"
                tabIndex={-1}
                style={{ display: 'none' }}
            >download</a>
        </>
    );
};

export default ResumeButton;
