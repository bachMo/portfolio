import { usePrefs } from '../i18n/PrefsContext';
import { pathFor, localize } from '../routes';

/** L('contact') → « /contact » ou « /en/contact » selon la langue ; L('home', 'travaux') → « /#travaux » ou « /en/#travaux ». */
export default function useLink() {
  const { lang } = usePrefs();
  const L = (id, hash) => pathFor(id, lang, hash);
  L.loc = (href) => localize(href, lang);
  return L;
}
