// Muscles absents de BodyParts3D : grand dorsal et grand droit de l'abdomen.
// Ils sont modelés ici à partir des repères anatomiques classiques (origines / terminaisons)
// et « moulés » sur la surface du corps du modèle (peau BodyParts3D), juste sous la peau.
// Forme pédagogique simplifiée : ce n'est pas un scan anatomique.
import * as THREE from "three";

type V3 = THREE.Vector3;
export interface ExtraMuscle { id: string; geo: THREE.BufferGeometry }

const CELL = 0.018;
const T_MAX = 0.018;

/** Carte de profondeur du tronc : pour chaque case (x, y), la peau la plus en avant ou en arrière. */
function depthMap(P: THREE.BufferAttribute, front: boolean, maxX: (y: number) => number, midZ: number) {
  const map = new Map<string, number>();
  for (let i = 0; i < P.count; i++) {
    const x = P.getX(i), y = P.getY(i), z = P.getZ(i);
    if (Math.abs(x) > maxX(y) || (front ? z < midZ : z > midZ)) continue;
    const k = `${Math.round(x / CELL)},${Math.round(y / CELL)}`;
    const cur = map.get(k);
    if (cur === undefined || (front ? z > cur : z < cur)) map.set(k, z);
  }
  return (x: number, y: number) => {
    // moyenne pondérée des cases voisines (lisse les facettes)
    let s = 0, w = 0;
    const cx = Math.round(x / CELL), cy = Math.round(y / CELL);
    for (let r = 1; r <= 4 && w === 0; r++)
      for (let a = -r; a <= r; a++) for (let b = -r; b <= r; b++) {
        const z = map.get(`${cx + a},${cy + b}`);
        if (z === undefined) continue;
        const d = 1 / (1 + a * a + b * b);
        s += z * d; w += d;
      }
    return w ? s / w : 0;
  };
}

/**
 * Coque fermée (dessus = sous la peau, dessous = décalé vers l'intérieur de l'épaisseur).
 * sample(u, v) → point de surface (x, y), épaisseur ; depth donne z.
 */
function shell(
  nu: number, nv: number,
  sample: (u: number, v: number) => { x: number; y: number; t: number },
  depth: (x: number, y: number) => number, inward: number, gap: number,
) {
  const pos: number[] = [];
  const idx: number[] = [];
  const W = nu + 1, H = nv + 1;
  for (const layer of [0, 1])
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const { x, y, t } = sample(i / nu, j / nv);
      // couche 1 = face profonde (plate), couche 0 = face visible qui porte le relief
      const z = depth(x, y) + inward * (gap + (layer ? T_MAX : T_MAX - t));
      pos.push(x, y, z);
    }
  const id = (l: number, i: number, j: number) => l * W * H + j * W + i;
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    const a = id(0, i, j), b = id(0, i + 1, j), c = id(0, i + 1, j + 1), d = id(0, i, j + 1);
    idx.push(a, b, c, a, c, d);
    const A = id(1, i, j), B = id(1, i + 1, j), C = id(1, i + 1, j + 1), D = id(1, i, j + 1);
    idx.push(A, C, B, A, D, C);
  }
  // bords : relie les deux couches (épaisseur nulle aux bords, mais on ferme proprement)
  const edge = (pts: [number, number][]) => {
    for (let k = 0; k < pts.length - 1; k++) {
      const [i0, j0] = pts[k], [i1, j1] = pts[k + 1];
      idx.push(id(0, i0, j0), id(1, i0, j0), id(1, i1, j1), id(0, i0, j0), id(1, i1, j1), id(0, i1, j1));
    }
  };
  edge(Array.from({ length: W }, (_, i) => [i, 0]));
  edge(Array.from({ length: W }, (_, i) => [nu - i, nv]));
  edge(Array.from({ length: H }, (_, j) => [nu, j]));
  edge(Array.from({ length: H }, (_, j) => [0, nv - j]));
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

const lerp = THREE.MathUtils.lerp;
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Suit une polyligne 2D à l'abscisse curviligne s ∈ [0, 1]. */
function along(pts: [number, number][], s: number): [number, number] {
  const L: number[] = [0];
  for (let k = 1; k < pts.length; k++) L.push(L[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
  const d = s * L[L.length - 1];
  let k = 1;
  while (k < pts.length - 1 && L[k] < d) k++;
  const f = (d - L[k - 1]) / (L[k] - L[k - 1] || 1);
  return [lerp(pts[k - 1][0], pts[k][0], f), lerp(pts[k - 1][1], pts[k][1], f)];
}

const cache = new WeakMap<THREE.BufferGeometry, ExtraMuscle[]>();

export function buildExtraMuscles(skin: THREE.BufferGeometry, pos: Record<string, V3>): ExtraMuscle[] {
  if (cache.has(skin)) return cache.get(skin)!;
  const P = skin.getAttribute("position") as THREE.BufferAttribute;
  const sh = Math.abs(pos.sh0.x), shY = pos.sh0.y;
  const el = Math.abs(pos.el0.x), elY = pos.el0.y;
  // |x| maximal du tronc (on exclut les bras qui pendent le long du corps)
  const trunkX = (y: number) => (y > elY ? lerp(el, sh, (y - elY) / (shY - elY)) : el) - 0.045;
  // ne garder que la moitié dorsale (ou ventrale) de la peau, sinon une case peut ne
  // contenir que des points de l'autre face
  const midZ = pos.chest.z + 0.03;
  const back = depthMap(P, false, trunkX, midZ);
  const front = depthMap(P, true, (y) => Math.min(0.12, trunkX(y)), midZ);

  const T12 = pos.chest, L5 = pos.spine, C7 = pos.neck, hipY = pos.hip0.y;
  const out: ExtraMuscle[] = [];

  for (const s of [-1, 1]) {
    // ---- Grand dorsal ----
    // Origine : apophyses épineuses T7 → L5 (fascia thoraco-lombaire), puis crête iliaque.
    const T7y = lerp(T12.y, C7.y, 0.42);
    const crestY = hipY + 0.13;
    const origin: [number, number][] = [
      [0.008, T7y], [0.008, T12.y], [0.008, L5.y], [0.03, crestY - 0.015], [0.09, crestY + 0.005], [trunkX(crestY + 0.03) - 0.005, crestY + 0.05],
    ];
    // Terminaison : sillon intertuberculaire de l'humérus, au creux de l'aisselle (arrière).
    const ins: [number, number] = [sh - 0.02, shY - 0.1];
    const lats = shell(36, 28, (u, v) => {
      const [ox, oy] = along(origin, u);
      // le bord supérieur passe sous la pointe de l'omoplate
      const e = smooth(v);
      const ix = ins[0] + (u - 0.5) * 0.012, iy = ins[1] + (0.5 - u) * 0.035;
      // les fibres s'enroulent vers le bas puis remontent vers l'aisselle (forme en éventail)
      const bow = Math.sin(Math.PI * v) * (0.5 - Math.abs(u - 0.5)) * 0.03;
      const x = lerp(ox, ix, e) + bow;
      const y = lerp(oy, iy, e);
      // épaisseur : fine sur la partie aponévrotique (lombaire), charnue vers l'aisselle
      const fleshy = smooth(THREE.MathUtils.clamp((v - 0.12) / 0.45, 0, 1));
      const edges = Math.pow(Math.sin(Math.PI * u), 0.6) * Math.pow(Math.sin(Math.PI * Math.min(v, 0.98)), 0.35);
      const fibres = 1 + 0.12 * Math.sin(u * 70);
      return { x: s * Math.min(x, trunkX(y) + 0.02), y, t: 0.004 + 0.013 * fleshy * edges * fibres };
    }, back, 1, 0.003);
    out.push({ id: "grand-dorsal", geo: lats });

    // ---- Grand droit de l'abdomen ----
    // Du pubis (symphyse) aux cartilages costaux 5-7 et au processus xiphoïde.
    const pubY = hipY - 0.01, topY = lerp(T12.y, C7.y, 0.32);
    const navel = lerp(pubY, topY, 0.42), xiph = lerp(pubY, topY, 0.82);
    // intersections tendineuses : ombilic, xiphoïde et à mi-chemin (« tablettes »)
    const inters = [navel, lerp(navel, xiph, 0.5), xiph];
    const abs = shell(10, 44, (u, v) => {
      const y = lerp(pubY, topY, v);
      const outer = lerp(0.03, 0.075, smooth(Math.min(1, v * 1.25)));
      const x = lerp(0.007, outer, u);
      let t = 0.016 * Math.pow(Math.sin(Math.PI * u), 0.45) * Math.pow(Math.sin(Math.PI * v), 0.3);
      for (const iy of inters) t *= 1 - 0.8 * Math.exp(-(((y - iy) / 0.008) ** 2));
      return { x: s * x, y, t: 0.001 + t };
    }, front, -1, 0.004);
    out.push({ id: "grand-droit", geo: abs });
  }
  cache.set(skin, out);
  return out;
}
