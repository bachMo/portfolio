// Messages dynamiques du formulaire de contact — FR et EN
const formMessages = {
  fr: {
    idle: 'EN ATTENTE DE VOTRE MESSAGE',
    live: 'TRANSCRIPTION EN COURS…',
    ready: 'MESSAGE PRÊT À ENVOYER',
    name: 'Indiquez votre nom pour que je sache à qui répondre.',
    emailMissing: 'Indiquez votre email pour recevoir ma réponse.',
    emailBad: 'Cette adresse email semble incomplète, vérifiez-la.',
    type: 'Choisissez le type de projet le plus proche.',
    msg: 'Décrivez votre projet en quelques phrases.',
    fix: 'Quelques champs sont à compléter avant l’envoi.',
    sending: 'Envoi en cours…',
    sentT: 'Message envoyé.',
    sentD: (n, e) => `Merci ${n} ! Je reviens vers vous très vite à ${e}.`,
    mailT: 'Votre message est prêt.',
    mailD: (to) => `Votre application mail vient de s’ouvrir avec le message pré-rempli : il ne reste qu’à cliquer sur Envoyer. Rien ne s’est ouvert ? Écrivez directement à ${to}.`,
    fail: 'L’envoi direct n’a pas abouti. Ouverture de votre application mail…',
  },
  en: {
    idle: 'WAITING FOR YOUR MESSAGE',
    live: 'TRANSCRIBING…',
    ready: 'MESSAGE READY TO SEND',
    name: 'Add your name so I know who to reply to.',
    emailMissing: 'Add your email so you can receive my reply.',
    emailBad: 'This email address looks incomplete. Please check it.',
    type: 'Pick the closest project type.',
    msg: 'Describe your project in a few sentences.',
    fix: 'A few fields need completing before sending.',
    sending: 'Sending…',
    sentT: 'Message sent.',
    sentD: (n, e) => `Thanks ${n}! I’ll get back to you shortly at ${e}.`,
    mailT: 'Your message is ready.',
    mailD: (to) => `Your email app just opened with the message filled in: all that’s left is to hit Send. Nothing opened? Write to ${to} directly.`,
    fail: 'Direct sending didn’t go through. Opening your email app…',
  },
};

// Libellés envoyés dans l'email (toujours en français, pour Bach)
export const TYPE_LABELS = {
  site: 'Site vitrine',
  platform: 'Plateforme web ou mobile',
  ai: 'Chatbot & IA',
  pm: 'Pilotage de projet',
  other: 'Autre',
};

export default formMessages;
