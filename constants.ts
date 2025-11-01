import type { StrategyKey } from './types';

export const STRATEGIES: Record<StrategyKey, string> = {
  COOPERATIVE_ALIGN: "Use 'Pacing and Leading.' Match their language, acknowledge their reality, then lead to your outcome.",
  GENTLE_PERSUASION: "Use 'Framing and Reciprocity.' Frame positively, offer a small concession to increase agreeability.",
  ASSERT_BOUNDARIES: "Use 'Clear, Firm Language.' Be polite but direct. State your position without excessive apology.",
  BUILD_RAPPORT: "Use 'Empathy and Shared Identity.' Validate feelings, find common ground before making requests.",
  DEESCALATE_CONFLICT: "Use 'Validation and Reframing.' Validate emotions, reframe from conflict to shared challenge.",
  PROVIDE_CLARITY: "Use 'Direct & Simple Language.' Avoid jargon. State facts, context, and next steps clearly."
};

export const TEMPLATES: Record<string, {message: string, context: string}> = {
  work: {
    message: "Hi team,\n\nJust checking in on the status of Project Phoenix. We're a bit behind schedule and I need an update for the leadership meeting on Friday. What's the new ETA?\n\nThanks,\nSarah",
    context: "This is from my manager, Sarah. She's asking for an update on Project Phoenix, which is running late. My goal is to sound responsible, acknowledge the delay, but confidently set a new, realistic timeline."
  },
  friend: {
    message: "Hey, was pretty bummed you cancelled on Saturday. Is everything okay?",
    context: "This is from my friend, Alex. They seem upset that I cancelled our plans last weekend. My goal is to validate their feelings, apologize sincerely, and find a good time to reschedule."
  },
  customer: {
    message: "This is UNACCEPTABLE! My order A-123 arrived completely smashed. I paid good money for this and I want a refund IMMEDIATELY. This is the worst service I've ever received.",
    context: "This is from an angry customer, John Doe. Their order (A-123) arrived damaged. My goal is to de-escalate their anger, show empathy, and provide a clear, immediate solution."
  }
};

const commonCardStyle = {
    gradient: "bg-neutral-900",
    iconBg: "bg-neutral-800",
    iconColor: "text-emerald-400"
};

export const STRATEGY_DETAILS: Record<StrategyKey, { name: string; description: string; icon: string; gradient: string; iconBg: string; iconColor: string }> = {
    COOPERATIVE_ALIGN: { name: "Cooperate & Align", description: "Pacing & Leading for agreement", icon: "handshake", ...commonCardStyle },
    GENTLE_PERSUASION: { name: "Gentle Persuasion", description: "Framing & Reciprocity", icon: "arrow-right", ...commonCardStyle },
    ASSERT_BOUNDARIES: { name: "Assert Boundaries", description: "Clear, firm language", icon: "shield", ...commonCardStyle },
    BUILD_RAPPORT: { name: "Build Rapport", description: "Empathy & Connection", icon: "heart", ...commonCardStyle },
    DEESCALATE_CONFLICT: { name: "De-escalate Conflict", description: "Validation & Reframing", icon: "shield-check", ...commonCardStyle },
    PROVIDE_CLARITY: { name: "Provide Clarity", description: "Direct & Simple", icon: "eye", ...commonCardStyle }
};
