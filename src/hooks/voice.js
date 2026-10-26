// Mode voix : l'onde du hero réagit au micro du visiteur.
// Rien n'est enregistré ni envoyé : le son est analysé en direct, dans le navigateur.

let ctx = null;
let analyser = null;
let stream = null;
let freq = null;
let wave = null;
const listeners = new Set();

// Bandes de fréquences (Hz) qui pilotent chaque vague, de la plus grave à la plus aiguë.
const BANDS = [[70, 160], [160, 320], [320, 640], [640, 1300], [1300, 2600], [2600, 5200]];

// Hauteur de la voix par autocorrélation (70–500 Hz). Renvoie 0 si rien de net.
function detectPitch(buf, rate) {
  const n = buf.length;
  let rms = 0;
  for (let i = 0; i < n; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / n);
  if (rms < 0.012) return 0;
  const minLag = Math.floor(rate / 500);
  const maxLag = Math.min(Math.floor(rate / 70), n >> 1);
  const corr = new Float32Array(maxLag + 2);
  let max = 0;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let s = 0, e1 = 0, e2 = 0;
    for (let i = 0; i < n - lag; i += 2) {
      s += buf[i] * buf[i + lag];
      e1 += buf[i] * buf[i];
      e2 += buf[i + lag] * buf[i + lag];
    }
    corr[lag] = s / (Math.sqrt(e1 * e2) || 1);
    if (corr[lag] > max) max = corr[lag];
  }
  // premier pic local assez haut : évite de tomber une octave trop bas
  let best = 0, bestLag = 0;
  for (let lag = minLag + 1; lag < maxLag; lag++) {
    const c = corr[lag];
    if (c >= max * 0.9 && c >= corr[lag - 1] && c >= corr[lag + 1]) { best = c; bestLag = lag; break; }
  }
  if (best < 0.55 || !bestLag) return 0;
  // interpolation parabolique autour du pic
  const a = corr[bestLag - 1] || best, b = best, c = corr[bestLag + 1] || best;
  const shift = (a - c) / (2 * (a - 2 * b + c) || 1);
  return rate / (bestLag + (Number.isFinite(shift) ? shift : 0));
}

export const voice = {
  active: false,
  // Dernier état calculé par l'onde (lu par l'affichage sous le bouton).
  state: { intensity: 0, pitch: 0, register: 0.5, color: '#E0703F' },
  async start() {
    if (voice.active) return true;
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    if (ctx.state === 'suspended') await ctx.resume();
    const src = ctx.createMediaStreamSource(stream);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.6;
    src.connect(analyser);
    freq = new Uint8Array(analyser.frequencyBinCount);
    wave = new Float32Array(analyser.fftSize);
    voice.active = true;
    listeners.forEach((fn) => fn(true));
    return true;
  },
  stop() {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    if (ctx) ctx.close();
    ctx = analyser = stream = freq = wave = null;
    voice.active = false;
    voice.state = { intensity: 0, pitch: 0, register: 0.5, color: voice.state.color };
    listeners.forEach((fn) => fn(false));
  },
  // Analyse d'une image : intensité (0..1), énergie par bande (0..1), hauteur (Hz).
  analyse() {
    if (!analyser) return null;
    analyser.getByteFrequencyData(freq);
    analyser.getFloatTimeDomainData(wave);
    const rate = ctx.sampleRate;
    const hz = rate / analyser.fftSize;
    const bands = BANDS.map(([lo, hi]) => {
      const a = Math.max(1, Math.floor(lo / hz)), b = Math.min(freq.length - 1, Math.ceil(hi / hz));
      let m = 0, s = 0;
      for (let i = a; i <= b; i++) { m = Math.max(m, freq[i]); s += freq[i]; }
      const v = (0.6 * m + 0.4 * (s / (b - a + 1))) / 255;
      return Math.min(1, Math.max(0, (v - 0.18) / 0.62));
    });
    let rms = 0;
    for (let i = 0; i < wave.length; i++) rms += wave[i] * wave[i];
    rms = Math.sqrt(rms / wave.length);
    const intensity = Math.min(1, Math.max(0, (Math.log10(rms + 1e-6) + 2.5) / 2.1));
    return { intensity, bands, pitch: detectPitch(wave, rate) };
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
