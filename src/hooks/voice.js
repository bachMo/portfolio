// Mode voix : l'onde du hero réagit au micro du visiteur.
// Rien n'est enregistré ni envoyé : le son est analysé en direct, dans le navigateur.

let ctx = null;
let analyser = null;
let stream = null;
let data = null;
const listeners = new Set();

export const voice = {
  active: false,
  async start() {
    if (voice.active) return true;
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    const src = ctx.createMediaStreamSource(stream);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.72;
    src.connect(analyser);
    data = new Uint8Array(analyser.frequencyBinCount);
    voice.active = true;
    listeners.forEach((fn) => fn(true));
    return true;
  },
  stop() {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    if (ctx) ctx.close();
    ctx = analyser = stream = data = null;
    voice.active = false;
    listeners.forEach((fn) => fn(false));
  },
  // Niveaux 0..1 pour n barres, en miroir autour du centre (voix grave au milieu).
  levels(n) {
    if (!analyser) return null;
    analyser.getByteFrequencyData(data);
    const usable = Math.floor(data.length * 0.35); // ~0–7,7 kHz : la zone de la voix
    const half = Math.ceil(n / 2);
    const lv = new Array(half);
    for (let k = 0; k < half; k++) {
      const a = Math.floor((k / half) * usable);
      const b = Math.max(a + 1, Math.floor(((k + 1) / half) * usable));
      let m = 0;
      for (let j = a; j < b; j++) m = Math.max(m, data[j]);
      lv[k] = Math.min(1, Math.pow(m / 255, 1.6) * 1.35);
    }
    const mid = (n - 1) / 2;
    const out = new Array(n);
    for (let i = 0; i < n; i++) {
      const d = Math.abs(i - mid) / mid;
      out[i] = lv[Math.min(half - 1, Math.floor(d * half))];
    }
    return out;
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
