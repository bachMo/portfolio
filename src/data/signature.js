// Projets signature (onglets SunuChat / Saaytu Mbay) — FR et EN
const signature = {
  "fr": {
    "sante": {
      "name": "SunuChat — santé publique",
      "h1": "Une question sur le paludisme ?",
      "h2": "En wolof, par écrit ou à voix haute.",
      "href": "#/sunuchat",
      "role": "Lead technique full-stack : architecture applicative et intégration des modèles de traitement du langage.",
      "ctx": "Projet de recherche de l'École Polytechnique de Thiès, partenaire de Jokalante, financé par Grand Challenges Canada.",
      "done": "Un assistant santé gratuit sur mobile, qui répond sur le paludisme et la dengue en wolof et en français, texte et audio.",
      "steps": [
        {
          "title": "Question",
          "desc": "Posée en wolof ou en français, par texte ou message audio.",
          "tech": "Web mobile",
          "hot": false
        },
        {
          "title": "Transcription",
          "desc": "L'audio wolof devient du texte exploitable.",
          "tech": "ASR wolof",
          "hot": false
        },
        {
          "title": "Compréhension",
          "desc": "L'intention et le sujet de santé sont identifiés.",
          "tech": "NLP · LLM",
          "hot": true
        },
        {
          "title": "Contenu santé",
          "desc": "Réponse ancrée dans des informations paludisme et dengue.",
          "tech": "Base de connaissances",
          "hot": false
        },
        {
          "title": "Voix",
          "desc": "La réponse est aussi générée en audio.",
          "tech": "TTS wolof",
          "hot": false
        },
        {
          "title": "Réponse",
          "desc": "Texte clair et audio, dans la langue de la question.",
          "tech": "sunuchat.com",
          "hot": false
        }
      ]
    },
    "agri": {
      "name": "Saaytu Mbay — agriculture",
      "h1": "Un agriculteur pose sa question à voix haute.",
      "h2": "En wolof. Sur WhatsApp.",
      "href": "#/saaytu",
      "role": "Développeur full-stack, chef de projet et point focal client : cadrage, coordination technique, feuille de route.",
      "ctx": "Chatbot agricole de Jokalante ; amélioration du TTS et enrichissement de la base de connaissance financés par AI Hub Sénégal.",
      "done": "Intégration des modèles NLP et du LLM, back-office React + FastAPI en production, cadrage CDP, ARTP et Meta.",
      "steps": [
        {
          "title": "Message vocal",
          "desc": "L'agriculteur parle en wolof ou en français sur WhatsApp.",
          "tech": "WhatsApp Business API",
          "hot": false
        },
        {
          "title": "Transcription",
          "desc": "Reconnaissance vocale wolof déployée sur GPU.",
          "tech": "MMS · Whisper",
          "hot": false
        },
        {
          "title": "Traduction",
          "desc": "Wolof ⇄ français dans les deux sens.",
          "tech": "m2m100",
          "hot": false
        },
        {
          "title": "Recherche",
          "desc": "Réponse ancrée dans une base de connaissance agricole.",
          "tech": "RAG · LLM",
          "hot": true
        },
        {
          "title": "Synthèse vocale",
          "desc": "La réponse redevient voix, en wolof.",
          "tech": "Parler-TTS",
          "hot": false
        },
        {
          "title": "Réponse",
          "desc": "Un message audio que l'on écoute au champ.",
          "tech": "API IA Wolof · RunPod",
          "hot": false
        }
      ]
    }
  },
  "en": {
    "sante": {
      "name": "SunuChat — public health",
      "h1": "A question about malaria?",
      "h2": "In Wolof, typed or spoken.",
      "href": "#/sunuchat",
      "role": "Full-stack tech lead: application architecture and integration of the language processing models.",
      "ctx": "A research project of the Thiès Polytechnic School, a Jokalante partner, funded by Grand Challenges Canada.",
      "done": "A free mobile health assistant that answers questions about malaria and dengue in Wolof and French, by text and audio.",
      "steps": [
        {
          "title": "Question",
          "desc": "Asked in Wolof or French, as text or a voice note.",
          "tech": "Mobile web",
          "hot": false
        },
        {
          "title": "Transcription",
          "desc": "Wolof audio becomes usable text.",
          "tech": "Wolof ASR",
          "hot": false
        },
        {
          "title": "Understanding",
          "desc": "The intent and health topic are identified.",
          "tech": "NLP · LLM",
          "hot": true
        },
        {
          "title": "Health content",
          "desc": "Answers grounded in malaria and dengue information.",
          "tech": "Knowledge base",
          "hot": false
        },
        {
          "title": "Voice",
          "desc": "The answer is also generated as audio.",
          "tech": "Wolof TTS",
          "hot": false
        },
        {
          "title": "Answer",
          "desc": "Clear text and audio, in the language of the question.",
          "tech": "sunuchat.com",
          "hot": false
        }
      ]
    },
    "agri": {
      "name": "Saaytu Mbay — farming",
      "h1": "A farmer asks a question out loud.",
      "h2": "In Wolof. On WhatsApp.",
      "href": "#/saaytu",
      "role": "Full-stack developer, project manager and client focal point: scoping, technical coordination, roadmap.",
      "ctx": "Jokalante’s farming chatbot; TTS improvements and knowledge base work funded by AI Hub Senegal.",
      "done": "NLP models and LLM integration, React + FastAPI back office in production, CDP, ARTP and Meta compliance.",
      "steps": [
        {
          "title": "Voice note",
          "desc": "The farmer speaks Wolof or French on WhatsApp.",
          "tech": "WhatsApp Business API",
          "hot": false
        },
        {
          "title": "Transcription",
          "desc": "Wolof speech recognition served on GPU.",
          "tech": "MMS · Whisper",
          "hot": false
        },
        {
          "title": "Translation",
          "desc": "Wolof ⇄ French, both ways.",
          "tech": "m2m100",
          "hot": false
        },
        {
          "title": "Retrieval",
          "desc": "An answer grounded in a farming knowledge base.",
          "tech": "RAG · LLM",
          "hot": true
        },
        {
          "title": "Speech",
          "desc": "The answer becomes voice again, in Wolof.",
          "tech": "Parler-TTS",
          "hot": false
        },
        {
          "title": "Answer",
          "desc": "An audio message you can play in the field.",
          "tech": "Wolof AI API · RunPod",
          "hot": false
        }
      ]
    }
  }
};

export default signature;
