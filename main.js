// main.js — Three.js setup, scene, camera, axes, grid, render loop, UI
import { SOLIDS } from './data.js';

// ═══ RENDERER & SCENE ════════════════════════════════════════════
const canvas = document.getElementById('cv');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 300);

function resize() {
  const p = canvas.parentElement;
  renderer.setSize(p.clientWidth, p.clientHeight);
  camera.aspect = p.clientWidth / p.clientHeight;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

// ═══ LIGHTS ══════════════════════════════════════════════════════
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const dL1 = new THREE.DirectionalLight(0xccd8ff, 1.1); dL1.position.set(6,9,5);   scene.add(dL1);
const dL2 = new THREE.DirectionalLight(0xffa080, 0.4); dL2.position.set(-5,-3,-4); scene.add(dL2);
const dL3 = new THREE.DirectionalLight(0x80ffc0, 0.2); dL3.position.set(0,-8,2);   scene.add(dL3);

// ═══ COORDINATE MAPPING ══════════════════════════════════════════
// Math (x,y,z) with z-up  →  Scene: math-x→sceneZ, math-y→sceneX, math-z→sceneY
// Axis colors: x=blue(#5577e0), y=red(#e05555), z=green(#55c055)
export function V3m(mx, my, mz) { return new THREE.Vector3(my, mz, mx); }

// ═══ AXES ════════════════════════════════════════════════════════
const AXLEN = 3.5;

function makeLine(p1, p2, color) {
  const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...p1), new THREE.Vector3(...p2)]);
  return new THREE.Line(g, new THREE.LineBasicMaterial({ color }));
}
function makeArrow(pos, dir, color) {
  const g = new THREE.ConeGeometry(0.06, 0.22, 8);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color }));
  m.position.set(...pos);
  const ax    = new THREE.Vector3(0,1,0).cross(new THREE.Vector3(...dir));
  const angle = Math.acos(Math.min(1, new THREE.Vector3(0,1,0).dot(new THREE.Vector3(...dir))));
  if (ax.length() > 0.001) m.quaternion.setFromAxisAngle(ax.normalize(), angle);
  return m;
}
function makeSprite(text, pos, color) {
  const c = document.createElement('canvas'); c.width=64; c.height=64;
  const ctx = c.getContext('2d');
  ctx.font='bold 40px serif'; ctx.fillStyle=color; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(text, 32, 32);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true }));
  sp.scale.set(0.4, 0.4, 1); sp.position.set(...pos); return sp;
}
function makeTick(pos, color) {
  const g = new THREE.SphereGeometry(0.045, 8, 6);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color }));
  m.position.set(...pos); return m;
}

const axGroup = new THREE.Group();

// x → scene Z (blue)
axGroup.add(makeLine([0,0,-0.2], [0,0,AXLEN], 0x5577e0));
axGroup.add(makeArrow([0,0,AXLEN], [0,0,1], 0x5577e0));
axGroup.add(makeSprite('x', [0,0,AXLEN+0.38], '#5577e0'));
for (let i=1; i<=3; i++) axGroup.add(makeTick([0,0,i], 0x5577e0));

// y → scene X (red)
axGroup.add(makeLine([-0.2,0,0], [AXLEN,0,0], 0xe05555));
axGroup.add(makeArrow([AXLEN,0,0], [1,0,0], 0xe05555));
axGroup.add(makeSprite('y', [AXLEN+0.38,0,0], '#e05555'));
for (let i=1; i<=3; i++) axGroup.add(makeTick([i,0,0], 0xe05555));

// z → scene Y (green)
axGroup.add(makeLine([0,-0.2,0], [0,AXLEN,0], 0x55c055));
axGroup.add(makeArrow([0,AXLEN,0], [0,1,0], 0x55c055));
axGroup.add(makeSprite('z', [0,AXLEN+0.38,0], '#55c055'));
for (let i=1; i<=3; i++) axGroup.add(makeTick([0,i,0], 0x55c055));

scene.add(axGroup);

// ═══ GRID (math XY plane = scene XZ plane) ═══════════════════════
const gridXY = new THREE.GridHelper(8, 16, 0x4a5470, 0x2e3850);
gridXY.material.opacity = 0.5;
gridXY.material.transparent = true;
scene.add(gridXY);

// ═══ GEOMETRY HELPERS (shared with solid builders) ════════════════
export function paramGeo(fn, uN, vN) {
  const pos = [], idx = [];
  for (let i=0; i<=uN; i++) for (let j=0; j<=vN; j++) {
    const p = fn(i/uN, j/vN); pos.push(p.x, p.y, p.z);
  }
  for (let i=0; i<uN; i++) for (let j=0; j<vN; j++) {
    const a=i*(vN+1)+j, b=a+1, c=a+vN+1, d=c+1;
    idx.push(a,c,b, b,c,d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx); g.computeVertexNormals(); return g;
}

export function addSurf(grp, geo, color, opacity=0.72) {
  const mat = new THREE.MeshPhongMaterial({
    color, transparent:true, opacity,
    side: THREE.DoubleSide, shininess:80, specular:0x2244aa,
    depthWrite: opacity > 0.5,
  });
  grp.add(new THREE.Mesh(geo, mat));
}

const helpers = { V3m, paramGeo, addSurf };

// ═══ SOLID GROUP ══════════════════════════════════════════════════
let solidGrp = new THREE.Group();
scene.add(solidGrp);
function clearSolid() { scene.remove(solidGrp); solidGrp = new THREE.Group(); scene.add(solidGrp); }

// ═══ ORBIT CAMERA ════════════════════════════════════════════════
let theta=0.55, phi=0.68, radius=11, panX=0, panY=1.2;
let isDrag=false, isRMB=false, lx=0, ly=0;

function camUpdate() {
  camera.position.set(
    panX + radius*Math.sin(phi)*Math.sin(theta),
    panY + radius*Math.cos(phi),
    radius*Math.sin(phi)*Math.cos(theta)
  );
  camera.lookAt(panX, panY, 0);
}
camUpdate();

canvas.addEventListener('mousedown', e => { isDrag=true; isRMB=e.button===2; lx=e.clientX; ly=e.clientY; e.preventDefault(); });
canvas.addEventListener('contextmenu', e => e.preventDefault());
window.addEventListener('mouseup', () => isDrag=false);
window.addEventListener('mousemove', e => {
  if (!isDrag) return;
  const dx=e.clientX-lx, dy=e.clientY-ly; lx=e.clientX; ly=e.clientY;
  if (isRMB) { panX-=dx*0.009; panY+=dy*0.009; }
  else { theta-=dx*0.007; phi=Math.max(0.05, Math.min(Math.PI-0.05, phi+dy*0.007)); }
  camUpdate();
});
canvas.addEventListener('wheel', e => {
  radius = Math.max(2, Math.min(35, radius+e.deltaY*0.016)); camUpdate();
}, { passive: true });

let pinchStart = null;
canvas.addEventListener('touchstart', e => {
  if (e.touches.length===1) { isDrag=true; isRMB=false; lx=e.touches[0].clientX; ly=e.touches[0].clientY; }
  else if (e.touches.length===2) pinchStart=Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
}, { passive: true });
canvas.addEventListener('touchend', () => { isDrag=false; pinchStart=null; });
canvas.addEventListener('touchmove', e => {
  if (e.touches.length===1 && isDrag) {
    const dx=e.touches[0].clientX-lx, dy=e.touches[0].clientY-ly;
    lx=e.touches[0].clientX; ly=e.touches[0].clientY;
    theta-=dx*0.007; phi=Math.max(0.05, Math.min(Math.PI-0.05, phi+dy*0.007)); camUpdate();
  } else if (e.touches.length===2 && pinchStart!==null) {
    const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
    radius=Math.max(2, Math.min(35, radius-(d-pinchStart)*0.04)); pinchStart=d; camUpdate();
  }
}, { passive: true });

// ═══ SIDEBAR ═════════════════════════════════════════════════════
const listEl = document.getElementById('solidList');
SOLIDS.forEach((s, i) => {
  const btn = document.createElement('button');
  btn.className = 's-btn';
  btn.innerHTML = `<div class="n">${s.num}</div><div class="t">${s.title}</div><div class="c">${s.coord}</div>`;
  btn.addEventListener('click', () => select(i));
  listEl.appendChild(btn);
});

function select(idx) {
  document.querySelectorAll('.s-btn').forEach((b, i) => b.classList.toggle('active', i===idx));
  const s = SOLIDS[idx];

  clearSolid();
  s.build(solidGrp, helpers);

  theta=s.cam.th; phi=s.cam.ph; radius=s.cam.r; panX=0; panY=s.cam.py;
  camUpdate();

  document.getElementById('overlayName').textContent = s.fullTitle;

  const ib = document.getElementById('integralBox');
  ib.innerHTML = `\\(${s.integral}\\)`;
  if (window.MathJax) MathJax.typesetPromise([ib]).catch(() => {});

  document.getElementById('descWrap').innerHTML = `
    <div class="info-label l2">Descripción</div>
    <div class="desc-title">${s.fullTitle}</div>
    <p style="font-size:0.78rem;color:var(--text2);margin-bottom:10px;line-height:1.5">${s.desc}</p>
    <div class="tags">${s.constraints.map(c => `<span class="tag-item">${c}</span>`).join('')}</div>
  `;
}

// ═══ RENDER LOOP ══════════════════════════════════════════════════
(function loop() { requestAnimationFrame(loop); renderer.render(scene, camera); })();

select(0);
