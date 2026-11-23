// Types partagés — ils reflètent le schéma SQL de supabase/migrations.
// Cette couche "métier" ne dépend pas de React : elle pourra être réutilisée
// telle quelle dans une future app React Native / Expo.

export type RegionId =
  | "tete-cou"
  | "epaules"
  | "pectoraux"
  | "dos"
  | "bras"
  | "avant-bras"
  | "abdominaux"
  | "hanches"
  | "cuisses"
  | "jambes";

export interface MuscleRegion {
  id: RegionId;
  name: string;
  color: string; // couleur pédagogique du groupe dans l'atlas
}

export interface SourceRef {
  label: string;
  url: string;
}

export interface Muscle {
  id: string;
  nameFr: string;
  nameLatin: string;
  region: RegionId;
  depth: "superficiel" | "profond";
  /** Noms anglais BodyParts3D utilisés pour retrouver les maillages 3D (sans "right"/"left"). */
  bp3d: string[];
  location: string;
  origin: string;
  insertion: string;
  functions: string[];
  joints: string[];
  synergists: string[]; // ids de muscles
  antagonists: string[]; // ids de muscles
  sources: SourceRef[];
}

export type Level = "débutant" | "intermédiaire" | "avancé";
export type ExerciseType = "machine" | "poids-libres" | "poulie" | "calisthenie";

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  level: Level;
  description: string;
  primary: string[]; // muscles principaux
  secondary: string[];
  stabilizers: string[];
  machineFamilies: string[]; // familles de machines (ids)
  equipment: string[]; // équipements libres (ids)
  movement: "poussée" | "tirage" | "jambes-poussée" | "jambes-tirage" | "isolation" | "gainage" | "statique";
  goals: string[];
  start: string;
  execution: string;
  concentric: string;
  eccentric: string;
  breathing: string;
  amplitude: string;
  mistakes: string[];
  safety: string[];
  joints: string[];
  animation?: string; // id d'animation 3D (src/lib/animations.ts)
}

export type Verification = "CONFIRMÉ" | "DOCUMENTÉ" | "À VÉRIFIER";

export interface Manufacturer {
  id: string;
  name: string;
  website: string;
  country: string;
  group?: string;
  lines: { name: string; type: string; url?: string }[];
  description: string;
}

export interface MachineFamily {
  id: string;
  name: string;
  nameFr: string;
  category: "pectoraux" | "dos" | "épaules" | "bras" | "jambes" | "fessiers" | "abdominaux" | "multi";
  resistance: string;
  description: string;
  settings: string[];
  usage: string[];
  exercises: string[]; // ids d'exercices
  alternatives: string[]; // ids d'exercices (haltères, poulies, calisthénie)
}

export interface MachineModel {
  id: string;
  familyId: string;
  manufacturerId: string;
  line: string;
  model: string;
  reference?: string;
  resistance: "sélectorisée (pile de poids)" | "chargée (disques)" | "poulie";
  sourceUrl: string;
  verifiedOn: string; // date de vérification
  notes?: string;
}

export interface GymChain {
  id: string;
  name: string;
  website: string;
  country: string;
  description: string;
  facts: { text: string; source: SourceRef }[];
}

export interface ChainManufacturerLink {
  chainId: string;
  manufacturerId: string;
  level: Verification;
  scope: string; // "réseau", "certains clubs", "club précis"…
  source: SourceRef;
  verifiedOn: string;
  note?: string;
}

export interface GymLocation {
  id: string;
  chainId: string;
  name: string;
  city: string;
  address?: string;
  source: SourceRef;
  /** Équipements/marques constatés dans CE club, avec leur niveau. */
  inventory: {
    manufacturerId?: string;
    familyId?: string;
    level: Verification;
    detail: string;
    source: SourceRef;
  }[];
}
