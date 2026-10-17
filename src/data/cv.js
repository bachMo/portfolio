// CV téléchargeables : fichiers placés dans public/cv/.
const base = (process.env.PUBLIC_URL || '') + '/cv/';

export const CV = {
  fr: {
    light: { href: base + 'frcvlight.pdf', file: 'CV_Bachir_Sy_FR.pdf', label: 'FR · clair' },
    dark: { href: base + 'frcvdark.pdf', file: 'CV_Bachir_Sy_FR_sombre.pdf', label: 'FR · sombre' },
  },
  en: {
    light: { href: base + 'encvlight.pdf', file: 'Resume_Bachir_Sy_EN.pdf', label: 'EN · light' },
    dark: { href: base + 'encvdark.pdf', file: 'Resume_Bachir_Sy_EN_dark.pdf', label: 'EN · dark' },
  },
};

export const CV_LIST = [CV.fr.light, CV.fr.dark, CV.en.light, CV.en.dark];
