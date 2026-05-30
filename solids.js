// solids.js — constructores geométricos de cada sólido
// Todas las coordenadas siguen la convención matemática (x,y horizontales; z=arriba).
// V3m(mx,my,mz) se importa desde main.js a través de la configuración compartida de la escena.
// Cada función recibe (grp, helpers) donde helpers = { V3m, paramGeo, addSurf }

export function buildSolid1(grp, { V3m, paramGeo, addSurf }) {
  // Exterior al cono z=r, interior al cilindro r=1, z≥0
  const coneTop = paramGeo((u,v) => { const th=u*Math.PI*2, r=v; return V3m(r*Math.cos(th), r*Math.sin(th), r); }, 72, 40);
  addSurf(grp, coneTop, 0xf5a05d, 0.7);
  const bot = paramGeo((u,v) => V3m(v*Math.cos(u*Math.PI*2), v*Math.sin(u*Math.PI*2), 0), 72, 30);
  addSurf(grp, bot, 0x6b95ff, 0.4);
  const cyl = paramGeo((u,v) => V3m(Math.cos(u*Math.PI*2), Math.sin(u*Math.PI*2), v), 72, 1);
  addSurf(grp, cyl, 0x6b95ff, 0.2);
  for (let ri=0.2; ri<=0.9; ri+=0.2) {
    const ring = paramGeo((u,v) => V3m(ri*Math.cos(u*Math.PI*2), ri*Math.sin(u*Math.PI*2), v*ri), 72, 1);
    addSurf(grp, ring, 0x8aabff, 0.1);
  }
}

export function buildSolid2A(grp, { V3m, paramGeo, addSurf }) {
  // Fuera del cono, entre esferas ρ=1 y ρ=3, φ∈[π/4, 3π/4]
  const S = 0.6;
  const outerSph = paramGeo((u,v) => {
    const th=u*Math.PI*2, ph=Math.PI/4+v*(Math.PI/2), rho=3*S;
    return V3m(rho*Math.sin(ph)*Math.cos(th), rho*Math.sin(ph)*Math.sin(th), rho*Math.cos(ph));
  }, 80, 36);
  addSurf(grp, outerSph, 0x5df5b0, 0.28);
  const innerSph = paramGeo((u,v) => {
    const th=u*Math.PI*2, ph=Math.PI/4+v*(Math.PI/2), rho=1*S;
    return V3m(rho*Math.sin(ph)*Math.cos(th), rho*Math.sin(ph)*Math.sin(th), rho*Math.cos(ph));
  }, 80, 36);
  addSurf(grp, innerSph, 0x5df5b0, 0.55);
  for (const ph of [Math.PI/4, 3*Math.PI/4]) {
    const cap = paramGeo((u,v) => {
      const th=u*Math.PI*2, rho=(1+v*2)*S;
      return V3m(rho*Math.sin(ph)*Math.cos(th), rho*Math.sin(ph)*Math.sin(th), rho*Math.cos(ph));
    }, 80, 20);
    addSurf(grp, cap, 0xf5a05d, 0.5);
  }
  const mid = paramGeo((u,v) => {
    const th=u*Math.PI*2, ph=Math.PI/4+v*(Math.PI/2), rho=2*S;
    return V3m(rho*Math.sin(ph)*Math.cos(th), rho*Math.sin(ph)*Math.sin(th), rho*Math.cos(ph));
  }, 80, 36);
  addSurf(grp, mid, 0x5df5b0, 0.13);
}

export function buildSolid2B(grp, { V3m, paramGeo, addSurf }) {
  // Dentro del cono, entre dos esferas — dos napas
  const S = 0.6;
  [[0, Math.PI/4], [3*Math.PI/4, Math.PI]].forEach(([ph0, ph1], ci) => {
    const outerSph = paramGeo((u,v) => {
      const th=u*Math.PI*2, ph=ph0+v*(ph1-ph0), rho=3*S;
      return V3m(rho*Math.sin(ph)*Math.cos(th), rho*Math.sin(ph)*Math.sin(th), rho*Math.cos(ph));
    }, 80, 20);
    addSurf(grp, outerSph, 0xf5a05d, 0.32);
    const innerSph = paramGeo((u,v) => {
      const th=u*Math.PI*2, ph=ph0+v*(ph1-ph0), rho=1*S;
      return V3m(rho*Math.sin(ph)*Math.cos(th), rho*Math.sin(ph)*Math.sin(th), rho*Math.cos(ph));
    }, 80, 20);
    addSurf(grp, innerSph, 0xf5a05d, 0.6);
    const pe = ci===0 ? Math.PI/4 : 3*Math.PI/4;
    const disc = paramGeo((u,v) => {
      const th=u*Math.PI*2, rho=(1+v*2)*S;
      return V3m(rho*Math.sin(pe)*Math.cos(th), rho*Math.sin(pe)*Math.sin(th), rho*Math.cos(pe));
    }, 80, 20);
    addSurf(grp, disc, 0x5df5b0, 0.4);
    const mid = paramGeo((u,v) => {
      const th=u*Math.PI*2, ph=ph0+v*(ph1-ph0), rho=2*S;
      return V3m(rho*Math.sin(ph)*Math.cos(th), rho*Math.sin(ph)*Math.sin(th), rho*Math.cos(ph));
    }, 80, 20);
    addSurf(grp, mid, 0xf5a05d, 0.13);
  });
}

export function buildSolid3(grp, { V3m, paramGeo, addSurf }) {
  // Primer cuadrante, paraboloide z=2r², bajo z=8, cilindro r=2
  // S=0.28 so z=8 → 2.24 scene units (well within axes)
  const S = 0.28;
  const parb = paramGeo((u,v) => {
    const th=u*Math.PI/2, r=v*2;
    return V3m(r*Math.cos(th)*S, r*Math.sin(th)*S, 2*r*r*S);
  }, 60, 40);
  addSurf(grp, parb, 0xf5a05d, 0.7);
  const top = paramGeo((u,v) => {
    const th=u*Math.PI/2, r=v*2;
    return V3m(r*Math.cos(th)*S, r*Math.sin(th)*S, 8*S);
  }, 60, 40);
  addSurf(grp, top, 0x6b95ff, 0.4);
  const cyl = paramGeo((u,v) => {
    const th=u*Math.PI/2, r=2, zbot=2*r*r*S;
    return V3m(r*Math.cos(th)*S, r*Math.sin(th)*S, zbot+(8*S-zbot)*v);
  }, 60, 30);
  addSurf(grp, cyl, 0x5df5b0, 0.3);
  for (const ax of [0, 1]) {
    const wall = paramGeo((u,v) => {
      const r=u*2, th=ax===0?0:Math.PI/2, zbot=2*r*r*S;
      return V3m(r*Math.cos(th)*S, r*Math.sin(th)*S, zbot+(8*S-zbot)*v);
    }, 40, 30);
    addSurf(grp, wall, 0x9ab5ff, 0.3);
  }
}

export function buildSolid4(grp, { V3m, paramGeo, addSurf }) {
  // Primer octante, planos oblicuos
  const S = 0.45;
  const planeOuter = paramGeo((u,v) => {
    const x=u*4*S, y=v*6*S, z=(8-2*(x/S)-(4/3)*(y/S))*S;
    return V3m(x, y, Math.max(0,z));
  }, 40, 40);
  addSurf(grp, planeOuter, 0xf5a05d, 0.5);
  const planeInner = paramGeo((u,v) => {
    const t=u, x=2*t*S, y=3*(1-t)*S;
    return V3m(x, y, v*8*S);
  }, 20, 20);
  addSurf(grp, planeInner, 0x6b95ff, 0.4);
  for (const zv of [4, 8]) {
    addSurf(grp, paramGeo((u,v) => V3m(u*3*S, v*4*S, zv*S), 20, 20), 0x5df5b0, 0.25);
  }
  addSurf(grp, paramGeo((u,v) => V3m(0, u*6*S, v*8*S), 20, 20), 0x9ab5ff, 0.2);
  addSurf(grp, paramGeo((u,v) => V3m(u*4*S, 0, v*8*S), 20, 20), 0x9ab5ff, 0.2);
}

export function buildSolid5(grp, { V3m, paramGeo, addSurf }) {
  // Cilindro desplazado r=2cosθ, esfera r=2, z≥0
  const S = 0.9;
  const sphereTop = paramGeo((u,v) => {
    const th=(u-0.5)*Math.PI, rMax=2*Math.cos(th), r=v*rMax;
    const z=Math.sqrt(Math.max(0, 4-r*r));
    return V3m(r*Math.cos(th)*S, r*Math.sin(th)*S, z*S);
  }, 80, 40);
  addSurf(grp, sphereTop, 0xf5a05d, 0.65);
  const cylWall = paramGeo((u,v) => {
    const th=(u-0.5)*Math.PI, r=2*Math.cos(th);
    const zMax=Math.sqrt(Math.max(0, 4-r*r));
    return V3m(r*Math.cos(th)*S, r*Math.sin(th)*S, v*zMax*S);
  }, 80, 30);
  addSurf(grp, cylWall, 0x6b95ff, 0.3);
  const bot = paramGeo((u,v) => {
    const th=u*Math.PI*2, r=v;
    return V3m((1+r*Math.cos(th))*S, r*Math.sin(th)*S, 0);
  }, 72, 30);
  addSurf(grp, bot, 0x5df5b0, 0.4);
}

export function buildSolid6(grp, { V3m, paramGeo, addSurf }) {
  // Cilindro r=4, bajo 2z=y, θ∈[0,π]
  const S = 0.28;
  const topSurf = paramGeo((u,v) => {
    const th=u*Math.PI, r=v*4, z=r*Math.sin(th)/2;
    return V3m(r*Math.cos(th)*S, r*Math.sin(th)*S, z*S);
  }, 80, 40);
  addSurf(grp, topSurf, 0xf5a05d, 0.65);
  const bot = paramGeo((u,v) => {
    const th=u*Math.PI, r=v*4;
    return V3m(r*Math.cos(th)*S, r*Math.sin(th)*S, 0);
  }, 80, 30);
  addSurf(grp, bot, 0x6b95ff, 0.35);
  const cylWall = paramGeo((u,v) => {
    const th=u*Math.PI, r=4, zMax=r*Math.sin(th)/2;
    return V3m(r*Math.cos(th)*S, r*Math.sin(th)*S, v*zMax*S);
  }, 80, 20);
  addSurf(grp, cylWall, 0x5df5b0, 0.3);
}

export function buildSolid7(grp, { V3m, paramGeo, addSurf }) {
  // Entre paraboloide z=x²+y² y cilindro parabólico z=5-y²
  const S = 0.45;
  const a = Math.sqrt(5), b = Math.sqrt(2.5);
  const parb = paramGeo((u,v) => {
    const th=u*Math.PI*2, x=v*a*Math.cos(th), y=v*b*Math.sin(th);
    return V3m(x*S, y*S, (x*x+y*y)*S);
  }, 80, 40);
  addSurf(grp, parb, 0xf5a05d, 0.65);
  const topSurf = paramGeo((u,v) => {
    const th=u*Math.PI*2, x=v*a*Math.cos(th), y=v*b*Math.sin(th), z=5-y*y;
    return V3m(x*S, y*S, Math.max(z,0)*S);
  }, 80, 40);
  addSurf(grp, topSurf, 0x6b95ff, 0.45);
  const side = paramGeo((u,v) => {
    const th=u*Math.PI*2, x=a*Math.cos(th), y=b*Math.sin(th);
    const zBot=x*x+y*y, zTop=5-y*y, z=zBot+(zTop-zBot)*v;
    return V3m(x*S, y*S, Math.max(z,0)*S);
  }, 80, 1);
  addSurf(grp, side, 0x5df5b0, 0.25);
  for (let fi=0.25; fi<=0.85; fi+=0.3) {
    const fill = paramGeo((u,v) => {
      const th=u*Math.PI*2, x=v*a*Math.cos(th), y=v*b*Math.sin(th);
      const zBot=x*x+y*y, zTop=5-y*y;
      return V3m(x*S, y*S, (zBot+(zTop-zBot)*fi)*S);
    }, 80, 40);
    addSurf(grp, fill, 0x9ab5ff, 0.08);
  }
}

export function buildSolid8(grp, { V3m, paramGeo, addSurf }) {
  // Interior esfera √5, superior al cono z=r/2
  const S = 0.7;
  const sph = paramGeo((u,v) => {
    const th=u*Math.PI*2, r=v*2, z=Math.sqrt(Math.max(0, 5-r*r));
    return V3m(r*Math.cos(th)*S, r*Math.sin(th)*S, z*S);
  }, 80, 40);
  addSurf(grp, sph, 0xf5a05d, 0.55);
  const cone = paramGeo((u,v) => {
    const th=u*Math.PI*2, r=v*2;
    return V3m(r*Math.cos(th)*S, r*Math.sin(th)*S, (r/2)*S);
  }, 80, 40);
  addSurf(grp, cone, 0x5df5b0, 0.6);
  const ring = paramGeo((u,v) => {
    const th=u*Math.PI*2, r=2, zBot=r/2, zTop=Math.sqrt(Math.max(0, 5-r*r));
    return V3m(r*Math.cos(th)*S, r*Math.sin(th)*S, (zBot+(zTop-zBot)*v)*S);
  }, 80, 10);
  addSurf(grp, ring, 0x6b95ff, 0.3);
  for (let fi=0.3; fi<=0.8; fi+=0.25) {
    const fill = paramGeo((u,v) => {
      const th=u*Math.PI*2, r=v*2, zBot=r/2, zTop=Math.sqrt(Math.max(0, 5-r*r));
      return V3m(r*Math.cos(th)*S, r*Math.sin(th)*S, (zBot+(zTop-zBot)*fi)*S);
    }, 80, 40);
    addSurf(grp, fill, 0xffcc66, 0.09);
  }
}

export function buildSolid9(grp, { V3m, paramGeo, addSurf }) {
  // Exterior al cono z=r/2, interior a la esfera x²+y²+(z-1)²=1
  // Esféricas: θ∈[0,2π], φ∈[arctan(2), π/2], ρ∈[0, 2cosφ]
  const phi0 = Math.atan(2);
  const rhoMax = 2*Math.cos(phi0);
  const rCone  = rhoMax * Math.sin(phi0);

  // Ghost cone for context
  const coneSurf = paramGeo((u,v) => {
    const th=u*Math.PI*2, r=v*rCone;
    return V3m(r*Math.cos(th), r*Math.sin(th), r/2);
  }, 80, 30);
  addSurf(grp, coneSurf, 0x88bbff, 0.18);

  // Ghost full sphere for context
  const sphContext = paramGeo((u,v) => {
    const th=u*Math.PI*2, ph=v*Math.PI/2, rho=2*Math.cos(ph);
    return V3m(rho*Math.sin(ph)*Math.cos(th), rho*Math.sin(ph)*Math.sin(th), rho*Math.cos(ph));
  }, 80, 30);
  addSurf(grp, sphContext, 0xf5a05d, 0.15);

  // Actual solid region on sphere (φ∈[phi0, π/2])
  const sphSurf = paramGeo((u,v) => {
    const th=u*Math.PI*2, ph=phi0+v*(Math.PI/2-phi0), rho=2*Math.cos(ph);
    return V3m(rho*Math.sin(ph)*Math.cos(th), rho*Math.sin(ph)*Math.sin(th), rho*Math.cos(ph));
  }, 80, 40);
  addSurf(grp, sphSurf, 0xf5a05d, 0.72);

  // Cone disc cap at φ=phi0
  const coneDisc = paramGeo((u,v) => {
    const th=u*Math.PI*2, rho=v*rhoMax, ph=phi0;
    return V3m(rho*Math.sin(ph)*Math.cos(th), rho*Math.sin(ph)*Math.sin(th), rho*Math.cos(ph));
  }, 80, 30);
  addSurf(grp, coneDisc, 0x5df5b0, 0.6);

  // Volume fill
  for (let fi=0.25; fi<=0.85; fi+=0.3) {
    const fill = paramGeo((u,v) => {
      const th=u*Math.PI*2, ph=phi0+v*(Math.PI/2-phi0), rho=fi*2*Math.cos(ph);
      return V3m(rho*Math.sin(ph)*Math.cos(th), rho*Math.sin(ph)*Math.sin(th), rho*Math.cos(ph));
    }, 80, 40);
    addSurf(grp, fill, 0xffcc88, 0.1);
  }
}
