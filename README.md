# SHEild – AI Safety Planner

## Quickstart Instructions
Run the following command to set up and start the application:
```bash
npm install && npm run dev
```
*Note: Ensure your `GEMINI_API_KEY` is configured in your environment secrets.*

## Decision Log
- **Architecture**: Single Page Application (SPA) using React 19 and Vite for maximum speed and responsiveness.
- **AI Engine**: Google Gemini 3 Flash chosen for its high-speed inference (sub-10s requirement) and robust structured output capabilities.
- **Styling**: Tailwind CSS 4 used for rapid development of a high-contrast, accessible UI.
- **Anonymity**: No backend database or authentication implemented to ensure 100% user anonymity and zero data persistence.
- **PDF Generation**: Client-side generation using `jsPDF` and `html2canvas` to keep data within the user's browser context.

## Evidence Log
- **Icons**: [Lucide React](https://lucide.dev/) (ISC License).
- **Animations**: [Motion](https://motion.dev/) (MIT License).
- **PDF Engine**: [jsPDF](https://github.com/parallax/jsPDF) (MIT License).
- **AI SDK**: [@google/genai](https://www.npmjs.com/package/@google/genai) (Apache-2.0).
- **Typography**: Inter (Google Fonts, SIL Open Font License).

## Risk Log
- **Issue Caught**: AI initially suggested "calling for help" in situations where silence was safer (e.g., domestic tension).
- **Fix**: Updated the **Goose System Instruction** to explicitly prioritize "discreet actions" and "text-based code words" over audible alerts in high-risk domestic contexts.
- **Issue Caught**: PDF generation was cutting off text on mobile screens.
- **Fix**: Implemented a responsive canvas scaling factor in `html2canvas` to ensure the full layout is captured regardless of the viewport size.

## Known Limitations
- AI advice is a guideline and not a replacement for professional emergency services.
- Requires an active internet connection for Gemini API calls.

## Accessibility & Reading Level
- **Color Contrast**: WCAG AA compliant (verified via high-contrast mode).
- **Reading Level**: Targeted at Grade 8 (simple, direct language used in UI and AI prompts).
- **Screen Readers**: Semantic HTML and ARIA labels used throughout.

## License
This project is licensed under the **MIT License**. See the `LICENSE` file for details.
