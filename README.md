# SHEild – AI Safety Planner

## Problem Frame
Women and marginalized individuals often face safety risks in various environments. Accessing immediate, structured, and trauma-informed safety advice can be difficult. SHEild provides a quick, anonymous way to generate personalized safety plans based on specific contexts without storing personal data.

## Architecture Diagram
- **Frontend**: React (Vite) + Tailwind CSS + Framer Motion
- **AI Engine**: Google Gemini API (via @google/genai)
- **PDF Generation**: jsPDF + html2canvas
- **State Management**: React Hooks

## Decision Log
- **Dark Mode Default**: Chosen to reduce eye strain and provide a discreet interface.
- **No Login**: Prioritized anonymity and speed of access.
- **JSON Schema**: Used to ensure the AI output is structured and reliable for UI rendering and PDF generation.
- **jsPDF/html2canvas**: Selected for client-side PDF generation to maintain privacy (no data sent to a PDF generation server).

## Risk Log
- **AI Hallucinations**: Mitigated by strict system prompts and guardrails.
- **High Risk Situations**: Addressed by mandatory hotline suggestions and disclaimers for high-risk levels.
- **Privacy**: No personal data is collected or stored.

## Known Limitations
- The AI provides advice based on general safety principles and may not account for hyper-local laws or specific immediate physical threats.
- Requires an internet connection to generate the plan.

## Evidence Log
- Structured JSON output ensures consistent plan formatting.
- Trauma-informed prompt reduces the risk of harmful or victim-blaming advice.

## Setup Instructions
1. `npm install`
2. `npm run dev`
(Ensure `GEMINI_API_KEY` is set in your environment)
