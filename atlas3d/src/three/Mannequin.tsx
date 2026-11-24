"use client";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { type Animation, type Prop, overlayOf, poseAt, faultPoseAt } from "../lib/animations";
import jointsData from "../data/joints.json";
import { buildMachine } from "./machine";
import type { BodyPoint } from "../lib/animations";
import { BONES, type Joints, buildBones, buildSegments, skinGeometry, transferSkinWeights } from "./anatomyRig";
import { buildExtraMuscles } from "./extraMuscles";

const ANIM_MODEL = ((window as any).A3D_BASE||"atlas3d/")+"models/anatomy-anim.glb";
const MUSCLE_TONES = ["#8e2a26", "#9a302a", "#a3372f", "#87261f", "#953029", "#7f231e"];

const D = THREE.MathUtils.degToRad;

export type MuscleRoles = Record<string, "principal" | "secondaire" | "stabilisateur">;
export const ROLE_COLORS = { principal: "#ef4444", secondaire: "#f97316", stabilisateur: "#3b82f6" } as const;

interface Rig {
  root: THREE.Object3D;
  spine: THREE.Object3D;
  chest: THREE.Object3D;
  neck: THREE.Object3D;
  sh: [THREE.Object3D, THREE.Object3D];
  el: [THREE.Object3D, THREE.Object3D];
  hand: [THREE.Object3D, THREE.Object3D];
  /** Phalanges [proximale, distale] de chaque main (modèle anatomique seulement). */
  fingers?: [THREE.Object3D, THREE.Object3D][];
  /** Avant-pied (articulation des orteils), créé à la demande pour l'ancrage « toes ». */
  toes?: [THREE.Object3D, THREE.Object3D];
  hip: [THREE.Object3D, THREE.Object3D];
  kn: [THREE.Object3D, THREE.Object3D];
  an: [THREE.Object3D, THREE.Object3D];
  sole: [THREE.Object3D, THREE.Object3D];
  overlays: Map<string, THREE.Mesh[]>;
  body: THREE.MeshStandardMaterial;
  /** Maillages de la silhouette (corps + articulations) avec leur matériau d'origine. */
  skin: { mesh: THREE.Mesh; original: THREE.Material }[];
  glass: THREE.ShaderMaterial;
  /** Modèle anatomique réel (muscles BodyParts3D accrochés aux os). */
  anatomical?: {
    muscles: { mesh: THREE.SkinnedMesh; id: string; mat: THREE.MeshPhysicalMaterial; tone: string }[];
    skinMesh: THREE.SkinnedMesh | null;
    skeletonMesh: THREE.SkinnedMesh | null;
    meshes: THREE.Group;
    restAbd: number; // abduction des bras au repos dans le modèle (degrés)
    skeleton: THREE.Skeleton;
  };
}

// Silhouette translucide « verre » : très transparente au centre, lumineuse sur les contours (effet Fresnel).
function makeGlass() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uColor: { value: new THREE.Color("#bfe3ff") }, uBase: { value: 0.07 }, uRim: { value: 0.75 } },
    vertexShader: `
      #include <common>
      #include <skinning_pars_vertex>
      varying vec3 vN; varying vec3 vV;
      void main() {
        #include <beginnormal_vertex>
        #include <skinbase_vertex>
        #include <skinnormal_vertex>
        #include <defaultnormal_vertex>
        #include <begin_vertex>
        #include <skinning_vertex>
        vec4 mv = modelViewMatrix * vec4(transformed, 1.0);
        vN = normalize(transformedNormal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uColor; uniform float uBase; uniform float uRim;
      varying vec3 vN; varying vec3 vV;
      void main() {
        float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2);
        gl_FragColor = vec4(uColor * (0.55 + f), uBase + uRim * f);
      }`,
  });
}

function capsule(r: number, len: number, mat: THREE.Material, y = -len / 2 - r) {
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 14), mat);
  m.position.y = y;
  m.castShadow = true;
  return m;
}

/** Avant-pied : distance devant le point de plante (pivot des mollets, talons qui montent). */
const TOE_FWD = 0.08;

function buildRig(): Rig {
  const body = new THREE.MeshStandardMaterial({ color: "#5b6b82", roughness: 0.55, metalness: 0.15, transparent: true });
  const joint = new THREE.MeshStandardMaterial({ color: "#7dd3fc", roughness: 0.4, emissive: "#0e7490", emissiveIntensity: 0.35 });
  const overlays = new Map<string, THREE.Mesh[]>();
  const ov = (key: string, parent: THREE.Object3D, pos: [number, number, number], scale: [number, number, number]) => {
    const mat = new THREE.MeshPhysicalMaterial({ color: "#1e293b", transparent: true, opacity: 0, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.3, depthWrite: true });
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), mat);
    m.position.set(...pos);
    m.scale.set(...scale);
    m.userData.baseScale = m.scale.clone();
    m.renderOrder = 1;
    parent.add(m);
    if (!overlays.has(key)) overlays.set(key, []);
    overlays.get(key)!.push(m);
  };

  const root = new THREE.Group();
  const pelvis = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.16, 6, 14), body);
  pelvis.rotation.z = Math.PI / 2;
  pelvis.scale.set(1, 1, 0.8);
  root.add(pelvis);
  ov("glutes", root, [0.07, -0.03, -0.09], [0.08, 0.09, 0.05]);
  ov("glutes", root, [-0.07, -0.03, -0.09], [0.08, 0.09, 0.05]);
  ov("hipflex", root, [0.08, 0.0, 0.08], [0.05, 0.07, 0.03]);
  ov("hipflex", root, [-0.08, 0.0, 0.08], [0.05, 0.07, 0.03]);

  const spine = new THREE.Group();
  spine.position.y = 0.06;
  root.add(spine);
  const abdomen = capsule(0.12, 0.12, body, 0.12);
  abdomen.scale.set(1.05, 1, 0.8);
  spine.add(abdomen);
  ov("abs", spine, [0, 0.12, 0.095], [0.065, 0.12, 0.03]);
  ov("obliques", spine, [0.105, 0.1, 0.05], [0.035, 0.1, 0.05]);
  ov("obliques", spine, [-0.105, 0.1, 0.05], [0.035, 0.1, 0.05]);
  ov("lowback", spine, [0.04, 0.12, -0.09], [0.035, 0.12, 0.03]);
  ov("lowback", spine, [-0.04, 0.12, -0.09], [0.035, 0.12, 0.03]);

  const chest = new THREE.Group();
  chest.position.y = 0.24;
  spine.add(chest);
  const thorax = capsule(0.15, 0.12, body, 0.13);
  thorax.scale.set(1.2, 1, 0.78);
  chest.add(thorax);
  ov("pecs", chest, [0.075, 0.16, 0.1], [0.075, 0.06, 0.035]);
  ov("pecs", chest, [-0.075, 0.16, 0.1], [0.075, 0.06, 0.035]);
  ov("lats", chest, [0.13, 0.08, -0.05], [0.05, 0.12, 0.06]);
  ov("lats", chest, [-0.13, 0.08, -0.05], [0.05, 0.12, 0.06]);
  ov("traps", chest, [0, 0.22, -0.08], [0.11, 0.08, 0.035]);

  const neck = new THREE.Group();
  neck.position.y = 0.3;
  chest.add(neck);
  neck.add(capsule(0.045, 0.06, body, 0.04));
  ov("neck", neck, [0.03, 0.04, 0.03], [0.018, 0.05, 0.018]);
  ov("neck", neck, [-0.03, 0.04, 0.03], [0.018, 0.05, 0.018]);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 16), body);
  head.scale.set(0.9, 1.12, 1);
  head.position.y = 0.17;
  neck.add(head);

  const sh: THREE.Group[] = [];
  const el: THREE.Group[] = [];
  const hand: THREE.Object3D[] = [];
  for (const s of [-1, 1]) {
    const g = new THREE.Group();
    g.position.set(0.2 * s, 0.25, 0);
    g.rotation.order = "ZXY";
    chest.add(g);
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 10), joint));
    g.add(capsule(0.048, 0.2, body));
    ov(s < 0 ? "deltFront" : "deltFront", g, [0, -0.03, 0.045], [0.045, 0.06, 0.03]);
    ov("deltSide", g, [0.045 * s, -0.03, 0], [0.03, 0.065, 0.045]);
    ov("deltRear", g, [0, -0.03, -0.045], [0.045, 0.06, 0.03]);
    ov("biceps", g, [0, -0.16, 0.035], [0.035, 0.09, 0.028]);
    ov("triceps", g, [0, -0.15, -0.035], [0.035, 0.1, 0.028]);
    const e = new THREE.Group();
    e.position.y = -0.3;
    g.add(e);
    e.add(new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 10), joint));
    e.add(capsule(0.04, 0.19, body));
    ov("forearm", e, [0.012 * s, -0.08, 0.02], [0.032, 0.09, 0.03]);
    const h = new THREE.Object3D();
    h.position.y = -0.3;
    e.add(h);
    const handMesh = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), body);
    handMesh.scale.set(0.8, 1.1, 0.5);
    h.add(handMesh);
    sh.push(g);
    el.push(e);
    hand.push(h);
  }

  const hip: THREE.Group[] = [];
  const kn: THREE.Group[] = [];
  const an: THREE.Group[] = [];
  const sole: THREE.Object3D[] = [];
  for (const s of [-1, 1]) {
    const g = new THREE.Group();
    g.position.set(0.1 * s, -0.05, 0);
    g.rotation.order = "ZXY";
    root.add(g);
    g.add(capsule(0.072, 0.3, body));
    ov("quads", g, [0, -0.22, 0.05], [0.06, 0.16, 0.04]);
    ov("hams", g, [0, -0.22, -0.05], [0.055, 0.16, 0.04]);
    ov("adductors", g, [-0.04 * s, -0.14, 0], [0.03, 0.12, 0.045]);
    const k = new THREE.Group();
    k.position.y = -0.44;
    g.add(k);
    k.add(new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), joint));
    k.add(capsule(0.052, 0.31, body));
    ov("calves", k, [0, -0.14, -0.045], [0.045, 0.11, 0.04]);
    ov("tibialis", k, [0.02 * s, -0.17, 0.035], [0.022, 0.12, 0.022]);
    const a = new THREE.Group();
    a.position.y = -0.43;
    k.add(a);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.06, 0.24), body);
    foot.position.set(0, -0.035, 0.07);
    a.add(foot);
    const so = new THREE.Object3D();
    so.position.set(0, -0.065, 0.06);
    a.add(so);
    hip.push(g);
    kn.push(k);
    an.push(a);
    sole.push(so);
  }

  const overlaySet = new Set([...overlays.values()].flat());
  const skin: Rig["skin"] = [];
  root.traverse((o) => {
    if (o instanceof THREE.Mesh && !overlaySet.has(o)) {
      skin.push({ mesh: o, original: o.material as THREE.Material });
      o.renderOrder = 3; // silhouette dessinée après les muscles
    }
  });

  return {
    skin,
    glass: makeGlass(),
    root,
    spine,
    chest,
    neck,
    sh: sh as [THREE.Group, THREE.Group],
    el: el as [THREE.Group, THREE.Group],
    hand: hand as [THREE.Object3D, THREE.Object3D],
    hip: hip as [THREE.Group, THREE.Group],
    kn: kn as [THREE.Group, THREE.Group],
    an: an as [THREE.Group, THREE.Group],
    sole: sole as [THREE.Object3D, THREE.Object3D],
    overlays,
    body,
  };
}

const toneOf = (id: string) => {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return MUSCLE_TONES[h % MUSCLE_TONES.length];
};

/** Rig du vrai modèle anatomique : mêmes articulations que le mannequin, mais os placés sur les centres articulaires réels. */
function buildAnatomyRig(scene: THREE.Object3D): Rig {
  const J = jointsData as unknown as Joints;
  const { pos, seg, sole } = buildSegments(J);
  const b = buildBones(pos);
  const skeleton = new THREE.Skeleton(BONES.map((n) => b[n]));
  b.root.updateMatrixWorld(true);
  skeleton.calculateInverses();

  const glass = makeGlass();
  const meshes = new THREE.Group();
  const muscles: NonNullable<Rig["anatomical"]>["muscles"] = [];
  let skinMesh: THREE.SkinnedMesh | null = null;
  let skeletonMesh: THREE.SkinnedMesh | null = null;
  scene.updateMatrixWorld(true);
  // Muscles et os d'abord : la peau reprend ensuite leurs poids (voir transferSkinWeights).
  const ordered: THREE.Mesh[] = [];
  scene.traverse((o) => o instanceof THREE.Mesh && ordered.push(o));
  ordered.sort((a, b) => Number(a.name === "SKIN") - Number(b.name === "SKIN"));
  const sources: THREE.BufferGeometry[] = [];
  ordered.forEach((o) => {
    const [kind, id] = o.name.split("__");
    const geo = o.geometry as THREE.BufferGeometry;
    const kindKey = o.name === "SKIN" ? "skin" : o.name === "SKELETON" ? "skeleton" : kind === "M" ? "muscle" : null;
    if (!kindKey) return;
    if (kindKey === "skin") transferSkinWeights(geo, sources, pos.sh0.y - 0.1);
    else {
      skinGeometry(geo, kindKey, kindKey === "muscle" ? id : null, seg);
      sources.push(geo);
    }
    let mat: THREE.Material;
    if (kindKey === "muscle")
      mat = new THREE.MeshPhysicalMaterial({ roughness: 0.45, clearcoat: 0.4, clearcoatRoughness: 0.4, sheen: 0.5, sheenColor: new THREE.Color("#ff9a8a"), transparent: true });
    else if (kindKey === "skin") mat = glass;
    else mat = new THREE.MeshStandardMaterial({ color: "#e8dcc2", roughness: 0.6, transparent: true, opacity: 0.22, depthWrite: false });
    const sm = new THREE.SkinnedMesh(geo, mat);
    sm.name = o.name;
    sm.frustumCulled = false;
    sm.bind(skeleton, new THREE.Matrix4());
    meshes.add(sm);
    if (kindKey === "muscle") muscles.push({ mesh: sm, id, mat: mat as THREE.MeshPhysicalMaterial, tone: toneOf(id) });
    else if (kindKey === "skin") { skinMesh = sm; sm.renderOrder = 3; }
    else { skeletonMesh = sm; sm.renderOrder = 2; }
  });

  // Grand dorsal et grand droit : absents de BodyParts3D, modelés sur la surface du corps.
  if (skinMesh) {
    for (const { id, geo } of buildExtraMuscles((skinMesh as THREE.SkinnedMesh).geometry, pos)) {
      skinGeometry(geo, "muscle", id, seg);
      const mat = new THREE.MeshPhysicalMaterial({ roughness: 0.45, clearcoat: 0.4, clearcoatRoughness: 0.4, sheen: 0.5, sheenColor: new THREE.Color("#ff9a8a"), transparent: true, side: THREE.DoubleSide });
      const sm = new THREE.SkinnedMesh(geo, mat);
      sm.name = `M__${id}`;
      sm.frustumCulled = false;
      sm.bind(skeleton, new THREE.Matrix4());
      meshes.add(sm);
      muscles.push({ mesh: sm, id, mat, tone: toneOf(id) });
    }
  }

  // Points de contact : paume (sous le poignet) et plante du pied.
  const hand = [0, 1].map((i) => {
    const h = new THREE.Object3D();
    h.position.set(0, -0.085, 0.03);
    b[i === 0 ? "wr0" : "wr1"].add(h);
    return h;
  }) as [THREE.Object3D, THREE.Object3D];
  const soles = [0, 1].map((i) => {
    const so = new THREE.Object3D();
    const an = i === 0 ? "an0" : "an1";
    so.position.copy(sole[i]).sub(pos[an]).add(new THREE.Vector3(0, 0, 0.07));
    b[an].add(so);
    return so;
  }) as [THREE.Object3D, THREE.Object3D];

  const overlays = new Map<string, THREE.Mesh[]>(); // plus utilisé par le modèle anatomique

  const restAbd = THREE.MathUtils.radToDeg(Math.atan2(Math.abs(pos.wr1.x - pos.sh1.x), pos.sh1.y - pos.wr1.y));

  return {
    root: b.root, spine: b.spine, chest: b.chest, neck: b.neck,
    sh: [b.sh0, b.sh1], el: [b.el0, b.el1], hand, fingers: [[b.fp0, b.fd0], [b.fp1, b.fd1]],
    hip: [b.hip0, b.hip1], kn: [b.kn0, b.kn1], an: [b.an0, b.an1], sole: soles,
    overlays,
    body: new THREE.MeshStandardMaterial(),
    skin: [],
    glass,
    anatomical: { muscles, skinMesh, skeletonMesh, meshes, restAbd, skeleton },
  };
}

const steel = new THREE.MeshStandardMaterial({ color: "#9aa4b2", metalness: 0.8, roughness: 0.3 });
const dark = new THREE.MeshStandardMaterial({ color: "#aab4c2", metalness: 0.5, roughness: 0.35 });
const pad = new THREE.MeshStandardMaterial({ color: "#334155", roughness: 0.8 });
const accent = new THREE.MeshStandardMaterial({ color: "#0891b2", roughness: 0.5, metalness: 0.3 });

function propObject(p: Prop): THREE.Object3D {
  const g = new THREE.Group();
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, pos: [number, number, number], rot?: [number, number, number]) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...pos);
    if (rot) m.rotation.set(...rot);
    m.castShadow = true;
    g.add(m);
    return m;
  };
  const bar = (len: number) => {
    add(new THREE.CylinderGeometry(0.014, 0.014, len, 12), steel, [0, 0, 0], [0, 0, Math.PI / 2]);
  };
  switch (p.kind) {
    case "barbell":
      bar(1.9);
      for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 28), accent, [0.72 * s, 0, 0], [0, 0, Math.PI / 2]);
      break;
    case "dumbbells":
      // une haltère par main : géré dans attach (rendu deux fois)
      add(new THREE.CylinderGeometry(0.014, 0.014, 0.16, 10), steel, [0, 0, 0], [0, 0, Math.PI / 2]);
      for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 16), accent, [0.08 * s, 0, 0], [0, 0, Math.PI / 2]);
      break;
    case "dumbbell":
      // une seule haltère tenue verticalement à deux mains (goblet, extension derrière la tête)
      add(new THREE.CylinderGeometry(0.016, 0.016, 0.2, 10), steel, [0, 0, 0]);
      for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 16), accent, [0, 0.1 * s, 0]);
      break;
    case "latBar":
      bar(1.1);
      break;
    case "handles":
      for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.02, 0.02, 0.14, 10), accent, [0.22 * s, 0, 0]);
      break;
    case "bench": {
      const [w, h, l] = p.size ?? [0.3, 0.44, 1.2];
      add(new THREE.BoxGeometry(w, 0.07, l), pad, [0, h / 2 - 0.035, 0]);
      add(new THREE.BoxGeometry(0.06, h - 0.07, 0.06), dark, [0, -0.035, -l / 2 + 0.1]);
      add(new THREE.BoxGeometry(0.06, h - 0.07, 0.06), dark, [0, -0.035, l / 2 - 0.1]);
      break;
    }
    case "rack":
      for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.05, 1.3, 0.05), dark, [0.55 * s, 0.65, 0]);
      break;
    case "seat": {
      // Pied du siège jusqu'au sol, quelle que soit la hauteur d'assise.
      const h = Math.max(0.05, (p.position?.[1] ?? 0.28) - 0.04);
      add(new THREE.BoxGeometry(0.42, 0.08, 0.42), pad, [0, 0, 0]);
      add(new THREE.BoxGeometry(0.06, h, 0.06), dark, [0, -0.04 - h / 2, 0]);
      add(new THREE.BoxGeometry(0.4, 0.03, 0.4), dark, [0, -0.04 - h + 0.015, 0]);
      break;
    }
    case "backrest":
      add(new THREE.BoxGeometry(0.4, 0.62, 0.08), pad, [0, 0, 0]);
      break;
    case "legPad":
      add(new THREE.CylinderGeometry(0.055, 0.055, 0.42, 16), pad, [0, 0, 0], [0, 0, Math.PI / 2]);
      break;
    case "sled":
      add(new THREE.BoxGeometry(0.6, 0.05, 0.55), accent, [0, 0, 0]);
      break;
    case "pullupBar":
      bar(1.4);
      { // montants jusqu'au sol (avant : 2,35 m fixes, qui traversaient le sol pour une barre basse)
        const h = (p.position?.[1] ?? 2.3) + 0.05;
        for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.06, h, 0.06), dark, [0.68 * s, -h / 2 + 0.05, 0]);
      }
      break;
    case "parallelBars":
      // Écartement = celui des mains (0,30 m de l'axe), montants jusqu'au sol.
      for (const s of [-1, 1]) {
        const h = p.position?.[1] ?? 1.2;
        add(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 12), steel, [0.3 * s, 0, 0.05], [Math.PI / 2, 0, 0]);
        add(new THREE.BoxGeometry(0.05, h, 0.05), dark, [0.3 * s, -h / 2, 0.45]);
        add(new THREE.BoxGeometry(0.05, h, 0.05), dark, [0.3 * s, -h / 2, -0.35]);
      }
      break;
    case "kettlebell":
      add(new THREE.SphereGeometry(0.085, 20, 16), dark, [0, -0.11, 0]);
      add(new THREE.TorusGeometry(0.05, 0.012, 8, 20), steel, [0, -0.01, 0]);
      break;
    case "mat":
      add(new THREE.BoxGeometry(0.7, 0.01, 1.9), pad, [0, 0, 0]);
      break;
  }
  return g;
}

interface Props {
  anim: Animation;
  timeRef: React.MutableRefObject<number>;
  anatomy: boolean;
  roles: MuscleRoles;
  showProps?: boolean;
  /** "anatomie" = vrais muscles BodyParts3D animés ; "mannequin" = silhouette simplifiée. */
  figure?: "anatomie" | "mannequin";
  /** true pendant la répétition « geste à éviter ». */
  fault?: React.MutableRefObject<boolean>;
}

const v1 = new THREE.Vector3();
const v2 = new THREE.Vector3();
const mC = new THREE.Matrix4();
const mS = new THREE.Matrix4();
const q = new THREE.Quaternion();
const qH = new THREE.Quaternion();
const Y_AXIS = new THREE.Vector3(0, 1, 0);

useGLTF.preload(ANIM_MODEL, ((window as any).A3D_BASE||"atlas3d/")+"draco/");

export default function Mannequin({ anim, timeRef, anatomy, roles, showProps = true, figure = "anatomie", fault }: Props) {
  const { scene } = useGLTF(ANIM_MODEL, ((window as any).A3D_BASE||"atlas3d/")+"draco/");
  const rig = useMemo(() => (figure === "anatomie" ? buildAnatomyRig(scene) : buildRig()), [figure, scene]);
  const holder = useRef<THREE.Group>(null);

  // Objets accessoires : statiques dans le monde, ou accrochés au mannequin.
  const props = useMemo(
    () =>
      // Avec une machine modélisée, ses poignées remplacent les petites poignées génériques.
      anim.props.filter((p) => !(anim.machine && p.kind === "handles")).map((p) => {
        const obj = propObject(p);
        const extra = p.kind === "dumbbells" && p.attach === "hands" ? propObject(p) : null;
        if (!p.attach) {
          obj.position.set(...(p.position ?? [0, 0, 0]));
          if (p.rotation) obj.rotation.set(...p.rotation);
        }
        if (p.attach === "chest") {
          obj.position.set(...(p.position ?? [0, 0, 0]));
          rig.chest.add(obj);
        }
        return { p, obj, extra };
      }),
    [anim, rig],
  );

  useEffect(
    () => () => {
      props.forEach(({ p, obj }) => p.attach === "chest" && rig.chest.remove(obj));
    },
    [props, rig],
  );

  const machine = useMemo(() => (anim.machine ? buildMachine(anim.machine) : null), [anim]);

  const cable = useMemo(() => {
    if (!anim.cableTo) return null;
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(...anim.cableTo)]);
    return new THREE.Line(geo, new THREE.LineBasicMaterial({ color: "#67e8f9" }));
  }, [anim]);

  // Couleurs des zones musculaires (mode anatomie active)
  useMemo(() => {
    const zoneRole = new Map<string, "principal" | "secondaire" | "stabilisateur">();
    const rank = { principal: 3, secondaire: 2, stabilisateur: 1 };
    const meshIds = new Set(rig.anatomical?.muscles.map((m) => m.id) ?? []);
    for (const [mid, role] of Object.entries(roles)) {
      if (meshIds.has(mid)) continue; // déjà coloré sur le vrai muscle
      const z = overlayOf[mid];
      if (!z) continue;
      const cur = zoneRole.get(z);
      if (!cur || rank[role] > rank[cur]) zoneRole.set(z, role);
    }
    rig.overlays.forEach((meshes, zone) => {
      const role = zoneRole.get(zone);
      for (const m of meshes) {
        const mat = m.material as THREE.MeshStandardMaterial;
        mat.opacity = anatomy && role ? 0.95 : 0;
        if (role) {
          mat.color.set(ROLE_COLORS[role]);
          mat.emissive.set(ROLE_COLORS[role]);
          mat.emissiveIntensity = 0.35;
        }
        m.userData.weight = role === "principal" ? 1 : role === "secondaire" ? 0.6 : 0.3;
        m.visible = anatomy && !!role;
      }
    });
    const A = rig.anatomical;
    if (A) {
      for (const m of A.muscles) {
        const role = roles[m.id];
        m.mesh.visible = anatomy ? !!role : true;
        m.mat.color.set(anatomy && role ? ROLE_COLORS[role] : m.tone);
        m.mat.emissive.set(anatomy && role ? ROLE_COLORS[role] : "#000000");
        m.mat.emissiveIntensity = anatomy && role ? 0.35 : 0;
        m.mesh.userData.weight = role === "principal" ? 1 : role === "secondaire" ? 0.6 : role ? 0.3 : 0;
      }
      if (A.skinMesh) A.skinMesh.visible = anatomy;
      if (A.skeletonMesh) A.skeletonMesh.visible = anatomy;
    }
    // Mode anatomie : silhouette translucide, seuls les muscles sollicités sont colorés.
    for (const { mesh, original } of rig.skin) {
      mesh.material = anatomy ? rig.glass : original;
      mesh.castShadow = !anatomy;
    }
  }, [roles, anatomy, rig]);

  useFrame(({ clock }) => {
    const t = timeRef.current;
    // Intensité d'activation (pédagogique) : maximale pendant la phase concentrique, plus faible au retour.
    let act: number;
    if (!anim.concentric) act = 0.75 + 0.15 * Math.sin(clock.elapsedTime * 4);
    else {
      const [a, b] = anim.concentric;
      act = t >= a && t <= b ? 0.55 + 0.45 * Math.sin((Math.PI * (t - a)) / (b - a)) : 0.4;
    }
    if (anatomy)
      rig.overlays.forEach((meshes) => {
        for (const m of meshes) {
          if (!m.visible) continue;
          const w = (m.userData.weight as number) ?? 0;
          (m.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.15 + 1.1 * act * w;
          const k = 1 + 0.12 * act * w; // le muscle « gonfle » légèrement en se contractant
          m.scale.copy(m.userData.baseScale as THREE.Vector3).multiplyScalar(k);
        }
      });
    if (anatomy && rig.anatomical)
      for (const m of rig.anatomical.muscles) {
        if (!m.mesh.visible) continue;
        m.mat.emissiveIntensity = 0.12 + 1.0 * act * ((m.mesh.userData.weight as number) ?? 0);
      }
    const p = fault?.current ? faultPoseAt(anim, t) : poseAt(anim, t);
    const foreAxis = rig.el.map((e) => {
      const w = e.children.find((c) => (c as THREE.Bone).isBone);
      return w ? w.position.clone().normalize() : new THREE.Vector3(0, -1, 0);
    });
    const restAbd = rig.anatomical?.restAbd ?? 0;
    const r = rig;
    r.root.position.set(0, 0, 0);
    r.root.rotation.set(D(p.rootPitch), 0, 0);
    // twist = rotation du buste (axe vertical du tronc), lean = inclinaison sur le côté.
    r.spine.rotation.set(D(p.spine * 0.6), D(p.twist * 0.5), D(p.lean * 0.5));
    r.chest.rotation.set(D(p.spine * 0.4), D(p.twist * 0.5), D(p.lean * 0.5));
    r.neck.rotation.x = D(p.neck);
    const p0 = p;
    [0, 1].forEach((i) => {
      const s = i === 0 ? -1 : 1;
      // Valeurs de ce côté (surcharges « _0 » / « _1 » pour les exercices unilatéraux).
      const q1 = p0 as unknown as Record<string, number>;
      const p = new Proxy(p0, { get: (o, k: string) => q1[`${k}_${i}`] ?? (o as unknown as Record<string, number>)[k] }) as typeof p0;
      r.sh[i].rotation.set(-D(p.shFlex), 0, D(p.shAbd - restAbd) * s);
      // Haussement d'épaules (shrug, en cm) : l'épaule monte le long du tronc.
      const y0 = (r.sh[i].userData.y0 ??= r.sh[i].position.y) as number;
      r.sh[i].position.y = y0 + p.shrug / 100;
      if (p.shHor) r.sh[i].quaternion.premultiply(qH.setFromAxisAngle(Y_AXIS, D(p.shHor) * s));
      r.el[i].rotation.set(-D(p.elbow), 0, 0);
      // Pronation répartie coude / poignet pour éviter l'effet « papillote » de la peau à un seul endroit.
      if (p.pron) {
        r.el[i].quaternion.multiply(qH.setFromAxisAngle(foreAxis[i], D(p.pron) * s * 0.45));
        const wr = r.hand[i].parent;
        if (wr && wr !== r.el[i]) wr.quaternion.setFromAxisAngle(foreAxis[i], D(p.pron) * s * 0.55);
      } else {
        const wr = r.hand[i].parent;
        if (wr && wr !== r.el[i]) wr.quaternion.identity();
      }
      r.hip[i].rotation.set(-D(p.hipFlex), 0, D(p.hipAbd) * s);
      // Doigts qui se referment vers la paume (grip = flexion des jointures, en degrés).
      if (r.fingers) {
        r.fingers[i][0].rotation.set(-D(p.grip), 0, 0);
        r.fingers[i][1].rotation.set(-D(p.grip * 1.15), 0, 0);
      }
      r.kn[i].rotation.set(D(p.knee), 0, 0);
      r.an[i].rotation.set(-D(p.ankle), 0, 0);
    });
    r.root.updateMatrixWorld(true);

    // Ancrage : garder les pieds au sol ou les mains sur la barre.
    if (anim.anchor) {
      if (anim.anchor === "toes" && !r.toes)
        r.toes = r.sole.map((so) => {
          const o = new THREE.Object3D();
          o.position.set(0, 0, TOE_FWD);
          so.add(o);
          return o;
        }) as [THREE.Object3D, THREE.Object3D];
      const one = { foot0: r.sole[0], foot1: r.sole[1], hand0: r.hand[0], hand1: r.hand[1] }[anim.anchor as string];
      if (one) one.getWorldPosition(v1);
      else {
        const pts = anim.anchor === "feet" ? r.sole : anim.anchor === "toes" ? r.toes! : r.hand;
        pts[0].getWorldPosition(v1);
        pts[1].getWorldPosition(v2);
        v1.add(v2).multiplyScalar(0.5);
      }
      const target = new THREE.Vector3(...(anim.anchorTarget ?? [0, 0, 0]));
      r.root.position.copy(target.sub(v1));
    } else if (anim.rootPos) {
      r.root.position.set(...anim.rootPos);
    }
    r.root.updateMatrixWorld(true);

    // Sonde de contrôle (tools/a3d-check.html) : positions monde des points de contact.
    const W = window as unknown as { A3D_PROBE?: Record<string, number[]> };
    if (W.A3D_PROBE) {
      const g = (o: THREE.Object3D) => o.getWorldPosition(new THREE.Vector3()).toArray().map((x) => +x.toFixed(3));
      W.A3D_PROBE = { id: anim.id as unknown as number[], t: [t], sole0: g(r.sole[0]), sole1: g(r.sole[1]), toe0: g(r.toes ? r.toes[0] : r.sole[0]), hand0: g(r.hand[0]), hand1: g(r.hand[1]), root: g(r.root), neck: g(r.neck), kn0: g(r.kn[0]), an0: g(r.an[0]), el0: g(r.el[0]) };
    }
    // Accessoires accrochés
    for (const { p, obj, extra } of props) {
      if (p.attach === "hand0" || p.attach === "hand1") {
        r.hand[p.attach === "hand0" ? 0 : 1].getWorldPosition(obj.position);
      } else if (p.attach === "hands") {
        r.hand[0].getWorldPosition(v1);
        r.hand[1].getWorldPosition(v2);
        if (extra) {
          obj.position.copy(v1);
          extra.position.copy(v2);
        } else obj.position.copy(v1).add(v2).multiplyScalar(0.5);
      } else if (p.attach === "shins" || p.attach === "feet") {
        const src = p.attach === "shins" ? r.an : r.sole;
        src[0].getWorldPosition(v1);
        src[1].getWorldPosition(v2);
        obj.position.copy(v1).add(v2).multiplyScalar(0.5);
        if (p.attach === "feet") {
          if (p.rotation) {
            // Inclinaison fixe (plaque de presse sur ses rails) : la plaque reste parallèle à elle-même, juste derrière les plantes.
            obj.rotation.set(...p.rotation);
            obj.translateY(0.035);
          } else {
            r.an[0].getWorldQuaternion(q);
            obj.quaternion.copy(q);
            obj.translateY(-0.03);
          }
        }
      }
    }
    if (machine) {
      const pts = {} as Record<BodyPoint, THREE.Vector3>;
      pts.hand0 = r.hand[0].getWorldPosition(new THREE.Vector3());
      pts.hand1 = r.hand[1].getWorldPosition(new THREE.Vector3());
      pts.hands = pts.hand0.clone().add(pts.hand1).multiplyScalar(0.5);
      pts.shin0 = r.an[0].getWorldPosition(new THREE.Vector3());
      pts.shin1 = r.an[1].getWorldPosition(new THREE.Vector3());
      pts.shins = pts.shin0.clone().add(pts.shin1).multiplyScalar(0.5);
      pts.feet = r.sole[0].getWorldPosition(new THREE.Vector3()).add(r.sole[1].getWorldPosition(new THREE.Vector3())).multiplyScalar(0.5);
      pts.root = r.root.getWorldPosition(new THREE.Vector3());
      pts.neck = r.neck.getWorldPosition(new THREE.Vector3());
      pts.knees = r.kn[0].getWorldPosition(new THREE.Vector3()).add(r.kn[1].getWorldPosition(new THREE.Vector3())).multiplyScalar(0.5);
      // Progression du mouvement (0 → 1 → 0) ; les plaques montent pendant la phase d'effort.
      const e = (x: number) => x * x * (3 - 2 * x);
      const prog = t < 0.5 ? e(t / 0.5) : e((1 - t) / 0.5);
      machine.update(pts, anim.concentric && anim.concentric[0] > 0 ? 1 - prog : prog);
    }
    // Pectoral / grand dorsal : la partie humérale suit la terminaison sur l'humérus.
    const A = r.anatomical;
    if (A) {
      const ci = BONES.indexOf("chest");
      r.chest.updateWorldMatrix(true, false);
      mC.multiplyMatrices(r.chest.matrixWorld, A.skeleton.boneInverses[ci]).invert();
      for (const m of A.muscles) {
        const st = m.mesh.geometry.userData.stretch as { side: 0 | 1; ins: [number, number, number] } | undefined;
        if (!st || !m.mesh.visible || !m.mesh.morphTargetInfluences) continue;
        const sb = r.sh[st.side];
        sb.updateWorldMatrix(true, false);
        mS.multiplyMatrices(sb.matrixWorld, A.skeleton.boneInverses[BONES.indexOf(st.side ? "sh1" : "sh0")]);
        v1.set(...st.ins).applyMatrix4(mS).applyMatrix4(mC).sub(v2.set(...st.ins));
        m.mesh.morphTargetInfluences[0] = v1.x;
        m.mesh.morphTargetInfluences[1] = v1.y;
        m.mesh.morphTargetInfluences[2] = v1.z;
      }
    }
    if (cable) {
      r.hand[0].getWorldPosition(v1);
      r.hand[1].getWorldPosition(v2);
      v1.add(v2).multiplyScalar(0.5);
      const pos = cable.geometry.attributes.position as THREE.BufferAttribute;
      pos.setXYZ(0, v1.x, v1.y, v1.z);
      pos.needsUpdate = true;
    }
  });

  return (
    <group ref={holder}>
      <primitive object={rig.root} />
      {rig.anatomical && <primitive object={rig.anatomical.meshes} />}
      {showProps &&
        props.map(({ p, obj, extra }, i) =>
          p.attach === "chest" ? null : (
            <group key={i}>
              <primitive object={obj} />
              {extra && <primitive object={extra} />}
            </group>
          ),
        )}
      {cable && <primitive object={cable} />}
      {showProps && machine && <primitive object={machine.group} />}
    </group>
  );
}
