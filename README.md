# Portfolio — Bachir Sy

Site portfolio de Mamadou Bachir Sy (React, `react-scripts` / Create React App).
Thème clair et sombre, français et anglais, formulaire de contact relié à EmailJS.

## 1. Démarrer

Prérequis : Node.js 18 ou plus récent.

```bash
npm install
npm start
```

Le site s'ouvre sur http://localhost:3000.

## 2. Recevoir les messages du formulaire (EmailJS)

Le fichier `.env` est déjà présent. Il ne manque que deux valeurs.

1. **Créer le modèle** sur https://dashboard.emailjs.com : *Email Templates → Create New Template*
   - **To Email** : `bachirsy26@gmail.com`
   - **From Name** : `{{name}}`
   - **Reply To** : `{{reply_to}}`
   - **Subject** : `{{title}}`
   - **Content** :
     ```
     Nouveau message depuis le portfolio

     Nom : {{name}}
     Email : {{email}}
     Organisation : {{organisation}}
     Type de projet : {{project_type}}
     Budget : {{budget}}
     Délai : {{delai}}
     Langue du visiteur : {{lang}}

     Message :
     {{message}}
     ```
   Enregistrez et copiez le **Template ID**.
2. **Clé publique** : *Account → General → Public Key*.
3. **Remplir `.env`** :
   ```
   REACT_APP_EMAILJS_SERVICE_ID=service_zvbcs6f
   REACT_APP_EMAILJS_TEMPLATE_ID=template_xxxxxxx
   REACT_APP_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
   ```
4. **Redémarrer** `npm start` : les variables `.env` ne sont lues qu'au démarrage.
5. **Sécurité** : dans *Account → Security*, n'autorisez que votre domaine.

Tant que ces valeurs sont vides, ou si l'envoi échoue, le formulaire ouvre l'application mail
du visiteur avec le message pré-rempli : aucun contact n'est perdu.

### Liens optionnels
- `REACT_APP_GITHUB_URL` : le bouton GitHub apparaît dès qu'il est rempli.
- `REACT_APP_CV_URL` : déposez votre CV dans `public/` (ex. `public/cv-bach-sy.pdf`) puis mettez `/cv-bach-sy.pdf`.

## 3. Déployer

**Vercel** (recommandé)
1. Poussez le projet sur GitHub (le `.env` est ignoré par git, c'est voulu).
2. Sur vercel.com : *Add New → Project*, importez le dépôt. Vercel détecte Create React App.
3. Dans *Settings → Environment Variables*, ajoutez les mêmes variables que dans `.env`.
4. Déployez. Branchez ensuite votre nom de domaine dans *Settings → Domains*.

**Netlify** : build `npm run build`, dossier publié `build`, mêmes variables d'environnement.

Le site utilise des adresses du type `#/contact` : il fonctionne sur n'importe quel hébergement
statique sans configuration de redirection.

## 4. Structure

```
src/
  styles/global.css      Design system complet (couleurs, typo, animations, responsive)
  i18n/fr.js, en.js      Tous les textes FR / EN (mêmes clés)
  i18n/PrefsContext.js   Langue + thème (mémorisés dans le navigateur)
  data/                  Projets signature, projets en équipe, messages du formulaire
  components/            Nav, Waveform, Tx (titres « transcrits »), Signature, TeamRail,
                         ContactForm (EmailJS), ThemeToggle, LangSwitch, Footer…
  pages/                 Home, CaseSunuChat, CaseSaaytu, CaseWaluma, Contact
  assets/                Captures des projets
  config.js              Lecture des variables .env
```

- **Modifier un texte** : `src/i18n/fr.js` et `src/i18n/en.js`.
- **Ajouter un projet en équipe** : `src/data/team.js`.
- **Remplacer une capture** : `src/assets/`.

## Notes
- Create React App n'est plus maintenu activement par l'équipe React, mais `react-scripts 5`
  fonctionne sans problème pour ce site. Le build a été vérifié (`CI=true npm run build`,
  sans avertissement).
- Les chiffres `[X]` des études de cas sont à compléter dans `src/pages/CaseSunuChat.js`
  et `src/pages/CaseSaaytu.js`.
