const roleQuestionBanks = {
  frontend: [
    'How would you design a resilient component architecture for a large user-facing application?',
    'How would you diagnose and improve slow interaction time in a browser page?',
    'How do you test UI state, network requests, and accessibility together?',
    'How would you prevent unnecessary renders as a frontend application grows?',
    'How would you design a responsive interface for unreliable network conditions?'
  ],
  backend: [
    'How would you design a versioned API for a service used by several client teams?',
    'How would you investigate rising latency in a production backend service?',
    'How would you make a background job safe to retry without creating duplicate side effects?',
    'How would you choose indexes and diagnose a slow database query?',
    'How would you design rate limiting for a high-traffic API?'
  ],
  data: [
    'How would you design a reliable batch pipeline for late and duplicated events?',
    'How would you validate data quality before publishing a dataset to analysts?',
    'How would you model slowly changing dimensions in a warehouse?',
    'How would you debug a sudden drop in pipeline throughput?',
    'How would you choose between streaming and batch processing for a new data product?'
  ],
  devops: [
    'How would you design a deployment strategy that supports fast rollback?',
    'How would you investigate a service that is healthy in staging but failing in production?',
    'How would you structure observability for a distributed application?',
    'How would you secure secrets across a CI/CD pipeline?',
    'How would you plan capacity for a service with unpredictable traffic spikes?'
  ],
  security: [
    'How would you threat-model a new web application before it reaches production?',
    'How would you investigate a suspected credential compromise?',
    'How would you design least-privilege access for an engineering organization?',
    'How would you prioritize vulnerabilities when a team has limited remediation time?',
    'How would you explain the risk of a supply-chain attack to a product team?'
  ],
  mobile: [
    'How would you design offline-first behavior for a mobile application?',
    'How would you diagnose a battery drain regression after a release?',
    'How would you structure navigation and state across a growing mobile app?',
    'How would you handle backward compatibility across multiple app versions?',
    'How would you test a mobile feature across devices with different network conditions?'
  ],
  default: [
    'What is the most important technical challenge in a typical day for this role, and how would you approach it?',
    'How would you investigate a production issue related to your role?',
    'Describe a design decision you would make differently as this system grows.',
    'How would you test and monitor a solution in this role?',
    'How would you balance delivery speed, reliability, and maintainability?'
  ]
};
const indiaQuestionBanks = {
  frontend: [
    'How would you build a checkout that supports UPI, INR formatting, GST invoices, and Hindi or regional-language labels?',
    'How would you keep a React storefront usable on low-end Android phones and unreliable 4G connections common in tier-2 and tier-3 cities?',
    'How would you validate Indian phone numbers, six-digit PIN codes, and address fields without making the form frustrating?',
    'How would you design a multilingual design system that supports Indic scripts without layout or accessibility regressions?',
    'How would you measure and improve Core Web Vitals for users connecting from different Indian regions?'
  ],
  backend: [
    'How would you make a UPI payment API idempotent when a bank callback is delayed or delivered more than once?',
    'How would you design an order and invoice service that handles INR amounts, GST calculations, refunds, and audit history?',
    'How would you protect an OTP login service during a sudden traffic spike while keeping legitimate Indian phone numbers flowing?',
    'How would you operate a service across Indian regions while keeping latency low and customer data governed correctly?',
    'How would you design a resilient API for a commerce app expecting a large Diwali or cricket-match traffic spike?'
  ],
  data: [
    'How would you reconcile UPI payment events when bank files and application events arrive late or contain duplicates?',
    'How would you model GST, INR, refunds, and state-level tax details for reliable reporting?',
    'How would you build data quality checks for multilingual customer names, Indian addresses, and PIN codes?',
    'How would you keep a data pipeline reliable during a Diwali-scale increase in orders?',
    'How would you protect phone numbers and identity-related fields while still enabling useful analytics?'
  ],
  devops: [
    'How would you prepare a production platform for a 10x traffic spike during Diwali or a major cricket match?',
    'How would you deploy across Indian regions with rollback, observability, and controlled blast radius?',
    'How would you troubleshoot high latency affecting users in one Indian region but not another?',
    'How would you manage secrets and access for services processing UPI and customer identity data?',
    'How would you design incident response for a payment outage where bank callbacks are delayed?'
  ],
  security: [
    'How would you threat-model an Indian fintech flow involving UPI, OTPs, refunds, and account takeover risk?',
    'How would you protect Indian phone numbers, identity documents, and addresses from excessive internal access?',
    'How would you investigate a suspicious burst of OTP requests across many Indian numbers?',
    'How would you prioritize vulnerabilities in a consumer app used by both urban and low-connectivity users?',
    'How would you design least-privilege access for a team supporting payments and GST records?'
  ],
  mobile: [
    'How would you design an offline-tolerant UPI checkout for low-end Android devices and inconsistent connectivity?',
    'How would you support English, Hindi, and regional scripts without breaking layouts on small screens?',
    'How would you diagnose battery or data usage problems in a mobile app used on prepaid connections?',
    'How would you handle app upgrades when many Indian users remain on older Android versions?',
    'How would you test an address and PIN-code flow across devices, scripts, and network conditions?'
  ]
};
let providerDisabledReason = '';

function extractJson(text) { const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim(); return JSON.parse(clean); }

export async function askCrocs(prompt, fallback) {
  if (!process.env.GRQ_API_KEY || providerDisabledReason) return fallback;
  const url = `${process.env.CROCS_BASE_URL || 'https://api.groq.com/openai/v1'}/chat/completions`;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${process.env.GRQ_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: process.env.CROCS_MODEL || 'openai/gpt-oss-120b', temperature: 0.4, messages: [{ role: 'system', content: 'You are an expert technical interviewer. Return only valid JSON, with no markdown fences.' }, { role: 'user', content: prompt }] }) });
      const rawBody = await response.text();
      if (!response.ok) {
        if ((response.status === 400 || response.status === 401) && /incorrect api key|invalid.*key/i.test(rawBody)) {
          providerDisabledReason = 'The configured API key does not match the configured provider endpoint.';
          console.warn(`Crocs fallback: ${providerDisabledReason}`);
          return fallback;
        }
        throw new Error(`Crocs API ${response.status}: ${rawBody.slice(0, 240)}`);
      }
      const body = JSON.parse(rawBody);
      return extractJson(body.choices?.[0]?.message?.content || '');
    } catch (error) { if (attempt === 1) console.warn('Crocs fallback:', error.message); }
  }
  return fallback;
}

export const fallbackQuestions = (count, role = 'software engineer', technology = 'software engineering') => {
  const normalizedRole = role.toLowerCase();
  const bankKey = normalizedRole.includes('front') || normalizedRole.includes('ui') ? 'frontend' : normalizedRole.includes('back') || normalizedRole.includes('api') || normalizedRole.includes('server') ? 'backend' : normalizedRole.includes('data') || normalizedRole.includes('analytics') ? 'data' : normalizedRole.includes('devops') || normalizedRole.includes('sre') || normalizedRole.includes('platform') || normalizedRole.includes('cloud') ? 'devops' : normalizedRole.includes('security') || normalizedRole.includes('cyber') ? 'security' : normalizedRole.includes('mobile') || normalizedRole.includes('ios') || normalizedRole.includes('android') ? 'mobile' : 'default';
  const bank = roleQuestionBanks[bankKey];
  const contextualBank = indiaQuestionBanks[bankKey] || bank;
  return { questions: Array.from({ length: count }, (_, index) => `${role} / ${technology}: ${contextualBank[index % contextualBank.length]}`) };
};
export function fallbackAnswer(question, answer) {
  const text = `${question} ${answer}`.toLowerCase();
  let followUp = 'What assumption in your approach would you validate first, and how would you validate it?';
  if (text.includes('test') || text.includes('quality')) followUp = 'You mentioned testing. Which failure case would you prioritize, and what signal would prove the fix works?';
  else if (text.includes('scale') || text.includes('performance') || text.includes('latency')) followUp = 'You mentioned performance. What would you measure first, and which bottleneck would change your design decision?';
  else if (text.includes('security') || text.includes('auth') || text.includes('threat')) followUp = 'You mentioned security. What is the highest-risk attack path here, and how would you reduce it?';
  else if (text.includes('trade-off') || text.includes('tradeoff')) followUp = 'You mentioned a trade-off. What did you give up, and under what condition would you choose the other option?';
  return { followUp, evaluation: evaluateAnswer(answer) };
}

function clamp(value) { return Math.max(0, Math.min(100, Math.round(value))); }
function evaluateAnswer(answer = '') {
  const text = answer.toLowerCase();
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const technicalTerms = ['api', 'database', 'cache', 'queue', 'test', 'monitor', 'scale', 'security', 'component', 'trade-off', 'latency'].filter(term => text.includes(term)).length;
  const reasoningTerms = ['because', 'assuming', 'first', 'then', 'therefore', 'measure', 'validate', 'failure'].filter(term => text.includes(term)).length;
  return { score: clamp(35 + Math.min(words, 140) * 0.28 + technicalTerms * 4 + reasoningTerms * 3), note: words > 45 ? 'Detailed response with supporting reasoning.' : 'Response would benefit from more concrete detail.' };
}

export function fallbackReport(answers = [], role = 'software engineer', technology = 'software engineering') {
  const evaluations = answers.map(item => evaluateAnswer(item.answer || item));
  const average = key => evaluations.length ? evaluations.reduce((sum, item) => sum + item[key], 0) / evaluations.length : 0;
  const technical = clamp(average('score') + 3);
  const problemSolving = clamp(average('score') + (answers.filter(item => /because|first|then|measure|validate/i.test(item.answer || item)).length / answers.length) * 8 - 3);
  const communication = clamp(average('score') + (answers.filter(item => (item.answer || '').trim().split(/\s+/).length > 45).length / answers.length) * 8 - 5);
  const tradeoffs = clamp(average('score') + (answers.filter(item => /trade.?off|alternative|cost|risk|chose/i.test(item.answer || '')).length / answers.length) * 10 - 6);
  const categories = { 'Technical depth': technical, 'Problem solving': problemSolving, Communication: communication, 'Trade-offs': tradeoffs };
  const overallScore = clamp(technical * 0.3 + problemSolving * 0.3 + communication * 0.2 + tradeoffs * 0.2);
  const strengths = overallScore >= 70 ? `You provided ${answers.length} answer${answers.length === 1 ? '' : 's'} with useful reasoning for the ${role} role.` : 'You started engaging with the problems and gave the interviewer material to build on.';
  const improvements = communication < 60 ? 'Add more concrete detail and structure each answer with assumptions, approach, and validation.' : tradeoffs < 60 ? 'Make trade-offs explicit: compare alternatives, risks, and why you chose one.' : 'Connect each design choice to a measurable outcome and production constraint.';
  const recommendedTopics = /front|ui|mobile/i.test(role) ? ['Rendering performance', 'Testing strategy', 'Accessibility'] : /security/i.test(role) ? ['Threat modeling', 'Identity and access', 'Incident response'] : /data/i.test(role) ? ['Data quality', 'Pipeline reliability', 'Warehouse modeling'] : ['System design', 'Observability', `${technology} best practices`];
  return { overallScore, categories, strengths, improvements, recommendedTopics };
}
