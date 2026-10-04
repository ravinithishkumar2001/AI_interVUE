# INTERVUE AI

INTERVUE AI is a technical interview simulator for deliberate engineering practice. Configure a role, experience level, focus technology, difficulty, and question count; then work through an adaptive interview with AI-generated questions, follow-up prompts, a timer, and a final performance report.

The report includes:

- Overall score
- Technical depth, problem solving, communication, and trade-off scores
- Strengths
- Areas to improve
- Recommended study topics

The frontend uses React, Vue, Tailwind CSS, Framer Motion, and Lucide icons. The backend is an Express server that calls the Crocs OpenAI-compatible chat completions API. If the provider is unavailable, rate-limited, or returns invalid JSON after one retry, the app uses mock interview data.

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
GRQ_API_KEY=your_crocs_api_key
CROCS_BASE_URL=https://api.x.ai/v1
CROCS_MODEL=grok-3-mini
PORT=8787
```

`GRQ_API_KEY` is read only by the Express server and is never exposed to the browser. The Vite development server proxies `/api` requests to the Express server on port `8787`.

## Interview flow

1. Select a role, experience level, technology, difficulty, and number of questions.
2. Start the interview to generate a tailored question set.
3. Submit each answer to receive an adaptive follow-up question.
4. Continue through the interview and open the final report.
5. Start a new interview from the report screen.

## API routes

- `POST /api/interview/generate` — generates questions from the selected interview settings.
- `POST /api/interview/answer` — evaluates an answer silently and returns a follow-up question.
- `POST /api/interview/report` — returns the final score breakdown and recommendations.

All provider prompts request JSON-only responses. The server strips accidental markdown fences, retries once when parsing fails, and falls back to mock data when needed.

## Voice dictation

INTERVUE AI was built using Wispr Flow voice dictation during development. The answer field remains a standard text area, so users can type normally or use their preferred voice-dictation tool, including Wispr Flow.
