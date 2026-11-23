// Fiche exercice 3D (moteur repris d'Atlas Fitness 3D) pour Ektyron.
// Construit par tools/build-atlas3d.sh → atlas3d/atlas3d.js (expose window.A3D_ENGINE).
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import * as THREE from "three";
import { animationById, phaseAt } from "./lib/animations";
import { exerciseById } from "./data/exercises";
import Mannequin, { type MuscleRoles, ROLE_COLORS } from "./three/Mannequin";

type View = "face" | "profil" | "dos" | "3/4";
const VIEWS: Record<View, [number, number, number]> = {
  face: [0, 1.1, 2.8],
  profil: [2.8, 1.1, 0],
  dos: [0, 1.1, -2.8],
  "3/4": [2.0, 1.35, 2.0],
};
const TARGET_HANDS: [number, number, number] = [0, 1.5, 0];
const TARGET_BODY: [number, number, number] = [0, 0.85, 0];

function Clock({ timeRef, playing, speed, duration }: { timeRef: React.MutableRefObject<number>; playing: boolean; speed: number; duration: number }) {
  useFrame((_, dt) => {
    if (playing) timeRef.current = (timeRef.current + (Math.min(dt, 0.1) * speed) / duration) % 1;
  });
  return null;
}

function CameraRig({ view, nonce, target }: { view: View; nonce: number; target: [number, number, number] }) {
  const { camera, controls } = useThree() as unknown as { camera: THREE.PerspectiveCamera; controls: { target: THREE.Vector3; update: () => void } | null };
  useEffect(() => {
    camera.position.set(...VIEWS[view]);
    if (controls) {
      controls.target.set(...target);
      controls.update();
    } else camera.lookAt(...target);
  }, [view, nonce, camera, controls, target]);
  return null;
}

function rolesOf(exId: string): MuscleRoles {
  const e = exerciseById[exId];
  const r: MuscleRoles = {};
  if (!e) return r;
  e.stabilizers.forEach((m) => (r[m] = "stabilisateur"));
  e.secondary.forEach((m) => (r[m] = "secondaire"));
  e.primary.forEach((m) => (r[m] = "principal"));
  return r;
}

function Player({ exId, tech }: { exId: string; tech: boolean }) {
  const ex = exerciseById[exId];
  const anim = ex?.animation ? animationById[ex.animation] : undefined;
  const roles = useRef(rolesOf(exId)).current;
  const timeRef = useRef(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [anatomy, setAnatomy] = useState(true);
  const [view, setView] = useState<View>("3/4");
  const [nonce, setNonce] = useState(0);
  const [phase, setPhase] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => anim && setPhase(phaseAt(anim, timeRef.current)), 150);
    return () => clearInterval(id);
  }, [anim]);

  if (!anim) return null;
  const target = anim.anchor === "hands" ? TARGET_HANDS : TARGET_BODY;

  return (
    <div className="a3d-box">
      <div className="a3d-stage">
        <Canvas shadows camera={{ position: VIEWS["3/4"], fov: 40 }} dpr={[1, 2]}>
          <color attach="background" args={["#05070B"]} />
          <hemisphereLight args={["#ffe2c4", "#0f172a", 0.75]} />
          <directionalLight position={[3, 5, 4]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
          <directionalLight position={[-4, 3, -3]} intensity={0.55} color="#ff8a3d" />
          <Clock timeRef={timeRef} playing={playing} speed={speed} duration={anim.duration} />
          <Suspense fallback={null}>
            <Mannequin anim={anim} timeRef={timeRef} anatomy={anatomy} roles={roles} />
          </Suspense>
          <ContactShadows position={[0, 0.002, 0]} opacity={0.5} blur={2.5} scale={6} />
          <OrbitControls makeDefault enablePan={false} minDistance={1.5} maxDistance={7} target={target} />
          <CameraRig view={view} nonce={nonce} target={target} />
        </Canvas>
        <div className={"a3d-phase a3d-" + (phase === "concentrique" ? "con" : phase === "excentrique" ? "exc" : "iso")}>{phase}</div>
        {anatomy && (
          <div className="a3d-leg">
            {(["principal", "secondaire", "stabilisateur"] as const).map((r) => (
              <span key={r}><i style={{ background: ROLE_COLORS[r] }} />{r}</span>
            ))}
          </div>
        )}
        {anim.machine?.label && <div className="a3d-mach">{anim.machine.label} · <span>cyan</span> = pièces qui bougent</div>}
      </div>
      <div className="a3d-ctl">
        <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Lecture"}>{playing ? "❚❚" : "▶"}</button>
        <button className={speed === 0.5 ? "on" : ""} onClick={() => setSpeed(speed === 0.5 ? 1 : 0.5)}>×0,5</button>
        {(Object.keys(VIEWS) as View[]).map((v) => (
          <button key={v} className={view === v ? "on" : ""} onClick={() => { setView(v); setNonce((n) => n + 1); }}>{v}</button>
        ))}
        <button className={anatomy ? "on" : ""} onClick={() => setAnatomy((a) => !a)} aria-label="Muscles colorés">Muscles</button>
        {tech && <button className={open ? "on" : ""} onClick={() => setOpen((o) => !o)}>Technique</button>}
      </div>
      <div className="a3d-cred">Anatomie : BodyParts3D © DBCLS, CC BY 4.0 (modifié)</div>
      {tech && open && ex && (
        <div className="a3d-tech">
          <p><b>Départ</b>{ex.start}</p>
          <p><b>Mouvement</b>{ex.execution}</p>
          {ex.concentric && <p><b className="a3d-con">Effort</b>{ex.concentric}</p>}
          {ex.eccentric && <p><b className="a3d-exc">Retour</b>{ex.eccentric}</p>}
          <p><b>Respiration</b>{ex.breathing}</p>
          <p><b>Amplitude</b>{ex.amplitude}</p>
          {ex.mistakes.length > 0 && <><b>Erreurs fréquentes</b><ul>{ex.mistakes.map((m) => <li key={m}>{m}</li>)}</ul></>}
          {ex.safety.length > 0 && <><b>Sécurité</b><ul>{ex.safety.map((m) => <li key={m}>{m}</li>)}</ul></>}
          <small>Repères pédagogiques, pas un avis médical. Couleurs des muscles : sollicitation estimée, pas une mesure.</small>
        </div>
      )}
    </div>
  );
}

(window as unknown as { A3D_ENGINE: unknown }).A3D_ENGINE = {
  mount(el: HTMLElement, exId: string, tech = true) {
    const root = createRoot(el);
    root.render(<Player exId={exId} tech={tech} />);
    return () => root.unmount();
  },
};
