# INTERVUE AI

INTERVUE AI is an adaptive technical interview simulator. Enter any target role, choose experience, technology, difficulty, and question count, then complete a timed interview with role-specific questions, contextual follow-ups, and an answer-aware final report.

The report includes:

- Overall score
- Technical depth, problem solving, communication, and trade-off scores
- Strengths
- Areas to improve
- Recommended study topics

The role is a free-text input, so the simulator supports custom roles. Questions use natural Indian engineering scenarios where relevant, including UPI, INR, GST, Indian languages, tier-2/3 connectivity, regional infrastructure, festival traffic, OTPs, and privacy-sensitive customer data. Preset role buttons are not required.

Scores are based on submitted answers. The fallback evaluator considers answer detail, technical terms, reasoning, validation, and trade-off discussion; it does not return a fixed score. Follow-up questions also change based on the question and answer content.

The frontend uses React, Vite, Vue, Framer Motion, Lucide React, and a dark custom CSS system. The backend is an Express server using Groq's OpenAI-compatible chat completions API. If the provider is unavailable, rate-limited, returns an invalid model, or returns malformed JSON after one retry, the app uses answer-aware local fallbacks.

## Run locally

Requirements: Node.js 18+ and npm.

```bash
npm install
copy .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

For a production build:

```bash
npm run build
npm start
```

## Environment setup

Create a `.env` file in the project root. Start from `.env.example`:

```env
GRQ_API_KEY=your_groq_api_key
CROCS_BASE_URL=https://api.groq.com/openai/v1
CROCS_MODEL=openai/gpt-oss-120b
PORT=8787
```

`GRQ_API_KEY` is read only by the Express server and is never exposed to the browser. The Vite development server proxies `/api` requests to the Express server on port `8787`. Do not commit `.env`; it is excluded by `.gitignore`. Groq model IDs can change, so use the current supported model if needed.

## Interview flow

1. Enter any target role, experience level, technology, difficulty, and number of questions.
2. Start the interview to generate questions specifically for that role.
3. Submit each answer to receive a contextual follow-up question.
4. Continue through the timed interview and submit at least one answer.
5. Open the final report, then start a new interview when ready.

## API routes

- `POST /api/interview/generate` — generates questions from the selected interview settings.
- `POST /api/interview/answer` — evaluates an answer silently and returns a follow-up question.
- `POST /api/interview/report` — returns the final score breakdown and recommendations.

All provider prompts request JSON-only responses. The server strips accidental markdown fences, retries once when parsing fails, detects authentication/model errors, and falls back to role-aware questions, contextual follow-ups, and answer-aware scoring when needed.

## Voice dictation

INTERVUE AI was built using Wispr Flow voice dictation during development. The answer field remains a standard text area, so users can type normally or use their preferred voice-dictation tool, including Wispr Flow.

## Technology stack

- Frontend: React, Vite, Vue question-card component, Framer Motion, Lucide React, and custom dark-theme CSS.
- Backend: Node.js, Express, CORS, and dotenv.
- AI provider: Groq OpenAI-compatible `/chat/completions` API.
- Development: npm, Git, GitHub, and Wispr Flow voice dictation.

## Git workflow

The project repository is https://github.com/ravinithishkumar2001/AI_interVUE.

```bash
git pull origin main
git add .
git commit -m "Describe your change"
git push origin main
```
