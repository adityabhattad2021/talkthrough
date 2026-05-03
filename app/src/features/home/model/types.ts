export type ScenarioId =
  | "auto_rickshaw"
  | "chai_stall"
  | "sabzi_mandi"
  | "pharmacy"
  | "landlord_call"
  | "doctor_visit";

export type DifficultyId = "easy" | "medium" | "hard";

export type ScenarioGlyph =
  | "auto"
  | "chai"
  | "sabzi"
  | "pharm"
  | "phone"
  | "doc";

export type UserProfile = {
  firstName: string;
};

export type LearningLanguage = {
  code: string;
  label: string;
};

export type ScenarioSummary = {
  id: ScenarioId;
  title: string;
  blurb: string;
  characterName: string;
  characterRole: string;
  estimatedMinutes: string;
  glyph: ScenarioGlyph;
  bestScore?: number;
};

export type DifficultyOption = {
  id: DifficultyId;
  label: string;
  description: string;
  tag?: string;
};

export type HomeData = {
  user: UserProfile;
  language: LearningLanguage;
  streakCount: number;
  recommendedScenarioId?: ScenarioId;
  scenarios: ScenarioSummary[];
  difficultyOptions: DifficultyOption[];
};
