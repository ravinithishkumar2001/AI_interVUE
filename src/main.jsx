import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createApp, defineComponent, h } from 'vue';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BarChart3, ChevronDown, Clock3, MessageSquare, RotateCcw, Sparkles, Target } from 'lucide-react';
import './styles.css';

const defaults = { role: 'Frontend Engineer', experience: '3–5 years', technology: 'React', difficulty: 'Intermediate', questionCount: 5 };

const VueQuestionCard = defineComponent({
  props: { question: String, index: Number },
  setup(props) { return () => h('div', { class: 'vue-question-card' }, [h('span', { class: 'eyebrow' }, `Question ${String(props.index + 1).padStart(2, '0')}`), h('strong', props.question)]); }
});

function QuestionPreview({ question, index }) {
  const el = useRef(null);
  useEffect(() => {
    if (!el.current || !question) return;
    const app = createApp(VueQuestionCard, { question, index });
    app.mount(el.current);
    return () => app.unmount();
  }, [question, index]);
  return <div ref={el} />;
}

function SelectField({ label, value, onChange, options }) {
  return <label className="field"><span>{label}</span><div className="select-wrap"><select value={value} onChange={e => onChange(e.target.value)}>{options.map(o => <option key={o} value={o}>{o}</option>)}</select><ChevronDown size={16} /></div></label>;
}

function ReportScreen({ report, onStartNew }) {
  const categories = Object.entries(report.categories || {});
  return <motion.div className="final-report" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
    <div className="final-report-top"><div><span className="eyebrow">03 / FINAL REPORT</span><h2>Your interview, decoded.</h2><p>Here is a clear read on what you did well and where to focus next.</p></div><div className="overall-score"><span>OVERALL SCORE</span><strong>{report.overallScore}</strong><small>/ 100</small></div></div>
    <div className="report-chart-card"><div className="report-card-heading"><div><span className="eyebrow">PERFORMANCE BREAKDOWN</span><h3>Category scores</h3></div><span className="chart-legend"><i /> SCORE</span></div><div className="category-grid">{categories.map(([name, value]) => <div className="category-bar" key={name}><div className="category-label"><span>{name}</span><strong>{value}</strong></div><div className="grid-bar"><span className="grid-lines" /><i style={{ width: `${value}%` }} /></div></div>)}</div></div>
    <div className="insight-grid"><article><span className="insight-number">01</span><h4>STRENGTHS</h4><p>{report.strengths}</p></article><article><span className="insight-number">02</span><h4>AREAS TO IMPROVE</h4><p>{report.improvements}</p></article><article><span className="insight-number">03</span><h4>RECOMMENDED TOPICS</h4><div className="topic-list">{(report.recommendedTopics || []).map(topic => <span key={topic}>{topic}</span>)}</div></article></div>
    <button className="new-interview-button" onClick={onStartNew}><RotateCcw size={16} /> Start new interview <ArrowRight size={16} /></button>
  </motion.div>;
}

function App() {
  const [settings, setSettings] = useState(defaults);
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [followUp, setFollowUp] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(12 * 60);
  const update = (key, value) => setSettings(s => ({ ...s, [key]: value }));
  const generate = async () => {
    setLoading(true); setError(''); setReport(null); setFollowUp(''); setAnswers([]); setSecondsLeft(12 * 60);
    try { const res = await fetch('/api/interview/generate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(settings) }); const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Could not generate interview'); setQuestions(data.questions || []); setQuestionIndex(0); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(() => {
    if (!questions.length || report) return undefined;
    const timer = window.setInterval(() => setSecondsLeft(seconds => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [questions.length, report]);
  useEffect(() => {
    if (!followUp) return undefined;
    const timer = window.setTimeout(() => {
      if (questionIndex >= questions.length - 1) getReport();
      else { setQuestionIndex(index => index + 1); setAnswer(''); setFollowUp(''); }
    }, 3500);
    return () => window.clearTimeout(timer);
  }, [followUp]);
  const nextQuestion = () => {
    if (questionIndex >= questions.length - 1) { getReport(); return; }
    setQuestionIndex(index => index + 1); setFollowUp(''); setAnswer('');
  };
  const submitAnswer = async () => {
    if (!answer.trim() || !questions.length) return;
    setLoading(true); setError('');
    try { const submittedAnswer = { question: questions[questionIndex], answer }; const res = await fetch('/api/interview/answer', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...settings, ...submittedAnswer, questionIndex }) }); const data = await res.json(); if (!res.ok) throw new Error(data.error); setAnswers(current => [...current, submittedAnswer]); setFollowUp(data.followUp); setAnswer(''); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  };
  const getReport = async () => {
    if (!answers.length) { setError('Answer at least one question before viewing a report.'); return; }
    setLoading(true); setError('');
    try { const res = await fetch('/api/interview/report', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...settings, questions, answers }) }); const data = await res.json(); if (!res.ok) throw new Error(data.error); setReport(data); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  };
  const reset = () => { setQuestions([]); setQuestionIndex(0); setAnswer(''); setAnswers([]); setFollowUp(''); setReport(null); setError(''); setSecondsLeft(12 * 60); };
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');
  const progress = questions.length ? ((questionIndex + (followUp ? 1 : 0)) / questions.length) * 100 : 0;
  return <main>
    <header className="topbar"><div className="brand"><span className="brand-mark">I</span><span>INTERVUE <i>AI</i></span></div><div className="status"><span className="live-dot" /> AI engine ready <span className="avatar">NK</span></div></header>
    <section className="hero"><div><p className="kicker"><Sparkles size={14} /> PERSONALIZED PRACTICE</p><h1>Think clearly.<br /><em>Interview brilliantly.</em></h1><p className="lede">A focused technical interview simulator that adapts to your experience, asks better questions, and gives you a clear path to improve.</p></div><div className="hero-stat"><span>01</span><strong>Set your<br />parameters</strong><small>Build a session that<br />feels like the real thing.</small></div></section>
    <section className="workspace">{report ? <ReportScreen report={report} onStartNew={reset} /> : <>
      <aside className="setup-panel"><div className="section-label"><span>01</span> SESSION SETUP</div><h2>Make it yours.</h2><p className="muted">Tell us what you want to practice.</p>
        <label className="role-input"><span>YOUR ROLE</span><input list="role-suggestions" value={settings.role} onChange={event => update('role', event.target.value)} placeholder="e.g. Security Engineer" /><datalist id="role-suggestions"><option value="Frontend Engineer" /><option value="Backend Engineer" /><option value="Full-stack Engineer" /><option value="Data Engineer" /><option value="DevOps Engineer" /><option value="Product Engineer" /><option value="Mobile Engineer" /><option value="Security Engineer" /></datalist></label>
        <div className="fields"><SelectField label="EXPERIENCE LEVEL" value={settings.experience} onChange={v => update('experience', v)} options={['0–2 years', '3–5 years', '6–10 years', '10+ years']} /><SelectField label="TECHNOLOGY FOCUS" value={settings.technology} onChange={v => update('technology', v)} options={['React', 'Vue', 'Node.js', 'TypeScript', 'Python', 'System Design']} /><SelectField label="DIFFICULTY" value={settings.difficulty} onChange={v => update('difficulty', v)} options={['Foundational', 'Intermediate', 'Advanced', 'Expert']} /></div>
        <div className="count-row"><span>QUESTIONS</span><div className="count-control"><button onClick={() => update('questionCount', Math.max(3, settings.questionCount - 1))}>−</button><strong>{settings.questionCount}</strong><button onClick={() => update('questionCount', Math.min(10, settings.questionCount + 1))}>+</button></div></div>
        <button className="primary" onClick={generate} disabled={loading}>{loading ? 'Preparing session...' : 'Start interview'} <ArrowRight size={17} /></button>
        {error && <p className="error">{error}</p>}
      </aside>
      <section className="interview-panel"><div className="section-label"><span>02</span> LIVE INTERVIEW <span className="live-badge">● RECORDING</span></div>{questions.length > 0 && <div className="room-progress"><div><span>SESSION PROGRESS</span><strong>{questionIndex + 1} of {questions.length}</strong><strong className="room-clock">{String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:{String(secondsLeft % 60).padStart(2, '0')}</strong></div><div className="progress-track"><i style={{ width: `${questions.length ? ((questionIndex + (followUp ? 1 : 0)) / questions.length) * 100 : 0}%` }} /></div></div>}
        {!questions.length ? <motion.div className="empty-state" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}><div className="empty-orb"><Target size={28} /></div><h2>Your interview starts here.</h2><p>Choose your focus and generate a tailored question set. Your answers stay private and your evaluation is stored silently.</p></motion.div> : <><div className="question-meta"><span>QUESTION {String(questionIndex + 1).padStart(2, '0')} / {String(questions.length).padStart(2, '0')}</span><span><Clock3 size={14} /> 12 min session</span></div><AnimatePresence mode="wait"><motion.div key={questionIndex} className="question-stage" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35, ease: 'easeOut' }}><QuestionPreview question={questions[questionIndex]} index={questionIndex} /><div className="answer-box"><textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Take a moment, then share how you would approach this…" /><div className="answer-actions"><span><MessageSquare size={14} /> {answer.length} characters</span><button className="secondary" onClick={submitAnswer} disabled={loading || !answer.trim()}>Submit answer <ArrowRight size={15} /></button></div></div>{followUp && <div className="follow-up"><span className="eyebrow">AI FOLLOW-UP</span><p>{followUp}</p></div>}</motion.div></AnimatePresence><div className="interview-footer"><button className="text-button" onClick={() => { setQuestions([]); setReport(null); }}><RotateCcw size={15} /> Reset</button><div><button className="ghost" disabled={questionIndex >= questions.length - 1} onClick={() => { setQuestionIndex(i => i + 1); setFollowUp(''); }}>Next question <ArrowRight size={15} /></button><button className="report-button" onClick={getReport}>View report <BarChart3 size={15} /></button></div></div></>}
        {report && <div className="report"><div className="report-heading"><div><span className="eyebrow">SESSION REPORT</span><h2>Good thinking. Keep going.</h2></div><div className="score"><strong>{report.overallScore}</strong><span>/ 100</span></div></div><div className="score-grid">{Object.entries(report.categories || {}).map(([key, value]) => <div key={key}><span>{key}</span><strong>{value}</strong><div className="bar"><i style={{ width: `${value}%` }} /></div></div>)}</div><div className="report-columns"><div><h4>STRENGTHS</h4><p>{report.strengths}</p></div><div><h4>IMPROVEMENTS</h4><p>{report.improvements}</p></div><div><h4>RECOMMENDED TOPICS</h4><p>{(report.recommendedTopics || []).join(' · ')}</p></div></div></div>}
      </section>
    </>}</section>
    <footer><span>INTERVUE AI / TECHNICAL INTERVIEW SIMULATOR</span><span>Built for deliberate practice <Sparkles size={13} /></span></footer>
  </main>;
}
createRoot(document.getElementById('root')).render(<App />);
