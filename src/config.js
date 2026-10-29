// Toute la configuration vient du fichier .env (voir .env.example).
const env = process.env;

export const CONFIG = {
  emailjs: {
    serviceId: env.REACT_APP_EMAILJS_SERVICE_ID || '',
    templateId: env.REACT_APP_EMAILJS_TEMPLATE_ID || '',
    publicKey: env.REACT_APP_EMAILJS_PUBLIC_KEY || '',
  },
  contactEmail: env.REACT_APP_CONTACT_EMAIL || 'contact@bachirsy.com',
  links: {
    linkedin: env.REACT_APP_LINKEDIN_URL || 'https://linkedin.com/in/bachirsy',
    github: env.REACT_APP_GITHUB_URL || '',
    cv: env.REACT_APP_CV_URL || '',
  },
};

export const emailjsReady = () =>
  Boolean(CONFIG.emailjs.serviceId && CONFIG.emailjs.templateId && CONFIG.emailjs.publicKey);
