import { HomeRepository } from "./homeRepository";
import { HomeData } from "../model/types";

const mockHomeData: HomeData = {
  user: {
    firstName: "Aditya",
  },
  language: {
    code: "kn",
    label: "Kannada",
  },
  streakCount: 6,
  recommendedScenarioId: "sabzi-mandi",
  scenarios: [
    {
      id: "auto-rickshaw",
      title: "Auto Rickshaw",
      blurb: "Negotiate a fare. Give directions. Keep your cool.",
      characterName: "Ravi",
      characterRole: "Auto driver, mid-50s",
      estimatedMinutes: "4-6 min",
      glyph: "auto",
      bestScore: 84,
    },
    {
      id: "chai-stall",
      title: "Chai Stall",
      blurb: "Order a small tea. Make small talk. Pay ten rupees.",
      characterName: "Lakshmi",
      characterRole: "Stall owner, 40s",
      estimatedMinutes: "3-5 min",
      glyph: "chai",
      bestScore: 89,
    },
    {
      id: "sabzi-mandi",
      title: "Sabzi Mandi",
      blurb: "Ask prices, count in Kannada, bargain politely.",
      characterName: "Suresh",
      characterRole: "Vegetable vendor",
      estimatedMinutes: "5-7 min",
      glyph: "sabzi",
    },
    {
      id: "pharmacy",
      title: "Pharmacy",
      blurb: "Describe a symptom. Understand the dosage you’re given.",
      characterName: "Priya",
      characterRole: "Pharmacist, 30s",
      estimatedMinutes: "5-7 min",
      glyph: "pharm",
    },
    {
      id: "landlord-call",
      title: "Landlord Call",
      blurb: "Report a maintenance issue. Agree when it gets fixed.",
      characterName: "Krishna",
      characterRole: "Landlord, 60s",
      estimatedMinutes: "6-9 min",
      glyph: "phone",
    },
    {
      id: "doctor-visit",
      title: "Doctor Visit",
      blurb: "Walk through medical history. Ask what you need to ask.",
      characterName: "Dr. Rao",
      characterRole: "GP, 50s",
      estimatedMinutes: "7-10 min",
      glyph: "doc",
    },
  ],
  difficultyOptions: [
    {
      id: "easy",
      label: "Easy",
      description: "Suggested phrases on screen. Slower agent.",
      tag: "Scaffolded",
    },
    {
      id: "medium",
      label: "Medium",
      description: "No hints. Normal pace. Patient agent.",
      tag: "Default",
    },
    {
      id: "hard",
      label: "Hard",
      description: "Real Bangalore pace. Slang, interruptions.",
    },
  ],
};

export class MockHomeRepository implements HomeRepository {
  async getHomeData(): Promise<HomeData> {
    return Promise.resolve(mockHomeData);
  }
}
