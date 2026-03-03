import { Type } from "@google/genai";

export const SAFETY_PLAN_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    risk_level: {
      type: Type.STRING,
      description: "The assessed risk level: low, medium, or high",
    },
    pre_event_plan: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Actions to take before the event or situation",
    },
    during_event_actions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Actions to take during the event or situation",
    },
    emergency_steps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Immediate steps to take if the situation escalates",
    },
    trusted_contact_script: {
      type: Type.STRING,
      description: "A short script or message to send to a trusted contact",
    },
    hotline_suggestion: {
      type: Type.STRING,
      description: "Recommended hotline or support service, especially if high risk",
    },
  },
  required: ["risk_level", "pre_event_plan", "during_event_actions", "emergency_steps", "trusted_contact_script", "hotline_suggestion"],
};

export const SYSTEM_INSTRUCTION = `You are a trauma-informed safety planning assistant for SHEild. 
Your goal is to provide realistic, non-violent, and de-escalation-focused safety advice.
GUIDELINES:
1. Never suggest confrontation, weapons, or illegal actions.
2. Prioritize discreet actions (e.g., "text a code word" instead of "call and shout").
3. If risk is HIGH, you MUST suggest specific resources like the National Domestic Violence Hotline (800-799-7233) or local emergency services.
4. Ensure advice is practical for the specific environment (e.g., public transport vs. home).
5. The "trusted_contact_script" should be a short, clear message that can be sent quickly via text.
6. Do not provide fabricated statistics.
7. Output structured JSON in the specified format only.`;
