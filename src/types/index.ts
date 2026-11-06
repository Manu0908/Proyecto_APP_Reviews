export type BiosecurityLevel =
  | "organico"
  | "filtrado"
  | "antiseptico"
  | "esterilizado"
  | "aseptico";

export interface HygieneMetric {
  id: string;
  name: string;
  subtitle: string;
  value: string;
  scoreDisplay: string;
  tag: string;
  icon: string;
  passed: boolean;
  threshold?: string;
  progressPercent: number;
}

export interface ChronologyEvent {
  id: string;
  title: string;
  timestamp: string;
  detail: string;
  badge: string;
  type: "primary" | "secondary" | "muted";
}

export interface QuickAuditArea {
  id: string;
  number: number;
  name: string;
  code: string;
  icon: string;
  description: string;
  chips: {
    id: string;
    label: string;
    selectedByDefault: boolean;
  }[];
}

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  cuisine: string;
  subCuisine: string;
  location: string;
  coordinates: string;
  grade: number;
  level: BiosecurityLevel;
  auditCycle: string;
  auditDate: string;
  accreditation: string;
  verifiedProtocolHash: string;
  description: string;
  heroImage: string;
  metrics: {
    surfacePurity: number;
    coldChain: string;
    airQuality: string;
    infractions: number;
  };
  detailedMetrics: HygieneMetric[];
  chronology: ChronologyEvent[];
}

export interface InspectorProfile {
  id: string;
  username: string;
  handle: string;
  rankTitle: string;
  rankLevel: number;
  currentXP: number;
  nextLevelXP: number;
  totalAudits: number;
  verifiedReceipts: number;
  consensusScore: number;
  avatarUrl: string;
  badges: {
    id: string;
    name: string;
    icon: string;
    date: string;
  }[];
}
