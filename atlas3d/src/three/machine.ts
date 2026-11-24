// Machines de musculation (modélisation pédagogique proche du matériel de salle) :
// colonne de poids dont les plaques montent pendant l'effort, leviers, poulies et câbles
// reliés aux mains / aux jambes du personnage. Ce ne sont pas les modèles exacts des marques.
// Pièces fixes en acier clair, pièces mobiles en cyan, sellerie sombre, disques en fonte.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { MachineSpec, BodyPoint } from "../lib/animations";

const frameMat = new THREE.MeshStandardMaterial({ color: "#cfd7e1", metalness: 0.6, roughness: 0.32 });
const baseMat = new THREE.MeshStandardMaterial({ color: "#5b6576", metalness: 0.5, roughness: 0.45 });
const plateMat = new THREE.MeshStandardMaterial({ color: "#4a5568", metalness: 0.45, roughness: 0.45 });
const liftMat = new THREE.MeshStandardMaterial({ color: "#22d3ee", metalness: 0.3, roughness: 0.4, emissive: "#0e7490", emissiveIntensity: 0.5 });
const leverMat = new THREE.MeshStandardMaterial({ color: "#67e8f9", metalness: 0.3, roughness: 0.3, emissive: "#0891b2", emissiveIntensity: 0.45 });
const rodMat = new THREE.MeshStandardMaterial({ color: "#eef2f6", metalness: 0.8, roughness: 0.2 });
const accentMat = new THREE.MeshStandardMaterial({ color: "#22d3ee", emissive: "#0891b2", emissiveIntensity: 0.5 });
const padMat = new THREE.MeshStandardMaterial({ color: "#3b4658", roughness: 0.75 });
const gripMat = new THREE.MeshStandardMaterial({ color: "#1b2230", roughness: 0.9 });
const ironMat = new THREE.MeshStandardMaterial({ color: "#39414e", metalness: 0.55, roughness: 0.4 });
const rimMat = new THREE.MeshStandardMaterial({ color: "#8a96a8", metalness: 0.6, roughness: 0.35 });
const UP = new THREE.Vector3(0, 1, 0);
const X = new THREE.Vector3(1, 0, 0);

const PLATES = 14;
const PLATE_H = 0.045;
const LIFTED = 6;
const TOWER_H = 2.1;

type V3 = [number, number, number];
const v = (a: V3 | THREE.Vector3) => (a instanceof THREE.Vector3 ? a.clone() : new THREE.Vector3(...a));

function box(size: V3, mat: THREE.Material, pos: V3 | THREE.Vector3) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(...size), mat);
  m.position.copy(v(pos));
  return m;
}
/** Coussin / pièce arrondie. */
function rbox(size: V3, mat: THREE.Material, pos: V3 | THREE.Vector3, r = 0.025) {
  const m = new THREE.Mesh(new RoundedBoxGeometry(size[0], size[1], size[2], 3, Math.min(r, Math.min(...size) / 2 - 0.001)), mat);
  m.position.copy(v(pos));
  return m;
}
/** Tube carré (ou rond) tendu entre deux points. */
function tube(a: V3 | THREE.Vector3, b: V3 | THREE.Vector3, w: number, mat: THREE.Material, round = false) {
  const m = new THREE.Mesh(round ? new THREE.CylinderGeometry(w / 2, w / 2, 1, 14) : new THREE.BoxGeometry(w, 1, w), mat);
  placeBar(m, v(a), v(b));
  return m;
}
/** Disque (poulie, disque de fonte) d'axe x par défaut. */
function disc(r: number, th: number, mat: THREE.Material, pos: V3 | THREE.Vector3, axis: "x" | "z" = "x") {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, th, 28), mat);
  m.position.copy(v(pos));
  if (axis === "x") m.rotation.z = Math.PI / 2;
  else m.rotation.x = Math.PI / 2;
  return m;
}
/** Disque de fonte avec bord clair et moyeu (axe x). */
function ironPlate(r: number, th: number, pos: V3 | THREE.Vector3) {
  const g = new THREE.Group();
  g.position.copy(v(pos));
  g.add(disc(r, th, ironMat, [0, 0, 0]));
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r - 0.012, 0.012, 8, 32), rimMat);
  rim.rotation.y = Math.PI / 2;
  g.add(rim);
  g.add(disc(0.05, th + 0.01, rimMat, [0, 0, 0]));
  return g;
}
/** Poulie à gorge, axe x ou z. */
function pulley(pos: V3 | THREE.Vector3, axis: "x" | "z" = "x", r = 0.055) {
  const g = new THREE.Group();
  g.position.copy(v(pos));
  g.add(disc(r, 0.03, accentMat, [0, 0, 0], axis));
  g.add(disc(r * 0.45, 0.05, rodMat, [0, 0, 0], axis));
  const cheek = axis === "x" ? ([0.06, r * 2.4, r * 1.6] as V3) : ([r * 1.6, r * 2.4, 0.06] as V3);
  g.add(box(cheek, frameMat, axis === "x" ? [0.035, 0, 0] : [0, 0, 0.035]));
  return g;
}

function placeBar(m: THREE.Mesh, a: THREE.Vector3, b: THREE.Vector3) {
  const d = new THREE.Vector3().subVectors(b, a);
  const len = Math.max(d.length(), 0.001);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(UP, d.normalize());
  m.scale.set(1, len, 1);
}

/** Colonne de poids sélectorisée : montants, tiges de guidage, pile de plaques, plaque de tête, goupille, poulies. */
function weightStack(p: V3, h: number) {
  const g = new THREE.Group();
  g.position.set(...p);
  g.add(box([0.6, 0.05, 0.38], baseMat, [0, 0.025, 0]));
  for (const s of [-1, 1]) {
    g.add(box([0.07, h, 0.07], frameMat, [0.25 * s, h / 2, 0]));
    g.add(box([0.012, h - 0.12, 0.012], rodMat, [0.1 * s, h / 2, 0]));
    g.add(box([0.06, 0.03, 0.06], gripMat, [0.1 * s, 0.065, 0])); // butées caoutchouc
  }
  g.add(box([0.6, 0.09, 0.16], frameMat, [0, h, 0]));
  const lifted = new THREE.Group();
  for (let i = 0; i < PLATES; i++) {
    const up = i >= PLATES - LIFTED;
    const plate = rbox([0.34, PLATE_H - 0.007, 0.2], up ? liftMat : plateMat, [0, 0.1 + i * PLATE_H, 0], 0.008);
    (up ? lifted : g).add(plate);
  }
  const top = 0.1 + PLATES * PLATE_H;
  lifted.add(rbox([0.36, 0.05, 0.22], frameMat, [0, top + 0.005, 0], 0.01)); // plaque de tête
  lifted.add(box([0.016, 0.62, 0.016], rodMat, [0, top - 0.28, 0])); // tige du sélecteur
  lifted.add(box([0.2, 0.012, 0.012], accentMat, [0.08, 0.1 + (PLATES - LIFTED) * PLATE_H, 0.11])); // goupille
  lifted.add(disc(0.018, 0.03, accentMat, [0.19, 0.1 + (PLATES - LIFTED) * PLATE_H, 0.11]));
  g.add(lifted);
  g.add(pulley([0, h - 0.08, 0.06], "x"));
  return { g, lifted, top: new THREE.Vector3(p[0], h - 0.08, p[2] + 0.06), plateTop: top };
}

export function buildMachine(spec: MachineSpec) {
  const group = new THREE.Group();
  const viaMax = Math.max(0, ...(spec.cables ?? []).map((c) => c.via[1]));
  const H = Math.max(TOWER_H, viaMax + 0.12);
  const towers = (spec.stacks ?? []).map((p) => {
    const t = weightStack(p, H);
    group.add(t.g);
    return t;
  });
  // Éléments fixes (rails, appuis)
  for (const f of spec.frame ?? []) {
    const m = f.pad ? rbox(f.size, padMat, f.pos, 0.03) : box(f.size, frameMat, f.pos);
    if (f.rot) m.rotation.set(...f.rot);
    group.add(m);
  }
  // Longeron au sol (relie les pièces entre elles)
  const rail = (a: THREE.Vector3, b: THREE.Vector3) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), baseMat);
    const d = new THREE.Vector3().subVectors(b, a);
    m.position.copy(a).addScaledVector(d, 0.5);
    m.scale.set(Math.max(Math.abs(d.x), 0.08), 0.06, Math.max(Math.abs(d.z), 0.08));
    group.add(m);
  };
  const towerBase = (spec.stacks ?? [])[0];
  const custom = spec.kind;
  if (!custom) {
    // Poteau sous chaque pivot + longeron jusqu'à la colonne de poids
    const seen = new Set<string>();
    for (const l of spec.levers ?? []) {
      const [x, y, z] = l.pivot;
      if (y < 0.3) continue;
      group.add(box([0.08, y, 0.08], frameMat, [x, y / 2, z]));
      const k = `${z}`;
      if (towerBase && !seen.has(k)) {
        seen.add(k);
        rail(new THREE.Vector3(x, 0.03, z), new THREE.Vector3(towerBase[0], 0.03, z));
        rail(new THREE.Vector3(towerBase[0], 0.03, z), new THREE.Vector3(towerBase[0], 0.03, towerBase[2]));
      }
    }
    if (spec.seat !== false && towerBase && (spec.levers ?? []).some((l) => l.pivot[1] > 0.3))
      rail(new THREE.Vector3(0, 0.03, 0.12), new THREE.Vector3(0, 0.03, (spec.levers ?? [])[0].pivot[2])); // pied du siège relié
  }

  // Leviers mobiles (cyan) : bras, moyeu sur roulement, poignée caoutchouc
  const levers = custom ? [] : (spec.levers ?? []).map((l) => {
    const m = tube([0, 0, 0], [0, 1, 0], 0.045, leverMat);
    const shin = l.to.startsWith("shin");
    const grip = shin
      ? new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.2, 16), padMat)
      : new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.15, 12), gripMat);
    if (shin) grip.rotation.set(0, 0, Math.PI / 2);
    group.add(grip);
    group.add(disc(0.055, 0.1, accentMat, l.pivot), disc(0.025, 0.14, rodMat, l.pivot));
    group.add(m);
    return { ...l, m, grip, pivot: new THREE.Vector3(...l.pivot) };
  });
  // Câbles : point du corps → poulie de renvoi → haut de la colonne → plaques
  const lineMat = new THREE.LineBasicMaterial({ color: "#e2e8f0" });
  const mkLine = (n: number) => {
    const geo = new THREE.BufferGeometry().setFromPoints(Array.from({ length: n }, () => new THREE.Vector3()));
    const line = new THREE.Line(geo, lineMat);
    line.frustumCulled = false;
    group.add(line);
    return line;
  };
  const cables = (spec.cables ?? []).map((c) => {
    const via = new THREE.Vector3(...c.via);
    const t = towers[c.stack ?? 0] ?? towers[0];
    if (t) {
      const tp = t.g.position;
      const dx = via.x - tp.x, dz = via.z - tp.z;
      const axis: "x" | "z" = Math.abs(dx) > Math.abs(dz) ? "z" : "x";
      if (Math.hypot(dx, dz) < 0.4) {
        // Poulie réglable : rail vertical devant la colonne, chariot à la hauteur de la poulie
        const tx = tp.x + dx * 0.55, tz = tp.z + dz * 0.55;
        group.add(box([0.06, H - 0.05, 0.06], frameMat, [tx, (H - 0.05) / 2, tz]));
        group.add(tube([tx, H - 0.05, tz], [tp.x, H, tp.z], 0.05, frameMat));
        group.add(rbox([0.1, 0.16, 0.1], accentMat, [tx, via.y + 0.06, tz], 0.015));
        group.add(pulley(via, axis));
      } else {
        // Potence : bras depuis le haut de la colonne jusqu'à la poulie
        const top: V3 = [tp.x, H + 0.02, tp.z];
        const end: V3 = [via.x, Math.max(via.y + 0.07, H * 0.6), via.z];
        if (via.y > 1.4) group.add(tube(top, end, 0.07, frameMat));
        else {
          group.add(tube([via.x, 0.03, via.z], [via.x, via.y + 0.08, via.z], 0.07, frameMat));
          group.add(tube([via.x, 0.03, via.z], [tp.x, 0.03, tp.z], 0.07, baseMat));
        }
        group.add(pulley(via, axis));
      }
    }
    return { ...c, via, line: mkLine(4) };
  });
  const links = levers.map(() => mkLine(3)); // levier → colonne (transmission)

  // Machines dessinées sur mesure
  const extra = custom ? CUSTOM[custom](group, { spec, towers, rail, mkLine }) : null;

  const tmp = new THREE.Vector3();
  const setLine = (line: THREE.Line, pts: THREE.Vector3[]) => {
    const a = line.geometry.attributes.position as THREE.BufferAttribute;
    pts.forEach((p, i) => a.setXYZ(i, p.x, p.y, p.z));
    a.needsUpdate = true;
  };

  function update(points: Record<BodyPoint, THREE.Vector3>, lift: number) {
    const dy = lift * 0.32;
    towers.forEach((t) => (t.lifted.position.y = dy));
    const plateTop = (i: number) => {
      const t = towers[i] ?? towers[0];
      return tmp.set(t.g.position.x, t.plateTop + dy, t.g.position.z).clone();
    };
    levers.forEach((l, i) => {
      placeBar(l.m, l.pivot, points[l.to]);
      l.grip.position.copy(points[l.to]);
      if (towers.length) {
        const t = towers[l.stack ?? 0] ?? towers[0];
        setLine(links[i], [l.pivot, t.top, plateTop(l.stack ?? 0)]);
      }
    });
    cables.forEach((c) => {
      const t = towers[c.stack ?? 0] ?? towers[0];
      setLine(c.line, [points[c.from], c.via, t.top, plateTop(c.stack ?? 0)]);
    });
    if (extra) extra(points, (l, a) => setLine(l, [...a, ...(towers[0] ? [towers[0].top, plateTop(0)] : [])]));
  }
  return { group, update };
}

type Ctx = {
  spec: MachineSpec;
  towers: ReturnType<typeof weightStack>[];
  rail: (a: THREE.Vector3, b: THREE.Vector3) => void;
  mkLine: (n: number) => THREE.Line;
};
type Upd = (p: Record<BodyPoint, THREE.Vector3>, cable: (l: THREE.Line, pts: THREE.Vector3[]) => void) => void;

/** Point devant (s = 1) ou derrière (s = −1) le bas de la jambe, à `off` de l'axe du tibia. */
function shinSide(p: Record<BodyPoint, THREE.Vector3>, s: number, up: number, off: number) {
  const d = new THREE.Vector3().subVectors(p.shins, p.knees).setX(0).normalize();
  const f = new THREE.Vector3(0, d.z, -d.y).multiplyScalar(s * off);
  return p.shins.clone().lerp(p.knees, up).add(f);
}

/** Bras de levier pivotant à hauteur du genou + rouleau en mousse (leg extension / leg curl). */
function kneeLever(group: THREE.Group, ctx: Ctx, side: 1 | -1, up: number, seated: boolean, rollW = 0.5) {
  const arm = tube([0, 0, 0], [0, 1, 0], 0.06, leverMat);
  const roller = new THREE.Group();
  roller.add(disc(0.058, rollW, padMat, [0, 0, 0]));
  roller.add(disc(0.012, rollW + 0.12, rodMat, [0, 0, 0]));
  const stub = tube([0, 0, 0], [0, 1, 0], 0.05, leverMat);
  group.add(arm, roller, stub);
  const cam = mkCam(group);
  const line = ctx.mkLine(3);
  let K: THREE.Vector3 | null = null;
  const PX = 0.34;
  return ((p, cable) => {
    if (!K) {
      K = p.knees.clone();
      const piv: V3 = [PX, K.y, K.z];
      // Colonne du pivot (côté droit), reliée au sol et à la colonne de poids
      group.add(box([0.09, K.y - 0.04, 0.09], frameMat, [PX + 0.08, (K.y - 0.04) / 2 + 0.02, K.z - 0.02]));
      group.add(disc(0.07, 0.08, accentMat, [PX + 0.02, K.y, K.z]), disc(0.03, 0.2, rodMat, piv));
      cam.position.set(PX + 0.13, K.y, K.z);
      const tb = ctx.spec.stacks?.[0];
      if (tb) {
        ctx.rail(new THREE.Vector3(PX + 0.08, 0.03, K.z - 0.02), new THREE.Vector3(tb[0], 0.03, K.z - 0.02));
        ctx.rail(new THREE.Vector3(tb[0], 0.03, K.z - 0.02), new THREE.Vector3(tb[0], 0.03, tb[2]));
      }
      if (seated) {
        // Châssis du siège (sous le bassin, jamais devant les pieds) relié à la colonne du pivot
        ctx.rail(new THREE.Vector3(0, 0.03, -0.42), new THREE.Vector3(0, 0.03, K.z - 0.3));
        ctx.rail(new THREE.Vector3(0, 0.03, K.z - 0.3), new THREE.Vector3(PX + 0.08, 0.03, K.z - 0.3));
        group.add(box([0.08, 0.05, 0.08], baseMat, [PX + 0.08, 0.03, K.z - 0.16]));
        // Poignées de part et d'autre du siège
        const sy = p.root.y - 0.1;
        for (const s of [-1, 1]) {
          group.add(tube([0.28 * s, sy - 0.18, p.root.z - 0.02], [0.28 * s, sy, p.root.z - 0.02], 0.04, frameMat));
          group.add(tube([0.28 * s, sy, p.root.z - 0.12], [0.28 * s, sy, p.root.z + 0.12], 0.038, gripMat, true));
        }
        group.add(tube([-0.28, sy - 0.18, p.root.z - 0.02], [0.28, sy - 0.18, p.root.z - 0.02], 0.04, frameMat));
      }
    }
    const R = shinSide(p, side, up, 0.085);
    const piv = new THREE.Vector3(PX, K.y, K.z);
    const end = new THREE.Vector3(PX, R.y, R.z);
    placeBar(arm, piv, end);
    placeBar(stub, end, new THREE.Vector3(0.25, R.y, R.z));
    roller.position.set(0, R.y, R.z);
    cam.rotation.x = Math.atan2(R.z - K.z, -(R.y - K.y));
    cable(line, [new THREE.Vector3(PX + 0.13, K.y + 0.09, K.z)]);
  }) as Upd;
}
/** Came de transmission (axe x) qui tourne avec le levier. */
function mkCam(group: THREE.Group) {
  const cam = new THREE.Group();
  const c = disc(0.09, 0.03, accentMat, [0, 0, 0]);
  c.scale.set(1, 1, 0.8);
  cam.add(c, box([0.03, 0.04, 0.12], leverMat, [0, -0.06, 0]));
  group.add(cam);
  return cam;
}

const CUSTOM: Record<NonNullable<MachineSpec["kind"]>, (g: THREE.Group, ctx: Ctx) => Upd> = {
  // ── Hack squat : rails à 45°, chariot (dossier + épaulières + poignées + porte-disques), plateforme inclinée
  hack(group) {
    const sled = new THREE.Group();
    group.add(sled);
    const O = new THREE.Vector3(), U = new THREE.Vector3(), N = new THREE.Vector3();
    let ready = false;
    const RO = 0.27; // axe des rails, derrière le dos
    return (p) => {
      if (!ready) {
        ready = true;
        U.subVectors(p.neck, p.root).setX(0);
        const L = U.length();
        U.normalize();
        N.set(0, -U.z, U.y);
        O.copy(p.root).setX(0);
        const at = (s: number, x: number) => O.clone().addScaledVector(U, s).addScaledVector(N, -RO).setX(x);
        const sAt = (y: number) => (y - O.y + RO * N.y) / U.y;
        const s0 = sAt(0.3), s1 = sAt(1.8);
        for (const x of [-0.31, 0.31]) {
          group.add(tube(at(s0, x), at(s1, x), 0.08, frameMat)); // rail
          const top = at(s1, x), bot = at(s0, x);
          group.add(tube(top, new THREE.Vector3(x, 0.04, top.z), 0.09, frameMat)); // montant arrière
          group.add(tube(bot, new THREE.Vector3(x, 0.04, bot.z), 0.08, frameMat));
          group.add(rbox([0.1, 0.06, 0.12], gripMat, at(s0 + 0.08, x), 0.015)); // butée basse
          group.add(box([0.1, 0.06, Math.abs(top.z - 0.45) + 0.1], baseMat, [x * 1.3, 0.03, (top.z + 0.45) / 2])); // longeron
        }
        group.add(tube(at(s1, -0.36), at(s1, 0.36), 0.08, frameMat));
        group.add(tube(at(s0, -0.36), at(s0, 0.36), 0.07, frameMat));
        const zb = at(s1, 0).z;
        group.add(box([0.92, 0.06, 0.1], baseMat, [0, 0.03, zb]), box([0.92, 0.06, 0.1], baseMat, [0, 0.03, 0.42]));
        // Plateforme de pieds inclinée (pointes relevées), striée, sur deux jambes de force
        const tilt = (26 * Math.PI) / 180;
        const nrm = new THREE.Vector3(0, Math.cos(tilt), -Math.sin(tilt));
        const pc = p.feet.clone().setX(0).addScaledVector(nrm, -0.03);
        const plat = new THREE.Group();
        plat.position.copy(pc);
        plat.rotation.x = -tilt;
        plat.add(rbox([0.86, 0.05, 0.6], gripMat, [0, 0, 0], 0.012));
        for (let i = -3; i <= 3; i++) plat.add(box([0.8, 0.006, 0.02], frameMat, [0, 0.026, i * 0.08]));
        group.add(plat);
        for (const x of [-0.36, 0.36]) {
          const front = pc.clone().add(new THREE.Vector3(x, -0.12 * Math.sin(tilt) * 2, 0.25 * Math.cos(tilt)));
          const back = pc.clone().add(new THREE.Vector3(x, 0.25 * Math.sin(tilt) - 0.03, -0.25 * Math.cos(tilt)));
          group.add(tube(new THREE.Vector3(x, 0.04, front.z), front, 0.06, frameMat));
          group.add(tube(new THREE.Vector3(x, 0.04, back.z), back, 0.06, frameMat));
        }
        group.add(tube(pc.clone().setX(0).add(new THREE.Vector3(0, -0.05, -0.2)), at(s0, 0), 0.07, frameMat)); // liaison plateforme → rails
        // Chariot (repère local : x, y = axe des rails, z = vers l'avant du corps)
        sled.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, U, N));
        const toLocal = (w: THREE.Vector3) => {
          const d = w.clone().sub(O);
          return new THREE.Vector3(w.x, d.dot(U), d.dot(N));
        };
        sled.add(rbox([0.42, L + 0.25, 0.09], padMat, [0, (L - 0.1) / 2 + 0.02, -0.17], 0.035)); // dossier
        sled.add(box([0.34, L + 0.2, 0.03], frameMat, [0, (L - 0.1) / 2 + 0.02, -0.23]));
        for (const s of [-1, 1]) {
          sled.add(rbox([0.13, 0.09, 0.26], padMat, [0.135 * s, L + 0.07, -0.04], 0.035)); // épaulière
          sled.add(tube([0.135 * s, L + 0.11, -0.2], [0.135 * s, L + 0.11, 0.06], 0.035, leverMat));
          for (const y of [0.05, L - 0.05]) sled.add(rbox([0.12, 0.26, 0.12], leverMat, [0.31 * s, y, -RO], 0.015)); // patins sur rails
          sled.add(tube([0.31 * s, -0.08, -RO], [0.31 * s, L + 0.12, -RO], 0.05, leverMat));
          sled.add(tube([0.08 * s, 0.05, -0.24], [0.31 * s, 0.05, -RO], 0.04, leverMat));
          sled.add(tube([0.08 * s, L - 0.05, -0.24], [0.31 * s, L - 0.05, -RO], 0.04, leverMat));
          // Porte-disques + 2 disques de 20 kg
          const hy = 0.4;
          sled.add(tube([0.35 * s, hy, -RO - 0.06], [0.66 * s, hy, -RO - 0.06], 0.05, rodMat, true));
          sled.add(ironPlate(0.2, 0.045, [0.43 * s, hy, -RO - 0.06]), ironPlate(0.2, 0.045, [0.485 * s, hy, -RO - 0.06]));
        }
        // Poignées à côté des épaulières, là où sont les mains
        for (const h of [p.hand0, p.hand1]) {
          const hl = toLocal(h);
          sled.add(tube([hl.x, hl.y, hl.z - 0.08], [hl.x, hl.y, hl.z + 0.07], 0.034, gripMat, true));
          sled.add(tube([hl.x, hl.y, hl.z - 0.08], [Math.sign(hl.x) * 0.2, L + 0.02, -0.2], 0.03, leverMat));
        }
      }
      const s = new THREE.Vector3().subVectors(p.root, O).dot(U);
      sled.position.copy(O).addScaledVector(U, s);
    };
  },

  // ── Leg extension : rouleau DEVANT le bas des tibias, pivot à hauteur du genou
  legext(group, ctx) {
    return kneeLever(group, ctx, 1, 0.14, true);
  },
  // ── Leg curl assis : rouleau DERRIÈRE les chevilles + coussin qui bloque le haut des cuisses
  legcurl(group, ctx) {
    const lever = kneeLever(group, ctx, -1, 0.12, true);
    let done = false;
    return (p, c) => {
      if (!done) {
        done = true;
        const z = p.knees.z - 0.13, y = p.knees.y + 0.13;
        group.add(rbox([0.44, 0.08, 0.15], padMat, [0, y, z], 0.03));
        group.add(tube([0.24, y, z], [0.42, y, z], 0.05, frameMat), tube([0.42, y, z], [0.42, p.knees.y - 0.02, p.knees.z - 0.02], 0.06, frameMat));
      }
      lever(p, c);
    };
  },
  // ── Leg curl allongé : rouleau sur l'arrière des chevilles, poignées à l'avant du banc
  lyingcurl(group, ctx) {
    const lever = kneeLever(group, ctx, -1, 0.12, false, 0.46);
    let done = false;
    return (p, c) => {
      if (!done) {
        done = true;
        for (const s of [-1, 1]) {
          group.add(tube([0.24 * s, 0.03, 0.78], [0.24 * s, 0.62, 0.78], 0.05, frameMat));
          group.add(tube([0.24 * s, 0.62, 0.7], [0.24 * s, 0.62, 0.9], 0.036, gripMat, true));
        }
        group.add(box([0.56, 0.05, 0.1], baseMat, [0, 0.03, 0.78]));
        ctx.rail(new THREE.Vector3(0, 0.03, 0.78), new THREE.Vector3(0, 0.03, p.knees.z - 0.02));
      }
      lever(p, c);
    };
  },

  // ── Presse à cuisses 45° : chariot sur rails avec plaque de pieds, porte-disques chargés
  legpress(group) {
    const car = new THREE.Group();
    car.rotation.x = 0.686;
    group.add(car);
    let ready = false;
    return (p) => {
      if (!ready) {
        ready = true;
        car.position.copy(p.feet).setX(0);
        car.updateMatrixWorld(true);
        const rl = car.worldToLocal(new THREE.Vector3(0.33, 1.39, 0.47)); // axe des rails dans le repère du chariot
        car.add(rbox([0.78, 0.04, 0.62], gripMat, [0, 0.03, 0], 0.012)); // plaque de pieds
        for (let i = -3; i <= 3; i++) car.add(box([0.72, 0.006, 0.02], frameMat, [0, 0.008, i * 0.08]));
        car.add(box([0.6, 0.08, 0.5], leverMat, [0, 0.11, 0]));
        for (const s of [-1, 1]) {
          car.add(rbox([0.12, 0.3, 0.12], leverMat, [0.33 * s, 0.12, rl.z], 0.015)); // patins
          car.add(tube([0.3 * s, 0.11, 0], [0.33 * s, 0.12, rl.z], 0.05, leverMat));
          car.add(tube([0.38 * s, 0.2, rl.z * 0.5], [0.7 * s, 0.2, rl.z * 0.5], 0.05, rodMat, true)); // porte-disques
          car.add(ironPlate(0.22, 0.045, [0.46 * s, 0.2, rl.z * 0.5]), ironPlate(0.22, 0.045, [0.515 * s, 0.2, rl.z * 0.5]), ironPlate(0.17, 0.04, [0.565 * s, 0.2, rl.z * 0.5]));
        }
        // Poignées le long du siège, butées de sécurité, cadre arrière du dossier
        for (const s of [-1, 1]) {
          group.add(tube([0.3 * s, 0.03, -0.1], [0.3 * s, 0.34, -0.1], 0.05, frameMat));
          group.add(tube([0.3 * s, 0.34, -0.22], [0.3 * s, 0.34, 0.08], 0.036, gripMat, true));
          group.add(tube([0.27 * s, 0.03, -0.62], [0.27 * s, 0.86, -0.62], 0.06, frameMat));
        }
        group.add(tube([-0.3, 0.06, -0.62], [0.3, 0.06, -0.62], 0.06, baseMat));
      }
    };
  },

  // ── Smith machine : cadre à 4 montants, barre guidée par deux tiges, chariots à crochets, butées de sécurité
  smith(group) {
    const sliders: THREE.Mesh[] = [];
    let ready = false;
    return (p) => {
      if (!ready) {
        ready = true;
        const z = p.hands.z;
        for (const s of [-1, 1]) {
          for (const dz of [-0.38, 0.38]) group.add(box([0.07, 2.15, 0.07], frameMat, [0.68 * s, 1.075, z + dz]));
          group.add(box([0.07, 0.07, 0.83], frameMat, [0.68 * s, 2.15, z]), box([0.1, 0.06, 0.95], baseMat, [0.68 * s, 0.03, z]));
          group.add(box([0.024, 2.08, 0.024], rodMat, [0.58 * s, 1.08, z])); // tige de guidage
          group.add(box([0.14, 0.03, 0.03], frameMat, [0.63 * s, 2.1, z]), box([0.14, 0.03, 0.03], frameMat, [0.63 * s, 0.06, z]));
          group.add(rbox([0.1, 0.05, 0.16], accentMat, [0.58 * s, 0.55, z + 0.04], 0.01)); // butée de sécurité
          const sl = rbox([0.07, 0.16, 0.07], leverMat, [0.58 * s, 1, z], 0.012);
          sl.add(box([0.03, 0.08, 0.06], leverMat, [0, -0.02, -0.06])); // crochet
          sliders.push(sl);
          group.add(sl);
        }
        for (const dz of [-0.38, 0.38]) group.add(box([1.43, 0.07, 0.07], frameMat, [0, 2.15, z + dz]), box([1.43, 0.06, 0.1], baseMat, [0, 0.03, z + dz]));
      }
      for (const sl of sliders) sl.position.y = p.hands.y;
    };
  },

  // ── Tirage vertical : poutre haute avec poulie au-dessus de la tête, boudins de cuisses sur montants
  pulldown(group, ctx) {
    let ready = false;
    return (p) => {
      if (ready) return;
      ready = true;
      const tb = ctx.spec.stacks?.[0];
      if (!tb) return;
      ctx.rail(new THREE.Vector3(0, 0.03, tb[2]), new THREE.Vector3(0, 0.03, 0.55));
      for (const s of [-1, 1]) group.add(tube([0.2 * s, 0.03, 0.42], [0.2 * s, p.knees.y + 0.1, 0.42], 0.06, frameMat));
      group.add(tube([-0.2, p.knees.y + 0.1, 0.42], [0.2, p.knees.y + 0.1, 0.42], 0.05, frameMat));
      group.add(box([0.5, 0.06, 0.1], baseMat, [0, 0.03, 0.55]));
      group.add(tube([0, 0.03, 0.12], [0, 0.03, tb[2]], 0.08, baseMat));
    };
  },
};
