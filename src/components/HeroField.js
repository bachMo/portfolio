import { useEffect, useRef } from 'react';
import { prefersReducedMotion, hasFinePointer } from '../hooks/motion';

/*
 * Champ d'ondes du hero (WebGL, sans librairie) :
 * des lignes de niveau qui ondulent lentement comme une carte topographique
 * ou une onde sonore, aux couleurs du site. Le curseur y lance des ondes,
 * le défilement les fait dériver. Rendu léger : résolution réduite, 30 i/s,
 * pause hors écran, une seule image si l'utilisateur réduit les animations.
 */

const VERT = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
const FRAG = `
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;
uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform float uHover;uniform float uScroll;
uniform vec3 uCol;uniform vec3 uCol2;uniform float uAlpha;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  float t=uTime*.045;
  vec2 q=vec2(fbm(p*1.3+vec2(t,-t*.6)),fbm(p*1.3+vec2(-t*.8,t)+3.1));
  float h=fbm(p*1.1+q*1.4+vec2(0.,uScroll*.6));
  vec2 m=(uMouse-.5*uRes)/uRes.y;float d=length(p-m);
  h+=uHover*.075*exp(-d*d*5.)*sin(d*30.-uTime*2.6);
  float L=h*22.;float f=fract(L);
#ifdef GL_OES_standard_derivatives
  float w=fwidth(L)*1.1;
#else
  float w=.06;
#endif
  float line=1.-smoothstep(0.,w,min(f,1.-f));
  float major=step(3.5,mod(floor(L+.5),5.));
  float a=line*(.38+.62*major);
  float mask=(.25+.75*smoothstep(.05,.85,uv.x))*smoothstep(0.,.3,uv.y);
  mask*=1.+uHover*.6*exp(-d*d*4.);
  vec3 col=mix(uCol2,uCol,smoothstep(.35,.65,h));
  float al=clamp(a*mask*uAlpha,0.,1.);
  gl_FragColor=vec4(col*al,al);
}`;

const hex = (s) => {
  const m = s.trim().replace('#', '');
  const v = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255);
};

export default function HeroField() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    let gl;
    try { gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'low-power' }); } catch (e) { gl = null; }
    if (!gl) { canvas.remove(); return undefined; }
    gl.getExtension('OES_standard_derivatives');
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return undefined; }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {};
    ['uRes', 'uTime', 'uMouse', 'uHover', 'uScroll', 'uCol', 'uCol2', 'uAlpha'].forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });

    // Couleurs lues dans le thème (clair / sombre), relues quand le thème change.
    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      const dark = cs.getPropertyValue('--bg').trim().toLowerCase().startsWith('#1');
      gl.uniform3fv(U.uCol, hex(cs.getPropertyValue('--accent') || '#C4552B'));
      gl.uniform3fv(U.uCol2, hex((cs.getPropertyValue('--bar2') || '').trim().startsWith('#') && !dark ? cs.getPropertyValue('--bar2') : '#E9A54B'));
      gl.uniform1f(U.uAlpha, dark ? 0.2 : 0.26);
    };
    readColors();
    const mo = new MutationObserver(readColors);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onMq = () => readColors();
    if (mq.addEventListener) mq.addEventListener('change', onMq);

    const still = prefersReducedMotion();
    let W = 0; let H = 0;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const k = Math.min(window.devicePixelRatio || 1, 1.5) * (r.width > 1200 ? 0.6 : 0.75);
      W = Math.max(1, Math.round(r.width * k)); H = Math.max(1, Math.round(r.height * k));
      canvas.width = W; canvas.height = H;
      gl.viewport(0, 0, W, H);
      gl.uniform2f(U.uRes, W, H);
    };
    resize();

    const mouse = { x: W * 0.7, y: H * 0.5, tx: W * 0.7, ty: H * 0.5, hover: 0, th: 0 };
    const fine = hasFinePointer();
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.tx = ((e.clientX - r.left) / r.width) * W;
      mouse.ty = (1 - (e.clientY - r.top) / r.height) * H;
      mouse.th = e.clientY < r.bottom ? 1 : 0;
    };
    const onLeave = () => { mouse.th = 0; };
    if (fine && !still) { window.addEventListener('pointermove', onMove, { passive: true }); document.addEventListener('pointerleave', onLeave); }

    let visible = true; let raf = 0; let last = 0; const t0 = performance.now();
    const draw = (now) => {
      raf = 0;
      if (!visible || document.hidden) return;
      if (now - last >= 33) {
        last = now;
        mouse.x += (mouse.tx - mouse.x) * 0.08; mouse.y += (mouse.ty - mouse.y) * 0.08;
        mouse.hover += (mouse.th - mouse.hover) * 0.05;
        gl.uniform1f(U.uTime, (now - t0) / 1000);
        gl.uniform2f(U.uMouse, mouse.x, mouse.y);
        gl.uniform1f(U.uHover, mouse.hover);
        gl.uniform1f(U.uScroll, window.scrollY / Math.max(1, window.innerHeight));
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      if (!still) raf = requestAnimationFrame(draw);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }, { threshold: 0 });
    io.observe(canvas);
    const onResize = () => { resize(); if (still) { last = 0; kick(); } };
    window.addEventListener('resize', onResize);
    const onVis = () => kick();
    document.addEventListener('visibilitychange', onVis);
    if (still) { gl.uniform1f(U.uTime, 12); gl.uniform1f(U.uHover, 0); gl.uniform2f(U.uMouse, 0, 0); gl.uniform1f(U.uScroll, 0); gl.drawArrays(gl.TRIANGLES, 0, 3); } else kick();
    canvas.classList.add('on');

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect(); mo.disconnect();
      if (mq.removeEventListener) mq.removeEventListener('change', onMq);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      const lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    };
  }, []);
  return <canvas ref={ref} className="hero-field" aria-hidden="true" />;
}
