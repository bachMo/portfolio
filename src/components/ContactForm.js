import { useEffect, useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { usePrefs } from '../i18n/PrefsContext';
import { CONFIG, emailjsReady } from '../config';
import { prefersReducedMotion } from '../hooks/motion';
import formMessages, { TYPE_LABELS } from '../data/formMessages';

const TYPES = ['site', 'platform', 'ai', 'pm', 'other'];
const BUDGETS = ['b1', 'b2', 'b3', 'b4', 'b5'];
const DELAYS = ['d1', 'd2', 'd3', 'd4'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const html = (s) => ({ __html: s });

/** Onde en haut du formulaire : elle « écoute » la frappe du visiteur. */
function useVoice(barsRef) {
  const levels = useRef([]);
  const looping = useRef(false);
  useEffect(() => {
    const el = barsRef.current;
    const n = window.innerWidth < 760 ? 36 : 64;
    el.innerHTML = '';
    levels.current = [];
    for (let i = 0; i < n; i++) {
      const b = document.createElement('i');
      if (i % 9 === 4) b.className = 'hot';
      el.appendChild(b);
      levels.current.push(0.06);
    }
  }, [barsRef]);

  const frame = () => {
    const bars = barsRef.current ? barsRef.current.children : [];
    let alive = false;
    levels.current.forEach((v, i) => {
      const nv = v + (0.06 - v) * 0.08;
      levels.current[i] = nv;
      if (nv > 0.07) alive = true;
      if (bars[i]) bars[i].style.transform = `scaleY(${nv.toFixed(3)})`;
    });
    if (alive) requestAnimationFrame(frame);
    else looping.current = false;
  };

  return (strength) => {
    if (prefersReducedMotion()) return;
    const lv = levels.current;
    const c = Math.floor(Math.random() * lv.length);
    for (let k = -5; k <= 5; k++) {
      const j = c + k;
      if (j < 0 || j >= lv.length) continue;
      lv[j] = Math.min(1, Math.max(lv[j], Math.exp(-(k * k) / 8) * strength * (0.6 + Math.random() * 0.4)));
    }
    if (!looping.current) { looping.current = true; requestAnimationFrame(frame); }
  };
}

export default function ContactForm() {
  const { lang, t } = usePrefs();
  const M = formMessages[lang];
  const formRef = useRef(null);
  const barsRef = useRef(null);
  const sentRef = useRef(null);
  const idleTimer = useRef(null);
  const speak = useVoice(barsRef);

  const [voice, setVoice] = useState('idle'); // idle | live | ready
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  const [count, setCount] = useState(0);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(null); // { title, text }

  // changement de langue : on efface les messages d'erreur (ils seraient dans l'autre langue)
  useEffect(() => { setErrors({}); setStatus(''); }, [lang]);
  useEffect(() => () => clearTimeout(idleTimer.current), []);
  useEffect(() => {
    if (sent && sentRef.current) sentRef.current.focus();
  }, [sent]);

  const read = () => {
    const f = formRef.current.elements;
    const type = f.type.value;
    const optText = (sel) => (sel.value ? sel.options[sel.selectedIndex].text : '');
    return {
      name: f.nom.value.trim(),
      email: f.email.value.trim(),
      organisation: f.organisation.value.trim(),
      typeKey: type,
      type: type ? TYPE_LABELS[type] : '',
      budget: optText(f.budget),
      delai: optText(f.delai),
      message: f.message.value.trim(),
      bot: f.botcheck.value,
      lang: lang.toUpperCase(),
    };
  };

  const isFilled = (d) => d.name && d.email && d.message && d.typeKey;

  const onInput = (e) => {
    const tag = e.target.tagName;
    speak(tag === 'TEXTAREA' ? 0.9 : e.target.type === 'radio' || tag === 'SELECT' ? 1 : 0.7);
    if (e.target.name === 'message') setCount(e.target.value.length);
    setVoice('live');
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setVoice(isFilled(read()) ? 'ready' : 'idle'), 900);
    // efface l'erreur du champ dès qu'il est corrigé
    const map = { nom: 'name', email: 'email', message: 'msg', type: 'type' };
    const key = map[e.target.name];
    if (key && errors[key]) setErrors((p) => ({ ...p, [key]: '' }));
  };

  const validate = (d) => {
    const errs = {};
    if (!d.name) errs.name = M.name;
    if (!d.email) errs.email = M.emailMissing;
    else if (!EMAIL_RE.test(d.email)) errs.email = M.emailBad;
    if (!d.typeKey) errs.type = M.type;
    if (d.message.length < 10) errs.msg = M.msg;
    setErrors(errs);
    const order = [['name', 'nom'], ['email', 'email'], ['type', 'type'], ['msg', 'message']];
    const first = order.find(([k]) => errs[k]);
    if (first) {
      const el = formRef.current.elements[first[1]];
      (el.length ? el[0] : el).focus();
    }
    return !first;
  };

  const mailtoFallback = (d) => {
    const subject = `Nouveau projet — ${d.type} — ${d.name}`;
    const body =
      `Nom : ${d.name}\nEmail : ${d.email}` +
      (d.organisation ? `\nOrganisation : ${d.organisation}` : '') +
      `\nType de projet : ${d.type}\nLangue du visiteur : ${d.lang}` +
      (d.budget ? `\nBudget : ${d.budget}` : '') +
      (d.delai ? `\nDélai : ${d.delai}` : '') +
      `\n\n${d.message}`;
    window.location.href = `mailto:${CONFIG.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent({ title: M.mailT, text: M.mailD(CONFIG.contactEmail) });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    const d = read();
    if (d.bot) return; // robot
    if (!validate(d)) { setStatus(M.fix); return; }
    if (!emailjsReady()) { mailtoFallback(d); return; }

    setSending(true);
    speak(1);
    try {
      await emailjs.send(
        CONFIG.emailjs.serviceId,
        CONFIG.emailjs.templateId,
        {
          title: `Nouveau projet — ${d.type} — ${d.name}`,
          name: d.name,
          email: d.email,
          reply_to: d.email,
          organisation: d.organisation || '—',
          project_type: d.type,
          budget: d.budget || '—',
          delai: d.delai || '—',
          lang: d.lang,
          message: d.message,
        },
        { publicKey: CONFIG.emailjs.publicKey }
      );
      setSent({ title: M.sentT, text: M.sentD(d.name.split(' ')[0], d.email) });
      formRef.current.reset();
      setCount(0);
      setVoice('idle');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('EmailJS :', err);
      setStatus(M.fail);
      setTimeout(() => mailtoFallback(d), 900);
    } finally {
      setSending(false);
    }
  };

  const again = () => {
    setSent(null);
    setTimeout(() => formRef.current && formRef.current.elements.nom.focus(), 0);
  };

  const field = (k) => 'field' + (errors[k] ? ' invalid' : '');

  return (
    <div className="cp-form-wrap">
      <form ref={formRef} className="cp-form" noValidate hidden={!!sent} onSubmit={onSubmit} onChange={onInput}>
        <div className={'voice' + (voice === 'live' ? ' live' : '')} aria-hidden="true">
          <div className="voice-bars" ref={barsRef} />
          <span className="mono voice-label">{M[voice]}</span>
        </div>

        <div className="grid2">
          <div className={field('name')}>
            <label htmlFor="f-name"><span dangerouslySetInnerHTML={html(t('cp.name'))} /> <span className="req">*</span></label>
            <input id="f-name" name="nom" type="text" autoComplete="name" required aria-invalid={!!errors.name} aria-describedby="e-name" />
            <p className="err" id="e-name">{errors.name}</p>
          </div>
          <div className={field('email')}>
            <label htmlFor="f-email">Email <span className="req">*</span></label>
            <input id="f-email" name="email" type="email" autoComplete="email" required aria-invalid={!!errors.email} aria-describedby="e-email" />
            <p className="err" id="e-email">{errors.email}</p>
          </div>
        </div>

        <div className="field">
          <label htmlFor="f-org"><span dangerouslySetInnerHTML={html(t('cp.org'))} /> <span className="opt" dangerouslySetInnerHTML={html(t('cp.opt'))} /></label>
          <input id="f-org" name="organisation" type="text" autoComplete="organization" />
        </div>

        <fieldset className={field('type')}>
          <legend><span dangerouslySetInnerHTML={html(t('cp.type'))} /> <span className="req">*</span></legend>
          <div className="chips-select">
            {TYPES.map((v) => (
              <label key={v}>
                <input type="radio" name="type" value={v} />
                <span dangerouslySetInnerHTML={html(t('t.' + v))} />
              </label>
            ))}
          </div>
          <p className="err" id="e-type">{errors.type}</p>
        </fieldset>

        <div className="grid2">
          <div className="field">
            <label htmlFor="f-budget" dangerouslySetInnerHTML={html(t('cp.budget'))} />
            <select id="f-budget" name="budget" defaultValue="">
              <option value="">{t('cp.choose')}</option>
              {BUDGETS.map((v) => <option key={v} value={v}>{t(v)}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="f-delay" dangerouslySetInnerHTML={html(t('cp.delay'))} />
            <select id="f-delay" name="delai" defaultValue="">
              <option value="">{t('cp.choose')}</option>
              {DELAYS.map((v) => <option key={v} value={v}>{t(v)}</option>)}
            </select>
          </div>
        </div>

        <div className={field('msg')}>
          <label htmlFor="f-msg"><span dangerouslySetInnerHTML={html(t('cp.msg'))} /> <span className="req">*</span></label>
          <textarea id="f-msg" name="message" rows="6" maxLength="3000" required placeholder={t('cp.msg.ph')} aria-invalid={!!errors.msg} aria-describedby="e-msg" />
          <div className="field-foot">
            <p className="err" id="e-msg">{errors.msg}</p>
            <span className="mono muted">{count} / 3000</span>
          </div>
        </div>

        <input type="text" name="botcheck" className="hp" tabIndex="-1" autoComplete="off" aria-hidden="true" />

        <div className="submit-row">
          <button type="submit" className="pill solid magnetic send" disabled={sending}>
            <span className="send-label">{sending ? M.sending : <span dangerouslySetInnerHTML={html(t('cp.send'))} />}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
          </button>
          <p className="muted small" dangerouslySetInnerHTML={html(t('cp.privacy'))} />
        </div>
        <p className="status" role="status" aria-live="polite">{status}</p>
      </form>

      {sent && (
        <div className="sent on" ref={sentRef} tabIndex="-1">
          <svg className="sent-mark" width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden="true">
            <circle cx="48" cy="48" r="46" stroke="var(--line-2)" strokeWidth="2" />
            <path className="draw" d="M28 50 L42 63 L68 34" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h2>{sent.title}</h2>
          <p className="muted">{sent.text}</p>
          <button className="pill" type="button" onClick={again} dangerouslySetInnerHTML={html(t('cp.again'))} />
        </div>
      )}
    </div>
  );
}
