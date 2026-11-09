/* API credentials — populate via Vite env vars so secrets stay out of git.
   In dev create `.env.local` (gitignored) with these keys; in Vercel
   set them in the project's Environment Variables panel. */

export const apiKeys = {
    emailjs: {
        serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
        templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
        publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
    },
    arceus: {
        apiKey: import.meta.env.VITE_ARCEUS_API_KEY || '',
        model: import.meta.env.VITE_ARCEUS_MODEL || '',
    },
};

export const isEmailJsConfigured = () =>
    Boolean(apiKeys.emailjs.serviceId && apiKeys.emailjs.templateId && apiKeys.emailjs.publicKey);

export const isArceusConfigured = () => Boolean(apiKeys.arceus.apiKey);
