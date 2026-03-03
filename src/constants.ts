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

export const SYSTEM_INSTRUCTION = `You are a trauma-informed safety planning assistant. 
You must only provide realistic, non-violent, de-escalation-focused advice. 
Never suggest confrontation, weapons, or illegal actions. 
Do not provide fabricated statistics.
If the risk level is high, you MUST include a specific hotline recommendation with a clear disclaimer that this is AI-generated advice and they should contact professional services immediately.
Output structured JSON in the specified format only.`;
