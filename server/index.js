import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { askCrocs, fallbackAnswer, fallbackQuestions, fallbackReport } from './provider.js';

const app = express();
const evaluationStore = [];
app.use(cors()); app.use(express.json({ limit: '1mb' }));
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.post('/api/interview/generate', async (req, res) => {
  const { role = '', experience = '3–5 years', technology = 'React', difficulty = 'Intermediate', questionCount = 5 } = req.body || {};
  if (!role.trim()) return res.status(400).json({ error: 'Please enter a role before starting the interview.' });
  const count = Math.max(3, Math.min(10, Number(questionCount) || 5));
  const fallback = fallbackQuestions(count, role, technology);
  const data = await askCrocs(`Generate exactly ${count} technical interview questions as JSON: {"questions":["..."]}. The candidate's target role is exactly: ${role}. Experience: ${experience}. Technology: ${technology}. Difficulty: ${difficulty}. Make every question directly relevant to this role, progressively challenging, practical, and naturally grounded in Indian engineering scenarios such as UPI, INR, GST, Indian languages, tier-2/3 connectivity, regional infrastructure, festival traffic, and privacy-sensitive customer data. Do not prepend generic phrases like "India-first product" and do not ask India trivia; make the Indian context part of the actual engineering problem.`, fallback);
  res.json({ questions: Array.isArray(data.questions) ? data.questions.slice(0, count) : fallback.questions });
});

app.post('/api/interview/answer', async (req, res) => {
  const { role, technology, difficulty, question, answer } = req.body || {};
  if (!question || !answer) return res.status(400).json({ error: 'Question and answer are required.' });
  const fallback = fallbackAnswer(question, answer);
  const data = await askCrocs(`Return JSON {"followUp":"...","evaluation":{"score":0,"note":"..."}}. Ask one concise, probing follow-up based specifically on this interview answer. Silently evaluate it; do not mention the evaluation. Role: ${role}; technology: ${technology}; difficulty: ${difficulty}; question: ${question}; candidate answer: ${answer}`, fallback);
  evaluationStore.push({ question, answer, evaluation: data.evaluation || null, createdAt: new Date().toISOString() });
  res.json({ followUp: data.followUp || fallback.followUp });
});

app.post('/api/interview/report', async (req, res) => {
  const { role, technology, questions = [], answers = [] } = req.body || {};
  if (!Array.isArray(answers) || answers.length === 0) return res.status(400).json({ error: 'Answer at least one question before requesting a report.' });
  const fallback = fallbackReport(answers, role, technology);
  const data = await askCrocs(`Return JSON with exactly this shape: {"overallScore":0,"categories":{"Technical depth":0,"Problem solving":0,"Communication":0,"Trade-offs":0},"strengths":"...","improvements":"...","recommendedTopics":["..."]}. Score this completed ${role} interview focused on ${technology}. Questions asked: ${JSON.stringify(questions)}. Candidate answers: ${JSON.stringify(answers)}. Stored candidate evaluations: ${JSON.stringify(evaluationStore)}. Use scores from 0 to 100, base them only on submitted answers, and make the feedback specific to their content.`, fallback);
  res.json({ ...fallback, ...data, categories: { ...fallback.categories, ...(data.categories || {}) } });
});

const dist = path.resolve(__dirname, '../dist');
app.use(express.static(dist)); app.get(/.*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));
app.listen(process.env.PORT || 8787, () => console.log(`INTERVUE AI server running on http://localhost:${process.env.PORT || 8787}`));
