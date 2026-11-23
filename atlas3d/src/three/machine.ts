// Machines de musculation génériques (modélisation claire, pédagogique) :
// colonne de poids dont les plaques montent pendant l'effort, leviers et câbles
// reliés aux mains / aux jambes du personnage. Ce ne sont pas les modèles exacts des marques.
import * as THREE from "three";
import type { MachineSpec, BodyPoint } from "../lib/animations";

const frameMat = new THREE.MeshStandardMaterial({ color: "#d6dde6", metalness: 0.55, roughness: 0.32 });
const plateMat = new THREE.MeshStandardMaterial({ color: "#475467", metalness: 0.4, roughness: 0.45 });
const liftMat = new THREE.MeshStandardMaterial({ color: "#22d3ee", metalness: 0.3, roughness: 0.4, emissive: "#0e7490", emissiveIntensity: 0.5 });
// Pièces mobiles en cyan (leviers, poignées, plaques soulevées) ; structure fixe en gris clair.
const leverMat = new THREE.MeshStandardMaterial({ color: "#67e8f9", metalness: 0.3, roughness: 0.3, emissive: "#0891b2", emissiveIntensity: 0.45 });
const rodMat = new THREE.MeshStandardMaterial({ color: "#eef2f6", metalness: 0.6, roughness: 0.28 });
const accentMat = new THREE.MeshStandardMaterial({ color: "#22d3ee", emissive: "#0891b2", emissiveIntensity: 0.5 });
const padMat = new THREE.MeshStandardMaterial({ color: "#334155", roughness: 0.8 });
const UP = new THREE.Vector3(0, 1, 0);

const PLATES = 14;
const PLATE_H = 0.045;
const LIFTED = 6;
const TOWER_H = 2.1;

function box(size: [number, number, number], mat: THREE.Material, pos: [number, number, number]) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(...size), mat);
  m.position.set(...pos);
  m.castShadow = true;
  return m;
}

function bar(mat: THREE.Material, r = 0.02) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 12), mat);
  m.castShadow = true;
  return m;
}

function placeBar(m: THREE.Mesh, a: THREE.Vector3, b: THREE.Vector3) {
  const d = new THREE.Vector3().subVectors(b, a);
  const len = Math.max(d.length(), 0.001);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(UP, d.divideScalar(len));
  m.scale.set(1, len, 1);
}

export function buildMachine(spec: MachineSpec) {
  const group = new THREE.Group();
  // Colonnes de poids
  const towers = (spec.stacks ?? []).map((p) => {
    const g = new THREE.Group();
    g.position.set(...p);
    for (const s of [-1, 1]) g.add(box([0.05, TOWER_H, 0.05], frameMat, [0.19 * s, TOWER_H / 2, 0]));
    g.add(box([0.48, 0.05, 0.12], frameMat, [0, TOWER_H, 0]));
    g.add(box([0.5, 0.04, 0.3], frameMat, [0, 0.02, 0]));
    for (const s of [-1, 1]) g.add(box([0.012, TOWER_H - 0.1, 0.012], rodMat, [0.07 * s, TOWER_H / 2, 0]));
    const lifted = new THREE.Group();
    for (let i = 0; i < PLATES; i++) {
      const plate = box([0.32, PLATE_H - 0.006, 0.17], i >= PLATES - LIFTED ? liftMat : plateMat, [0, 0.07 + i * PLATE_H, 0]);
      (i >= PLATES - LIFTED ? lifted : g).add(plate);
    }
    lifted.add(box([0.36, 0.008, 0.02], accentMat, [0, 0.07 + (PLATES - LIFTED) * PLATE_H - 0.02, 0.09])); // goupille
    g.add(lifted);
    const pulley = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 8, 20), accentMat);
    pulley.position.set(0, TOWER_H - 0.06, 0.07);
    g.add(pulley);
    group.add(g);
    return { g, lifted, top: new THREE.Vector3(p[0], TOWER_H - 0.06, p[2] + 0.07) };
  });
  // Éléments fixes (rails, appuis)
  for (const f of spec.frame ?? []) {
    const m = box(f.size, f.pad ? padMat : frameMat, f.pos);
    if (f.rot) m.rotation.set(...f.rot);
    group.add(m);
  }
  // Structure : poteau sous chaque pivot + rail au sol jusqu'à la colonne de poids (tout est relié)
  const rail = (a: THREE.Vector3, b: THREE.Vector3) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), frameMat);
    const d = new THREE.Vector3().subVectors(b, a);
    m.position.copy(a).addScaledVector(d, 0.5);
    m.scale.set(Math.max(Math.abs(d.x), 0.06), 0.05, Math.max(Math.abs(d.z), 0.06));
    group.add(m);
  };
  const towerBase = (spec.stacks ?? [])[0];
  const seen = new Set<string>();
  for (const l of spec.levers ?? []) {
    const [x, y, z] = l.pivot;
    if (y < 0.3) continue;
    const post = box([0.07, y, 0.07], frameMat, [x, y / 2, z]);
    group.add(post);
    const k = `${z}`;
    if (towerBase && !seen.has(k)) {
      seen.add(k);
      rail(new THREE.Vector3(x, 0.025, z), new THREE.Vector3(towerBase[0], 0.025, z));
      rail(new THREE.Vector3(towerBase[0], 0.025, z), new THREE.Vector3(towerBase[0], 0.025, towerBase[2]));
    }
  }
  if (spec.seat !== false && towerBase && (spec.levers ?? []).some((l) => l.pivot[1] > 0.3))
    rail(new THREE.Vector3(0, 0.025, 0.12), new THREE.Vector3(0, 0.025, (spec.levers ?? [])[0].pivot[2])); // pied du siège relié

  // Leviers mobiles (cyan) avec poignée au bout
  const levers = (spec.levers ?? []).map((l) => {
    const m = bar(leverMat, 0.022);
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.16, 10), leverMat);
    group.add(grip);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.08, 16), accentMat);
    hub.position.set(...l.pivot);
    hub.rotation.z = Math.PI / 2;
    group.add(m, hub);
    return { ...l, m, grip, pivot: new THREE.Vector3(...l.pivot) };
  });
  // Câbles : point du corps → poulie → haut de la colonne → plaques
  const lineMat = new THREE.LineBasicMaterial({ color: "#a5f3fc" });
  const mkLine = (n: number) => {
    const geo = new THREE.BufferGeometry().setFromPoints(Array.from({ length: n }, () => new THREE.Vector3()));
    const line = new THREE.Line(geo, lineMat);
    line.frustumCulled = false;
    group.add(line);
    return line;
  };
  const cables = (spec.cables ?? []).map((c) => ({ ...c, via: new THREE.Vector3(...c.via), line: mkLine(4) }));
  const links = levers.map(() => mkLine(3)); // levier → colonne (transmission)

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
      return tmp.set(t.g.position.x, 0.07 + PLATES * PLATE_H + dy, t.g.position.z).clone();
    };
    levers.forEach((l, i) => {
      placeBar(l.m, l.pivot, points[l.to]);
      l.grip.position.copy(points[l.to]);
      if (l.to.startsWith("shin")) l.grip.rotation.set(0, 0, Math.PI / 2); // rouleau en mousse
      if (towers.length) {
        const t = towers[l.stack ?? 0] ?? towers[0];
        setLine(links[i], [l.pivot, t.top, plateTop(l.stack ?? 0)]);
      }
    });
    cables.forEach((c) => {
      const t = towers[c.stack ?? 0] ?? towers[0];
      setLine(c.line, [points[c.from], c.via, t.top, plateTop(c.stack ?? 0)]);
    });
  }
  return { group, update };
}
