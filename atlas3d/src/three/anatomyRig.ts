// Squelette d'animation pour le vrai modèle anatomique (BodyParts3D).
// Les os d'animation sont placés sur les centres articulaires calculés par Blender
// (public/models/joints.json). Chaque muscle est « accroché » uniquement aux os
// qu'il relie anatomiquement ; le poids de chaque os dépend de la distance du point
// à l'axe de l'os (mélange doux près des articulations).
import * as THREE from "three";

export type Joints = Record<string, [number, number, number]>;

// Ordre des os (index utilisés dans skinIndex)
export const BONES = [
  "root", "spine", "chest", "neck",
  "sh0", "el0", "wr0", "sh1", "el1", "wr1",
  "hip0", "kn0", "an0", "hip1", "kn1", "an1",
] as const;
type BoneName = (typeof BONES)[number];
const IDX = Object.fromEntries(BONES.map((b, i) => [b, i])) as Record<BoneName, number>;

// Os autorisés par muscle (S = os du côté du muscle : sh, el, wr, hip, kn, an)
const MUSCLE_BONES: Record<string, string[]> = {
  "grand-pectoral": ["chest", "S:sh"], "petit-pectoral": ["chest"], "dentele-anterieur": ["chest"],
  "deltoide-anterieur": ["chest", "S:sh"], "deltoide-moyen": ["chest", "S:sh"], "deltoide-posterieur": ["chest", "S:sh"],
  "supra-epineux": ["chest", "S:sh"], "infra-epineux": ["chest", "S:sh"], "petit-rond": ["chest", "S:sh"],
  "grand-rond": ["chest", "S:sh"], subscapulaire: ["chest", "S:sh"], "grand-dorsal": ["spine", "chest", "S:sh"],
  trapeze: ["chest", "neck"], rhomboides: ["chest"], "sterno-cleido-mastoidien": ["chest", "neck"],
  "biceps-brachial": ["chest", "S:sh", "S:el"], brachial: ["S:sh", "S:el"], "triceps-brachial": ["chest", "S:sh", "S:el"],
  "brachio-radial": ["S:sh", "S:el", "S:wr"],
  "grand-droit": ["root", "spine", "chest"], "oblique-externe": ["root", "spine", "chest"], "erecteurs-rachis": ["root", "spine", "chest"],
  "grand-fessier": ["root", "S:hip"], "moyen-fessier": ["root", "S:hip"], "tenseur-fascia-lata": ["root", "S:hip"],
  "ilio-psoas": ["spine", "root", "S:hip"], sartorius: ["root", "S:hip", "S:kn"], "grand-adducteur": ["root", "S:hip"],
  "droit-femoral": ["root", "S:hip", "S:kn"], "vaste-lateral": ["S:hip", "S:kn"], "vaste-medial": ["S:hip", "S:kn"],
  "vaste-intermediaire": ["S:hip", "S:kn"], "biceps-femoral": ["root", "S:hip", "S:kn"], "semi-tendineux": ["root", "S:hip", "S:kn"],
  "semi-membraneux": ["root", "S:hip", "S:kn"], gastrocnemien: ["S:hip", "S:kn", "S:an"], soleaire: ["S:kn", "S:an"],
  "tibial-anterieur": ["S:kn", "S:an"], fibulaires: ["S:kn", "S:an"],
};

// Muscles qui s'étirent du tronc vers l'humérus : |x| où commence le passage au bras
// x0 : |x| où commence le passage au bras ; ins : terminaison humérale (décalage depuis
// le centre de l'épaule : vers l'intérieur, vers le bas, vers l'avant).
const STRETCH: Record<string, { x0: number; ins: [number, number, number] }> = {
  "grand-pectoral": { x0: 0.03, ins: [0.01, -0.06, 0.03] },
  "grand-dorsal": { x0: 0.05, ins: [0.02, -0.1, -0.01] },
};
const STRETCH_TRUNK: BoneName = "chest";

interface Seg { a: THREE.Vector3; b: THREE.Vector3; r: number }

export function buildSegments(J: Joints) {
  const v = (k: string) => new THREE.Vector3(...J[k]);
  const hipMid = v("hip_R").add(v("hip_L")).multiplyScalar(0.5);
  const L5 = v("L5"), T12 = v("T12"), C7 = v("C7");
  // Côté 0 = x négatif, côté 1 = x positif (même convention que le mannequin)
  const side = (s: 0 | 1) => (J.shoulder_R[0] < 0 ? (s === 0 ? "R" : "L") : s === 0 ? "L" : "R");
  const pos: Record<BoneName, THREE.Vector3> = {
    root: hipMid.clone(), spine: L5, chest: T12, neck: C7,
    sh0: v("shoulder_" + side(0)), el0: v("elbow_" + side(0)), wr0: v("wrist_" + side(0)),
    sh1: v("shoulder_" + side(1)), el1: v("elbow_" + side(1)), wr1: v("wrist_" + side(1)),
    hip0: v("hip_" + side(0)), kn0: v("knee_" + side(0)), an0: v("ankle_" + side(0)),
    hip1: v("hip_" + side(1)), kn1: v("knee_" + side(1)), an1: v("ankle_" + side(1)),
  };
  const down = (p: THREE.Vector3, d: number) => p.clone().add(new THREE.Vector3(0, -d, 0));
  const seg: Record<BoneName, Seg> = {
    root: { a: hipMid, b: L5, r: 0.11 },
    spine: { a: L5, b: T12, r: 0.12 },
    chest: { a: T12, b: C7, r: 0.13 },
    neck: { a: C7, b: C7.clone().add(new THREE.Vector3(0, 0.24, 0.02)), r: 0.06 },
    sh0: { a: pos.sh0, b: pos.el0, r: 0.045 }, el0: { a: pos.el0, b: pos.wr0, r: 0.035 }, wr0: { a: pos.wr0, b: down(pos.wr0, 0.17), r: 0.03 },
    sh1: { a: pos.sh1, b: pos.el1, r: 0.045 }, el1: { a: pos.el1, b: pos.wr1, r: 0.035 }, wr1: { a: pos.wr1, b: down(pos.wr1, 0.17), r: 0.03 },
    hip0: { a: pos.hip0, b: pos.kn0, r: 0.07 }, kn0: { a: pos.kn0, b: pos.an0, r: 0.05 },
    an0: { a: pos.an0, b: pos.an0.clone().add(new THREE.Vector3(0, -0.05, 0.15)), r: 0.04 },
    hip1: { a: pos.hip1, b: pos.kn1, r: 0.07 }, kn1: { a: pos.kn1, b: pos.an1, r: 0.05 },
    an1: { a: pos.an1, b: pos.an1.clone().add(new THREE.Vector3(0, -0.05, 0.15)), r: 0.04 },
  };
  return { pos, seg, sole: [new THREE.Vector3(...J["sole_" + side(0)]), new THREE.Vector3(...J["sole_" + side(1)])] };
}

const tmp = new THREE.Vector3();
const ab = new THREE.Vector3();
function segDist(p: THREE.Vector3, s: Seg) {
  ab.subVectors(s.b, s.a);
  const t = THREE.MathUtils.clamp(tmp.subVectors(p, s.a).dot(ab) / ab.lengthSq(), 0, 1);
  return tmp.copy(s.a).addScaledVector(ab, t).distanceTo(p);
}

/** |x| de l'axe du bras (épaule → coude → poignet) à la hauteur y, au repos. */
function armX(seg: Record<BoneName, Seg>, side: 0 | 1, y: number) {
  const a = seg[`sh${side}` as BoneName].a, e = seg[`el${side}` as BoneName].a, w = seg[`wr${side}` as BoneName].a;
  const lerp = (p: THREE.Vector3, q: THREE.Vector3) => {
    const t = THREE.MathUtils.clamp((p.y - y) / (p.y - q.y), 0, 1);
    return Math.abs(p.x) + (Math.abs(q.x) - Math.abs(p.x)) * t;
  };
  return y >= e.y ? lerp(a, e) : lerp(e, w);
}

const LIMB = ["sh", "el", "wr", "hip", "kn", "an"];

/** Ajoute skinIndex / skinWeight à une géométrie (calcul mis en cache sur la géométrie). */
export function skinGeometry(
  geo: THREE.BufferGeometry,
  kind: "muscle" | "skin" | "skeleton",
  muscleId: string | null,
  seg: Record<BoneName, Seg>,
) {
  if (geo.getAttribute("skinIndex")) return;
  geo.computeBoundingBox();
  const cx = (geo.boundingBox!.min.x + geo.boundingBox!.max.x) / 2;
  const meshSide = cx < 0 ? 0 : 1;
  let allowed: BoneName[] | null = null;
  if (kind === "muscle" && muscleId && MUSCLE_BONES[muscleId])
    allowed = MUSCLE_BONES[muscleId].map((b) => (b.startsWith("S:") ? `${b.slice(2)}${meshSide}` : b) as BoneName);
  const sigma = kind === "muscle" ? 0.03 : kind === "skin" ? 0.015 : 0.008;
  const useRadius = kind !== "skeleton";
  const posA = geo.getAttribute("position") as THREE.BufferAttribute;
  const n = posA.count;
  const si = new Uint16Array(n * 4);
  const sw = new Float32Array(n * 4);
  const p = new THREE.Vector3();
  const cand: { b: number; d: number }[] = [];
  const st = muscleId ? STRETCH[muscleId] : undefined;
  const morph = st ? [0, 1, 2].map(() => new Float32Array(n * 3)) : [];
  for (let i = 0; i < n; i++) {
    p.fromBufferAttribute(posA, i);
    const vSide = p.x < 0 ? 0 : 1;
    cand.length = 0;
    const list = allowed ?? (BONES as readonly BoneName[]).filter((b) => {
      const limb = LIMB.find((l) => b.startsWith(l));
      if (!limb) return true;
      // Os d'un membre : seulement du côté du point (évite que la main suive la cuisse, etc.)
      if (Number(b.slice(limb.length)) !== vSide && Math.abs(p.x) >= 0.02) return false;
      if (kind === "skeleton") {
        // Os du tronc (côtes, sternum, clavicule, omoplate, bassin) : jamais rattachés au bras
        // ni à la cuisse, sinon la cage thoracique s'étire avec le mouvement du bras.
        if ((limb === "sh" || limb === "el" || limb === "wr") && Math.abs(p.x) < armX(seg, vSide, p.y) - 0.04) return false;
        if (limb === "hip" && p.y > seg[`hip${vSide}` as BoneName].a.y + 0.01) return false;
      }
      return true;
    });
    for (const b of list) {
      const s = seg[b];
      cand.push({ b: IDX[b], d: Math.max(0, segDist(p, s) - (useRadius ? s.r : 0)) });
    }
    cand.sort((x, y) => x.d - y.d);
    const d0 = cand[0].d;
    let tot = 0;
    const k = Math.min(4, cand.length);
    for (let j = 0; j < k; j++) {
      const w = Math.exp(-(cand[j].d - d0) / sigma);
      si[i * 4 + j] = cand[j].b;
      sw[i * 4 + j] = w;
      tot += w;
    }
    for (let j = 0; j < 4; j++) sw[i * 4 + j] = j < k ? sw[i * 4 + j] / tot : 0;
    if (st) {
      // Muscle tendu entre le tronc et l'humérus : on le garde accroché au tronc (pas de
      // rotation autour de l'épaule, qui l'écrase quand le bras monte) et on tire sa partie
      // humérale vers la terminaison via 3 « morph targets » (x, y, z) pondérés par t.
      let trunkTot = 0;
      for (let j = 0; j < 4; j++) {
        if (ARM.has(si[i * 4 + j])) sw[i * 4 + j] = 0;
        trunkTot += sw[i * 4 + j];
      }
      if (trunkTot === 0) { si[i * 4] = IDX[STRETCH_TRUNK]; sw[i * 4] = 1; trunkTot = 1; }
      for (let j = 0; j < 4; j++) sw[i * 4 + j] /= trunkTot;
      const t = THREE.MathUtils.smoothstep(Math.abs(p.x), st.x0, Math.abs(seg[`sh${meshSide}` as BoneName].a.x));
      morph[0][i * 3] = t; morph[1][i * 3 + 1] = t; morph[2][i * 3 + 2] = t;
    }
  }
  if (st) {
    geo.morphAttributes.position = morph.map((m) => new THREE.Float32BufferAttribute(m, 3));
    geo.morphTargetsRelative = true;
    const shp = seg[`sh${meshSide}` as BoneName].a;
    const sgn = Math.sign(shp.x) || 1;
    geo.userData.stretch = { side: meshSide, ins: [shp.x - sgn * st.ins[0], shp.y + st.ins[1], shp.z + st.ins[2]] };
  }
  geo.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(si, 4));
  geo.setAttribute("skinWeight", new THREE.Float32BufferAttribute(sw, 4));
}

/** Construit les os (rotation de repos = identité, comme le mannequin) aux centres articulaires. */
export function buildBones(pos: Record<BoneName, THREE.Vector3>) {
  const bones = Object.fromEntries(BONES.map((b) => [b, new THREE.Bone()])) as Record<BoneName, THREE.Bone>;
  const parent: Partial<Record<BoneName, BoneName>> = {
    spine: "root", chest: "spine", neck: "chest",
    sh0: "chest", el0: "sh0", wr0: "el0", sh1: "chest", el1: "sh1", wr1: "el1",
    hip0: "root", kn0: "hip0", an0: "kn0", hip1: "root", kn1: "hip1", an1: "kn1",
  };
  for (const b of BONES) {
    const par = parent[b];
    bones[b].name = b;
    if (par) {
      bones[par].add(bones[b]);
      bones[b].position.subVectors(pos[b], pos[par]);
    } else bones[b].position.copy(pos[b]);
    if (b.startsWith("sh") || b.startsWith("hip")) bones[b].rotation.order = "ZXY";
  }
  return bones;
}

/**
 * Silhouette (peau) : chaque point reprend les poids des points de muscles / d'os les plus proches.
 * Sous le niveau des aisselles, un point appartient SOIT au bras, SOIT au reste du corps
 * (pas de mélange) : évite les « toiles » entre le bras et le flanc ou entre la main et la hanche.
 */
const ARM = new Set(["sh0", "el0", "wr0", "sh1", "el1", "wr1"].map((b) => BONES.indexOf(b as BoneName)));

export function transferSkinWeights(target: THREE.BufferGeometry, sources: THREE.BufferGeometry[], armpitY: number) {
  if (target.getAttribute("skinIndex")) return;
  const CELL = 0.04;
  type Pt = { x: number; y: number; z: number; idx: number[]; w: number[]; arm: boolean };
  const grid = new Map<string, Pt[]>();
  const key = (x: number, y: number, z: number) => `${x},${y},${z}`;
  for (const g of sources) {
    const P = g.getAttribute("position") as THREE.BufferAttribute;
    const I = g.getAttribute("skinIndex") as THREE.BufferAttribute;
    const W = g.getAttribute("skinWeight") as THREE.BufferAttribute;
    if (!I || !W) continue;
    const step = P.count > 4000 ? 2 : 1;
    for (let i = 0; i < P.count; i += step) {
      const x = P.getX(i), y = P.getY(i), z = P.getZ(i);
      const k = key(Math.floor(x / CELL), Math.floor(y / CELL), Math.floor(z / CELL));
      if (!grid.has(k)) grid.set(k, []);
      const idx = [I.getX(i), I.getY(i), I.getZ(i), I.getW(i)];
      const w = [W.getX(i), W.getY(i), W.getZ(i), W.getW(i)];
      grid.get(k)!.push({ x, y, z, idx, w, arm: ARM.has(idx[w.indexOf(Math.max(...w))]) });
    }
  }
  const P = target.getAttribute("position") as THREE.BufferAttribute;
  const n = P.count;
  const si = new Uint16Array(n * 4);
  const sw = new Float32Array(n * 4);
  const acc = new Float32Array(BONES.length);
  const near: { d: number; p: Pt }[] = [];
  for (let i = 0; i < n; i++) {
    const x = P.getX(i), y = P.getY(i), z = P.getZ(i);
    const cx = Math.floor(x / CELL), cy = Math.floor(y / CELL), cz = Math.floor(z / CELL);
    for (let r = 1; r <= 3; r++) {
      near.length = 0;
      for (let a = -r; a <= r; a++) for (let b = -r; b <= r; b++) for (let c = -r; c <= r; c++) {
        const cell = grid.get(key(cx + a, cy + b, cz + c));
        if (cell) for (const p of cell) near.push({ d: (p.x - x) ** 2 + (p.y - y) ** 2 + (p.z - z) ** 2, p });
      }
      if (near.length >= 6) break;
    }
    near.sort((u, v) => u.d - v.d);
    let pool = near;
    if (y < armpitY && near.length) {
      const arm = near.find((q) => q.p.arm);
      const body = near.find((q) => !q.p.arm);
      const wantArm = arm && (!body || arm.d < body.d);
      pool = near.filter((q) => q.p.arm === !!wantArm);
    }
    acc.fill(0);
    const k = Math.min(6, pool.length);
    for (let j = 0; j < k; j++) {
      const f = 1 / (Math.sqrt(pool[j].d) + 0.005);
      for (let m = 0; m < 4; m++) acc[pool[j].p.idx[m]] += pool[j].p.w[m] * f;
    }
    if (!k) acc[0] = 1;
    const top = [...acc.keys()].sort((p, q) => acc[q] - acc[p]).slice(0, 4);
    const tot = top.reduce((t, b) => t + acc[b], 0) || 1;
    top.forEach((b, j) => { si[i * 4 + j] = b; sw[i * 4 + j] = acc[b] / tot; });
  }
  target.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(si, 4));
  target.setAttribute("skinWeight", new THREE.Float32BufferAttribute(sw, 4));

  // Supprime les triangles « pont » qui relient le bras au tronc (ou la main à la hanche) :
  // au repos ils sont invisibles, mais ils s'étirent dès que le bras bouge.
  const isArm = (v: number) => ARM.has(si[v * 4]) && sw[v * 4] > 0.5;
  const index = target.getIndex();
  if (index) {
    const src = index.array;
    const kept: number[] = [];
    for (let t = 0; t < src.length; t += 3) {
      const a = src[t], b = src[t + 1], c = src[t + 2];
      const low = P.getY(a) < armpitY && P.getY(b) < armpitY && P.getY(c) < armpitY;
      const mixed = !(isArm(a) === isArm(b) && isArm(b) === isArm(c));
      if (low && mixed) continue;
      kept.push(a, b, c);
    }
    target.setIndex(kept);
  }
}
