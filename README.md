<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cogniva — Turn confusion into clarity.</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --bg: #060606;
    --bg-elev: #0e0e0e;
    --bg-elev-2: #131313;
    --border: #1f1f1f;
    --border-soft: #161616;
    --text: #f4f1ea;
    --text-dim: #8f8b85;
    --text-dimmer: #5c5952;
    --coral: #e84040;
    --coral-dim: #e8404022;
    --gold: #e8a634;
    --gold-dim: #e8a63422;
    --clear: #5fb488;
    --clear-dim: #5fb48822;
    --radius: 10px;
  }
  *{box-sizing:border-box; margin:0; padding:0;}
  html{scroll-behavior:smooth;}
  body{
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    line-height: 1.6;
    font-size: 15.5px;
    -webkit-font-smoothing: antialiased;
  }
  ::selection{ background: var(--coral); color: #000; }

  h1,h2,h3,h4{ font-family:'Hanken Grotesk', sans-serif; font-weight:700; letter-spacing:-0.01em; color: var(--text); }
  code, .mono{ font-family:'JetBrains Mono', monospace; }
  a{ color: inherit; }

  .eyebrow{
    font-family:'JetBrains Mono', monospace;
    font-size: 11.5px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--coral);
    display:flex;
    align-items:center;
    gap:10px;
    margin-bottom: 14px;
  }
  .eyebrow::before{
    content:"";
    width: 16px; height: 1px;
    background: var(--coral);
    display:inline-block;
  }
  .eyebrow.gold{ color: var(--gold); }
  .eyebrow.gold::before{ background: var(--gold); }

  /* ---------- layout shell ---------- */
  .shell{ display:flex; max-width: 1320px; margin: 0 auto; }
  nav.toc{
    position: sticky; top:0; height:100vh;
    width: 236px; flex-shrink:0;
    padding: 40px 20px 40px 32px;
    overflow-y:auto;
    border-right: 1px solid var(--border-soft);
  }
  nav.toc .brand{
    font-family:'Hanken Grotesk',sans-serif;
    font-weight:800; font-size:18px; letter-spacing:-0.02em;
    display:flex; align-items:center; gap:9px; margin-bottom:36px;
  }
  nav.toc .brand .dot{
    width:9px; height:9px; border-radius:50%;
    background: var(--coral);
    box-shadow: 0 0 0 4px var(--coral-dim);
    animation: pulse-dot 2.4s ease-in-out infinite;
  }
  @keyframes pulse-dot{
    0%,100%{ box-shadow: 0 0 0 4px var(--coral-dim); }
    50%{ box-shadow: 0 0 0 8px transparent; }
  }
  nav.toc ul{ list-style:none; }
  nav.toc li{ margin-bottom:2px; }
  nav.toc a{
    display:block; text-decoration:none;
    color: var(--text-dim); font-size:13px;
    padding:7px 10px; border-radius:6px;
    border-left: 2px solid transparent;
    transition: color .15s ease, background .15s ease, border-color .15s ease;
  }
  nav.toc a:hover{ color: var(--text); background: var(--bg-elev); }
  nav.toc a.active{ color: var(--text); border-left-color: var(--coral); background: var(--bg-elev); }

  main{ flex:1; min-width:0; }
  .wrap{ padding: 0 56px; max-width: 900px; }
  section{ padding: 92px 0; border-bottom: 1px solid var(--border-soft); }
  section:last-child{ border-bottom:none; }

  .reveal{ opacity:0; transform: translateY(18px); transition: opacity .7s ease, transform .7s ease; }
  .reveal.in{ opacity:1; transform: translateY(0); }

  /* ---------- hero ---------- */
  .hero{
    min-height: 100vh;
    display:flex; flex-direction:column; justify-content:center;
    padding: 40px 0 80px;
    border-bottom: 1px solid var(--border-soft);
    position:relative;
  }
  .hero h1{
    font-size: clamp(40px, 6vw, 68px);
    line-height: 1.03;
    max-width: 760px;
  }
  .hero h1 .grad{
    background: linear-gradient(100deg, var(--coral), var(--gold) 65%);
    -webkit-background-clip:text; background-clip:text; color:transparent;
  }
  .hero p.sub{
    margin-top:22px; max-width: 560px;
    color: var(--text-dim); font-size:16.5px;
  }
  .hero .tags{ display:flex; gap:8px; flex-wrap:wrap; margin-top:28px; }
  .tag{
    font-family:'JetBrains Mono',monospace; font-size:11px;
    letter-spacing:.05em; padding:6px 11px; border-radius:20px;
    border:1px solid var(--border); color: var(--text-dim);
  }

  /* signature pulse visual */
  .pulse-panel{
    margin-top:56px; border:1px solid var(--border); border-radius: var(--radius);
    background: var(--bg-elev); padding:26px 26px 20px;
    max-width: 720px;
  }
  .pulse-panel .ph{
    display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;
  }
  .pulse-panel .ph .l{ font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--text-dimmer);}
  .pulse-panel .ph .live{ display:flex; align-items:center; gap:7px; font-family:'JetBrains Mono',monospace; font-size:10.5px; color: var(--coral); letter-spacing:.08em;}
  .live .d{ width:6px; height:6px; border-radius:50%; background:var(--coral); animation: pulse-dot 2.4s ease-in-out infinite; }

  .pulse-row{ display:flex; align-items:center; gap:14px; padding:9px 0; }
  .pulse-row .name{ width: 168px; flex-shrink:0; font-size:13px; color: var(--text); }
  .pulse-row .track{ flex:1; height:9px; background:#1a1a1a; border-radius:5px; overflow:hidden; position:relative; }
  .pulse-row .fill{ height:100%; border-radius:5px; position:relative; transition: width 1s cubic-bezier(.4,0,.2,1); }
  .pulse-row .fill.high{ background: linear-gradient(90deg,#c93030,var(--coral)); }
  .pulse-row .fill.med{ background: linear-gradient(90deg,#c98420,var(--gold)); }
  .pulse-row .fill.low{ background: linear-gradient(90deg,#3d8f68,var(--clear)); }
  .pulse-row .fill::after{
    content:""; position:absolute; inset:0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent);
    width:40%; animation: sheen 2.6s ease-in-out infinite;
  }
  @keyframes sheen{ 0%{ transform: translateX(-120%); } 100%{ transform: translateX(340%); } }
  .pulse-row .pct{ width:40px; text-align:right; font-family:'JetBrains Mono',monospace; font-size:12px; color: var(--text-dim); }
  .pulse-row .badge{
    width:52px; text-align:center; font-family:'JetBrains Mono',monospace; font-size:9.5px;
    letter-spacing:.06em; padding:3px 0; border-radius:4px; flex-shrink:0;
  }
  .badge.high{ color: var(--coral); background: var(--coral-dim); }
  .badge.med{ color: var(--gold); background: var(--gold-dim); }
  .badge.low{ color: var(--clear); background: var(--clear-dim); }

  /* ---------- generic content ---------- */
  h2.h{ font-size: 30px; margin-bottom: 14px; }
  h3.h3{ font-size: 18px; margin: 30px 0 12px; color: var(--text); }
  p.lead{ color: var(--text-dim); font-size:15.5px; max-width:680px; margin-bottom:8px; }
  .prose p{ color: var(--text-dim); margin-bottom: 14px; }
  .prose strong{ color: var(--text); font-weight:600; }

  ul.feature-list{ list-style:none; margin-top:18px; }
  ul.feature-list li{
    display:flex; gap:14px; padding:16px 0; border-top:1px solid var(--border-soft);
  }
  ul.feature-list li:last-child{ border-bottom:1px solid var(--border-soft); }
  ul.feature-list li .ic{
    width:6px; height:6px; margin-top:8px; border-radius:50%;
    background: var(--gold); flex-shrink:0;
  }
  ul.feature-list li .t{ font-weight:600; color:var(--text); font-size:14.5px; }
  ul.feature-list li .d{ color: var(--text-dim); font-size:14px; margin-top:3px; }

  .cols2{ display:grid; grid-template-columns:1fr 1fr; gap: 44px; }
  @media(max-width:760px){ .cols2{ grid-template-columns:1fr; } }

  /* tables */
  table{ width:100%; border-collapse:collapse; margin-top:8px; font-size:13.5px; }
  th{
    text-align:left; font-family:'JetBrains Mono',monospace; font-size:10.5px;
    letter-spacing:.08em; text-transform:uppercase; color: var(--text-dimmer);
    padding: 10px 14px; border-bottom:1px solid var(--border);
  }
  td{ padding: 12px 14px; border-bottom:1px solid var(--border-soft); color: var(--text-dim); vertical-align:top; }
  td:first-child, td code{ color: var(--text); }
  tr:hover td{ background: var(--bg-elev); }
  td code, th code{ font-size:12px; background:var(--bg-elev-2); padding:2px 6px; border-radius:4px; }

  /* code / tree block */
  .codeblock{
    background: var(--bg-elev); border:1px solid var(--border); border-radius: var(--radius);
    padding: 20px 22px; overflow-x:auto; margin-top:16px;
  }
  .codeblock pre{ font-family:'JetBrains Mono',monospace; font-size:12.5px; line-height:1.75; color: var(--text-dim); white-space:pre; }
  .codeblock .c1{ color: var(--gold); }
  .codeblock .c2{ color: var(--coral); }
  .codeblock .cmt{ color: var(--text-dimmer); }

  /* steps */
  .steps{ margin-top: 30px; }
  .step{
    display:grid; grid-template-columns: 52px 1fr; gap:20px;
    padding: 22px 0; border-top:1px solid var(--border-soft); position:relative;
  }
  .step:last-child{ border-bottom:1px solid var(--border-soft); }
  .step .num{
    font-family:'JetBrains Mono',monospace; font-size:13px; color: var(--bg);
    background: var(--gold); width:34px; height:34px; border-radius:50%;
    display:flex; align-items:center; justify-content:center; font-weight:600;
  }
  .step .stitle{ font-weight:600; color:var(--text); margin-bottom:5px; font-size:15px; }
  .step .sdesc{ color: var(--text-dim); font-size:14px; }
  .step .sdesc code{ background:var(--bg-elev-2); padding:1px 6px; border-radius:4px; font-size:12.5px; color: var(--text); }

  /* stack chip grid */
  .stackgrid{ display:grid; grid-template-columns: repeat(2,1fr); gap:14px; margin-top: 20px; }
  @media(max-width:700px){ .stackgrid{ grid-template-columns:1fr; } }
  .stackcard{
    border:1px solid var(--border); border-radius: var(--radius); padding:18px 20px;
    background: var(--bg-elev);
  }
  .stackcard .layer{ font-family:'JetBrains Mono',monospace; font-size:10.5px; letter-spacing:.1em; text-transform:uppercase; color: var(--coral); margin-bottom:8px; }
  .stackcard .tech{ font-size:14px; color:var(--text-dim); line-height:1.7; }

  /* known gaps */
  .gap-list{ margin-top:22px; }
  .gap{
    display:flex; gap:14px; padding:16px 18px; border:1px solid var(--border);
    border-radius: var(--radius); margin-bottom:10px; background: var(--bg-elev);
  }
  .gap .mark{ color: var(--coral); font-family:'JetBrains Mono',monospace; font-size:13px; flex-shrink:0; margin-top:1px; }
  .gap .body b{ color:var(--text); }
  .gap .body{ color: var(--text-dim); font-size:14px; }

  /* env table pill */
  .req-yes{ color: var(--clear); font-family:'JetBrains Mono',monospace; font-size:11.5px; }
  .req-no{ color: var(--text-dimmer); font-family:'JetBrains Mono',monospace; font-size:11.5px; }

  footer{
    padding: 60px 0 90px; color: var(--text-dimmer); font-size:13px;
    display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;
  }
  footer .fbrand{ font-family:'JetBrains Mono',monospace; letter-spacing:.05em; }

  @media (max-width: 980px){
    nav.toc{ display:none; }
    .wrap{ padding: 0 24px; }
  }
  @media (prefers-reduced-motion: reduce){
    *{ animation: none !important; transition: none !important; }
  }
</style>
</head>
<body>

<div class="shell">
  <nav class="toc">
    <div class="brand"><span class="dot"></span>Cogniva</div>
    <ul>
      <li><a href="#hero" class="tocLink">Overview</a></li>
      <li><a href="#what" class="tocLink">What it does</a></li>
      <li><a href="#stack" class="tocLink">Tech stack</a></li>
      <li><a href="#structure" class="tocLink">Monorepo structure</a></li>
      <li><a href="#signal" class="tocLink">Confusion → signal</a></li>
      <li><a href="#data" class="tocLink">Data model</a></li>
      <li><a href="#api" class="tocLink">API surface</a></li>
      <li><a href="#frontend" class="tocLink">Frontend structure</a></li>
      <li><a href="#design" class="tocLink">Design system</a></li>
      <li><a href="#start" class="tocLink">Getting started</a></li>
      <li><a href="#env" class="tocLink">Environment vars</a></li>
      <li><a href="#demo" class="tocLink">Demo mode</a></li>
      <li><a href="#gaps" class="tocLink">Known gaps</a></li>
    </ul>
  </nav>

  <main>
    <div class="wrap">

      <!-- HERO -->
      <section id="hero" class="hero">
        <div class="eyebrow">Real-time learning intelligence</div>
        <h1>Turn <span class="grad">confusion</span> into clarity.</h1>
        <p class="sub">Students privately flag the exact moment they get confused — no raised hands, no public embarrassment. Cogniva turns those signals into an AI-tutored explanation for the student, and a same-day, prioritized revision map for the educator.</p>
        <div class="tags">
          <span class="tag">REACT + TYPESCRIPT</span>
          <span class="tag">EXPRESS + SUPABASE</span>
          <span class="tag">GEMINI 1.5 FLASH</span>
          <span class="tag">RLS ENABLED</span>
        </div>

        <div class="pulse-panel reveal" id="pulsePanel">
          <div class="ph">
            <span class="l">Live confusion pulse — Data Structures &amp; Algorithms</span>
            <span class="live"><span class="d"></span>STREAMING</span>
          </div>
          <div id="pulseRows"></div>
        </div>
      </section>

      <!-- WHAT IT DOES -->
      <section id="what">
        <div class="eyebrow reveal">What it does</div>
        <h2 class="h reveal">One button for the student. One ranked list for the educator.</h2>
        <p class="lead reveal">Cogniva is a working full-stack implementation of the "silent classroom confusion" problem: professors in large lecture halls have no real-time signal for where the room lost the thread, and students rarely admit confusion out loud.</p>

        <div class="cols2" style="margin-top:36px;">
          <div class="reveal">
            <h3 class="h3">For students</h3>
            <ul class="feature-list">
              <li><span class="ic"></span><div><div class="t">Flag confusion in the moment</div><div class="d">A persistent "I'm Confused" button marks a concept as Confused, Partially Clear, or Clear, with an optional note on what's unclear.</div></div></li>
              <li><span class="ic"></span><div><div class="t">Get an AI explanation instantly</div><div class="d">A structured response: simple explanation, why it works, a relatable example, a common mistake, a quick check, and a next step. Still lost? Ask for it a different way, not a repeat.</div></div></li>
              <li><span class="ic"></span><div><div class="t">See a personal mastery map</div><div class="d">Every concept carries a 0–100 mastery score that rises with correct practice and confirmed clarity, and falls when confusion is signaled.</div></div></li>
              <li><span class="ic"></span><div><div class="t">Follow a same-day revision plan</div><div class="d">Confused concepts land in a prioritized queue (High / Medium / Low) with a suggested time investment, cleared once understanding is demonstrated.</div></div></li>
              <li><span class="ic"></span><div><div class="t">Practice with instant feedback</div><div class="d">MCQ, true/false, and short-answer questions per concept, with accuracy feeding straight back into mastery.</div></div></li>
              <li><span class="ic"></span><div><div class="t">Track streaks and weekly progress</div><div class="d">A single learning score blends mastery, accuracy, clarity confirmations, and completed revisions, alongside a day-streak and weekly chart.</div></div></li>
            </ul>
          </div>

          <div class="reveal">
            <h3 class="h3">For educators</h3>
            <ul class="feature-list">
              <li><span class="ic" style="background:var(--coral)"></span><div><div class="t">A live confusion pulse</div><div class="d">Every signal across every student rolls up per concept into a 0–100% confusion score, bucketed LOW / MEDIUM / HIGH.</div></div></li>
              <li><span class="ic" style="background:var(--coral)"></span><div><div class="t">Confusion heatmap &amp; topic breakdown</div><div class="d">Bar-chart and ranked-list views of which concepts are causing the most trouble class-wide.</div></div></li>
              <li><span class="ic" style="background:var(--coral)"></span><div><div class="t">AI-generated teaching recommendations</div><div class="d">Gemini turns the class's confusion metrics into a concrete, two-sentence suggestion for the next lecture.</div></div></li>
              <li><span class="ic" style="background:var(--coral)"></span><div><div class="t">Class-wide analytics</div><div class="d">Student count, average class mastery, and a count of "critical" concepts at ≥66% confusion.</div></div></li>
            </ul>
          </div>
        </div>
      </section>

      <!-- TECH STACK -->
      <section id="stack">
        <div class="eyebrow gold reveal">Tech stack</div>
        <h2 class="h reveal">What it's built with</h2>
        <div class="stackgrid reveal">
          <div class="stackcard"><div class="layer">Frontend</div><div class="tech">React 18, TypeScript, Vite, React Router v6</div></div>
          <div class="stackcard"><div class="layer">Styling</div><div class="tech">Tailwind CSS (custom dark theme + tokens), Framer Motion</div></div>
          <div class="stackcard"><div class="layer">Charts</div><div class="tech">Recharts</div></div>
          <div class="stackcard"><div class="layer">Backend</div><div class="tech">Node.js, Express, TypeScript (ts-node-dev)</div></div>
          <div class="stackcard"><div class="layer">Database / auth</div><div class="tech">Supabase — Postgres + Row-Level Security</div></div>
          <div class="stackcard"><div class="layer">AI</div><div class="tech">Google Generative AI (gemini-1.5-flash), deterministic demo-mode fallback</div></div>
          <div class="stackcard"><div class="layer">Validation</div><div class="tech">Zod (backend)</div></div>
          <div class="stackcard"><div class="layer">Package management</div><div class="tech">npm workspaces — root links frontend + backend</div></div>
        </div>
      </section>

      <!-- STRUCTURE -->
      <section id="structure">
        <div class="eyebrow reveal">Monorepo structure</div>
        <h2 class="h reveal">Repository layout</h2>
        <p class="lead reveal">The root <code class="mono">package.json</code> is an npm workspaces root (<code class="mono">"workspaces": ["frontend", "backend"]</code>), so a single <code class="mono">npm install</code> at the repo root installs both packages.</p>
        <div class="codeblock reveal">
<pre>cognivia/
├── <span class="c1">backend/</span>                 Express + TypeScript API
│   └── src/
│       ├── server.ts        App entrypoint, CORS, error handling
│       ├── config/          Env loading, Supabase client
│       ├── controllers/     <span class="cmt">(scaffolded, currently empty)</span>
│       ├── middleware/      <span class="cmt">(scaffolded, currently empty)</span>
│       ├── routes/          index.ts holds ALL current API routes
│       ├── services/        geminiService.ts implemented; others stubs
│       ├── types/           shared TS types <span class="cmt">(stub)</span>
│       └── utils/           scoring / validation / prompt helpers <span class="cmt">(stubs)</span>
├── <span class="c1">database/</span>
│   ├── schema.sql           Full Postgres schema + RLS policies
│   └── seed.sql             Demo data: 1 educator, 1 student, 1 course, 7 concepts
└── <span class="c1">frontend/</span>                React + Vite SPA
    └── src/
        ├── components/
        │   ├── landing/     Marketing site
        │   ├── dashboard/   Student-facing app
        │   ├── educator/    Educator-facing analytics dashboard
        │   ├── tutor/       Chat-style tutor UI primitives
        │   ├── concepts/    Concept detail / graph / mastery bar <span class="cmt">(stubs)</span>
        │   └── ui/          Shared primitives — Badge, Button, Card, Modal, Loading
        ├── hooks/           useAuth, useApi, useDashboard, useTutor, useConfusionSignal
        ├── layouts/         StudentLayout, EducatorLayout, PublicLayout
        ├── pages/           Route-level page wrappers
        ├── services/        Frontend API client wrappers
        └── types/           Shared frontend TS types</pre>
        </div>
      </section>

      <!-- SIGNAL FLOW -->
      <section id="signal">
        <div class="eyebrow reveal">How confusion becomes a signal</div>
        <h2 class="h reveal">One tap, five things happen</h2>
        <p class="lead reveal">Individual signals are cheap to give — but only the aggregate, weighted, recency-decayed view surfaces on a dashboard. A single student can't dominate a concept's confusion score.</p>

        <div class="steps reveal">
          <div class="step">
            <div class="num">1</div>
            <div><div class="stitle">Student submits a signal</div><div class="sdesc"><code>POST /api/confusion/signal</code> with <code>{ concept_id, signal }</code>, where signal is Confused, Partially Clear, or Clear.</div></div>
          </div>
          <div class="step">
            <div class="num">2</div>
            <div><div class="stitle">Mastery updates immediately</div><div class="sdesc">Confused → mastery drops by 10 (floored at 0) and the concept is upserted into <code>revision_plans</code> as High priority, 10 minutes. Clear → mastery rises by 15 (capped at 100), pending revision is deleted, and an "improved" notification fires.</div></div>
          </div>
          <div class="step">
            <div class="num">3</div>
            <div><div class="stitle">Concept-level confusion % is computed on read</div><div class="sdesc"><code>GET /api/concepts/:id</code> weights the student's last 10 signals for that concept — Confused = 1.0, Partially Clear = 0.5, Clear = 0.0 — and averages to a percentage.</div></div>
          </div>
          <div class="step">
            <div class="num">4</div>
            <div><div class="stitle">The aggregate pulse buckets it class-wide</div><div class="sdesc"><code>GET /api/confusion/pulse</code> and <code>/api/analytics/educator</code> group every signal by concept: ≥66% HIGH, 33–65% MEDIUM, &lt;33% LOW.</div></div>
          </div>
          <div class="step">
            <div class="num">5</div>
            <div><div class="stitle">Completion nudges mastery back up</div><div class="sdesc"><code>POST /api/revision/:id/complete</code>, or a practice streak of ≥3 attempts at ≥80% accuracy, logs a <code>learning_sessions</code> row so streaks and weekly charts stay accurate.</div></div>
          </div>
        </div>
      </section>

      <!-- DATA MODEL -->
      <section id="data">
        <div class="eyebrow gold reveal">Data model</div>
        <h2 class="h reveal">Fourteen tables, RLS on every one</h2>
        <p class="lead reveal">Defined in <code class="mono">database/schema.sql</code>, applied to Supabase Postgres. Policies are intentionally permissive for the MVP — authenticated reads are broad, while inserts/updates restrict students to their own rows via <code class="mono">auth.uid() = student_id</code>.</p>
        <table class="reveal">
          <tr><th>Table</th><th>Purpose</th></tr>
          <tr><td><code>profiles</code></td><td>Extends <code>auth.users</code>; role is student, educator, or admin</td></tr>
          <tr><td><code>courses</code></td><td>Top-level course, owned by an educator</td></tr>
          <tr><td><code>lessons</code></td><td>Ordered lessons within a course</td></tr>
          <tr><td><code>concepts</code></td><td>Individual learnable concepts within a lesson, with a difficulty tier</td></tr>
          <tr><td><code>concept_dependencies</code></td><td>Self-referential graph — which concepts are prerequisites for which</td></tr>
          <tr><td><code>confusion_signals</code></td><td>Every Confused / Partially Clear / Clear event a student submits</td></tr>
          <tr><td><code>mastery_scores</code></td><td>One row per (student, concept), 0–100</td></tr>
          <tr><td><code>ai_conversations</code></td><td>Full Q&amp;A history with the AI tutor; answer stored as structured JSONB</td></tr>
          <tr><td><code>revision_plans</code></td><td>Auto-generated queue of concepts to revisit, with priority + estimated minutes</td></tr>
          <tr><td><code>practice_attempts</code></td><td>Every answered practice question, correct or not</td></tr>
          <tr><td><code>learning_sessions</code></td><td>Engagement log (lesson / practice / revision / tutor), powers streaks</td></tr>
          <tr><td><code>saved_explanations</code></td><td>Student-bookmarked tutor explanations</td></tr>
          <tr><td><code>notifications</code></td><td>In-app notifications — improvements, attention needed, plan ready</td></tr>
          <tr><td><code>course_enrollments</code></td><td>Student ↔ course join table</td></tr>
          <tr><td><code>practice_questions</code></td><td>Seeded MCQ / true-false / short-answer bank per concept</td></tr>
        </table>
        <p class="lead reveal" style="margin-top:22px;"><code class="mono">database/seed.sql</code> populates one demo educator, one demo student, one course ("Data Structures &amp; Algorithms"), and seven interlinked concepts — Arrays → Searching → Big-O / Logarithms → Binary Search — with realistic seeded mastery, signals, and practice history.</p>
      </section>

      <!-- API -->
      <section id="api">
        <div class="eyebrow reveal">API surface</div>
        <h2 class="h reveal">Every route, currently in one file</h2>
        <p class="lead reveal">All routes live in <code class="mono">backend/src/routes/index.ts</code>, mounted at the root. Auth for the MVP is a lightweight header-based mock — every request needs <code class="mono">x-user-id</code> and <code class="mono">x-user-role</code>, checked by an inline <code class="mono">requireAuth</code> middleware.</p>
        <table class="reveal">
          <tr><th>Area</th><th>Endpoints</th></tr>
          <tr><td>Health</td><td><code>GET /api/health</code></td></tr>
          <tr><td>Profile / Me</td><td><code>GET /api/me</code>, <code>GET /api/profile</code>, <code>PUT /api/profile</code></td></tr>
          <tr><td>Courses</td><td><code>GET /api/courses</code>, <code>GET /api/courses/:id</code>, <code>GET /api/lessons/:id</code>, <code>GET /api/concepts/:id</code></td></tr>
          <tr><td>Confusion</td><td><code>POST /api/confusion/signal</code>, <code>GET /api/confusion/pulse</code>, <code>GET /api/confusion/history</code></td></tr>
          <tr><td>AI Tutor</td><td><code>POST /api/tutor/chat</code>, <code>POST /api/tutor/explain-again</code>, <code>GET /api/tutor/history</code></td></tr>
          <tr><td>Revision</td><td><code>GET /api/revision/plan</code>, <code>POST /api/revision/:id/complete</code></td></tr>
          <tr><td>Practice</td><td><code>GET /api/practice</code>, <code>POST /api/practice/attempt</code></td></tr>
          <tr><td>Analytics</td><td><code>GET /api/analytics/student</code>, <code>GET /api/analytics/educator</code></td></tr>
          <tr><td>Notifications</td><td><code>GET /api/notifications</code>, <code>POST /api/notifications/:id/read</code></td></tr>
          <tr><td>Saved explanations</td><td><code>GET</code>, <code>POST</code>, <code>DELETE /api/saved-explanations</code></td></tr>
          <tr><td>Search</td><td><code>GET /api/search?q=</code> — courses, lessons, concepts</td></tr>
        </table>
        <p class="lead reveal" style="margin-top:22px;">The <code class="mono">controllers/</code>, most of <code class="mono">services/</code>, and all of <code class="mono">middleware/</code> exist as empty scaffolding — logic currently lives directly in <code class="mono">routes/index.ts</code>. Splitting it out is the natural next refactor.</p>
      </section>

      <!-- FRONTEND -->
      <section id="frontend">
        <div class="eyebrow gold reveal">Frontend structure</div>
        <h2 class="h reveal">Three route trees, one design language</h2>
        <div class="prose reveal">
          <p><strong>Routing</strong> (<code class="mono">App.tsx</code>): a public marketing site at <code class="mono">/</code>, a <code class="mono">/login</code> page, and two protected route trees gated by <code class="mono">ProtectedRoute</code> + <code class="mono">useAuth</code> — <strong>Student</strong> (<code class="mono">/dashboard</code>, <code class="mono">/courses</code>, <code class="mono">/course/:id</code>, <code class="mono">/tutor</code>, <code class="mono">/revision</code>) inside <code class="mono">StudentLayout</code>, and <strong>Educator</strong> (<code class="mono">/educator</code>) inside <code class="mono">EducatorLayout</code>. Transitions are animated with Framer Motion via a shared <code class="mono">RouteTransition</code> wrapper.</p>
          <p><strong>Landing page</strong>: Hero with an animated 3D-style "abstract core" graphic, problem statement, a 5-step "How It Works" explainer, a student section, an educator section with a live dashboard mockup, a final CTA, and a footer.</p>
          <p><strong>Student dashboard</strong>: a circular Learning Score gauge, streak card, AI-recommended next action, today's Clarity Plan, a confusion-signal timeline, weekly progress stats, and unread notifications — all driven by <code class="mono">GET /api/analytics/student</code>.</p>
          <p><strong>Confusion flow</strong>: <code class="mono">ConfusionButton.tsx</code> is a floating action button opening a modal — course → lesson → concept → signal → optional note — then posts to <code class="mono">/api/confusion/signal</code>.</p>
          <p><strong>Tutor</strong>: a single-question chat interface backed by <code class="mono">/api/tutor/chat</code>, rendering the structured Gemini response and letting the student confirm clarity ("Now I'm Clear", with a small celebratory particle burst) or ask for an alternate explanation.</p>
          <p><strong>Revision</strong>: lists the prioritized queue and launches a practice flow per concept; completing a session at ≥70% accuracy auto-marks the revision item complete.</p>
          <p><strong>Educator dashboard</strong>: summary cards, a Recharts bar chart of confusion-by-concept, a ranked topic breakdown with progress bars, and an AI-generated recommendation panel.</p>
          <p>Several components are intentionally left as stubs — <code class="mono">Sidebar.tsx</code>, <code class="mono">Topbar.tsx</code>, <code class="mono">ConceptGraph.tsx</code>, <code class="mono">ConfusionPulse.tsx</code>, most of <code class="mono">educator/*</code>. <code class="mono">frontend/fix-empty.cjs</code> auto-fills any zero-byte <code class="mono">.tsx</code> file with a minimal placeholder so the app always compiles mid-scaffolding.</p>
        </div>
      </section>

      <!-- DESIGN SYSTEM -->
      <section id="design">
        <div class="eyebrow reveal">Design system</div>
        <h2 class="h reveal">The tokens this page is built from</h2>
        <p class="lead reveal">Defined via <code class="mono">tailwind.config.js</code> and CSS custom properties in <code class="mono">index.css</code> — this document reuses those same tokens.</p>

        <h3 class="h3 reveal">Palette</h3>
        <div style="display:flex; gap:14px; margin-top:12px; flex-wrap:wrap;" class="reveal">
          <div style="width:120px;"><div style="height:56px; border-radius:8px; background:#000000; border:1px solid var(--border);"></div><div class="mono" style="font-size:11px; color:var(--text-dim); margin-top:6px;">#000000</div></div>
          <div style="width:120px;"><div style="height:56px; border-radius:8px; background:#0a0a0a; border:1px solid var(--border);"></div><div class="mono" style="font-size:11px; color:var(--text-dim); margin-top:6px;">#0a0a0a</div></div>
          <div style="width:120px;"><div style="height:56px; border-radius:8px; background:var(--coral);"></div><div class="mono" style="font-size:11px; color:var(--text-dim); margin-top:6px;">#e84040 — confusion</div></div>
          <div style="width:120px;"><div style="height:56px; border-radius:8px; background:var(--gold);"></div><div class="mono" style="font-size:11px; color:var(--text-dim); margin-top:6px;">#e8a634 — brand / CTA</div></div>
        </div>

        <h3 class="h3 reveal">Typography</h3>
        <div class="prose reveal">
          <p><span style="font-family:'Hanken Grotesk'; font-weight:800; font-size:20px; color:var(--text);">Hanken Grotesk</span> — display &amp; headlines</p>
          <p><span style="font-family:'Inter'; font-size:16px; color:var(--text);">Inter</span> — body copy</p>
          <p><span style="font-family:'JetBrains Mono'; font-size:15px; color:var(--text);">JETBRAINS MONO</span> — uppercase labels &amp; eyebrow text</p>
        </div>

        <h3 class="h3 reveal">Motion &amp; iconography</h3>
        <p class="lead reveal">Framer Motion drives staggered section reveals, the animated Learning Score progress ring, and animated confusion-heatmap bars, alongside a fully custom animated cursor with a trailing glow, ring, and dot. Material Symbols supply most iconography, with <code class="mono">lucide-react</code> for a handful of components.</p>
      </section>

      <!-- GETTING STARTED -->
      <section id="start">
        <div class="eyebrow gold reveal">Getting started</div>
        <h2 class="h reveal">Three steps to a running instance</h2>

        <h3 class="h3 reveal">1. Database</h3>
        <p class="lead reveal">Create a Supabase project, then run in order via the SQL editor or CLI:</p>
        <div class="codeblock reveal"><pre>database/schema.sql
database/seed.sql</pre></div>

        <h3 class="h3 reveal">2. Backend</h3>
        <div class="codeblock reveal"><pre><span class="c1">cd</span> backend
cp .env.example ../.env      <span class="cmt"># copy to the REPO ROOT as .env</span>
<span class="cmt"># edit .env: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY</span>
npm install
npm run dev                  <span class="cmt"># http://localhost:5000</span></pre></div>

        <h3 class="h3 reveal">3. Frontend</h3>
        <div class="codeblock reveal"><pre><span class="c1">cd</span> frontend
npm install
npm run dev                  <span class="cmt"># http://localhost:5173 (Vite default)</span></pre></div>
        <p class="lead reveal" style="margin-top:16px;">Or, from the repo root, a single <code class="mono">npm install</code> installs both workspaces via npm workspaces.</p>
      </section>

      <!-- ENV -->
      <section id="env">
        <div class="eyebrow reveal">Environment variables</div>
        <h2 class="h reveal">Set at the repository root</h2>
        <p class="lead reveal">In a <code class="mono">.env</code> file at the repo root (not inside <code class="mono">backend/</code>), per <code class="mono">backend/src/config/env.ts</code>.</p>
        <table class="reveal">
          <tr><th>Variable</th><th>Required</th><th>Notes</th></tr>
          <tr><td><code>PORT</code></td><td><span class="req-no">No</span></td><td>Defaults to 5000</td></tr>
          <tr><td><code>FRONTEND_URL</code></td><td><span class="req-no">No</span></td><td>Defaults to http://localhost:5173; used for CORS</td></tr>
          <tr><td><code>SUPABASE_URL</code></td><td><span class="req-yes">Yes*</span></td><td>Falls back to a mock localhost URL if unset</td></tr>
          <tr><td><code>SUPABASE_SERVICE_ROLE_KEY</code></td><td><span class="req-yes">Yes*</span></td><td>Backend bypasses RLS with the service role key and filters by <code>student_id</code> manually</td></tr>
          <tr><td><code>GEMINI_API_KEY</code></td><td><span class="req-no">No</span></td><td>See Demo Mode below</td></tr>
        </table>
        <p class="lead reveal" style="margin-top:14px; font-size:13px;">* Required for real data — the app still runs without it, backed by mocks and demo mode.</p>
      </section>

      <!-- DEMO MODE -->
      <section id="demo">
        <div class="eyebrow gold reveal">Demo mode</div>
        <h2 class="h reveal">No AI key required</h2>
        <div class="prose reveal">
          <p><code class="mono">geminiService.ts</code> checks for <code class="mono">GEMINI_API_KEY</code> at startup. If it's missing:</p>
          <p>— <code class="mono">askTutor()</code> and <code class="mono">explainAgain()</code> return a fixed, well-formed binary search explanation (with <code class="mono">isDemo: true</code>), so the entire tutor flow — ask, receive structured explanation, confirm clarity or request an alternate explanation — works end-to-end at zero API cost.</p>
          <p>— <code class="mono">generateEducatorRecommendation()</code> returns a canned recommendation string.</p>
          <p>The full product can be demoed — for a hackathon judge, say — without ever configuring a Gemini key. Only live, dynamic AI responses require one.</p>
        </div>
      </section>

      <!-- GAPS -->
      <section id="gaps">
        <div class="eyebrow reveal">Known gaps / work in progress</div>
        <h2 class="h reveal">Early-stage MVP — not a finished product</h2>
        <div class="gap-list reveal">
          <div class="gap"><div class="mark">!</div><div class="body"><b>Auth is a placeholder.</b> <code class="mono">requireAuth</code> trusts client-supplied <code class="mono">x-user-id</code> / <code class="mono">x-user-role</code> headers with no signature or session verification. <code class="mono">authController.ts</code>, <code class="mono">authMiddleware.ts</code>, and <code class="mono">authRoutes.ts</code> are all empty — this must become real Supabase Auth (or JWT verification) before handling real user data.</div></div>
          <div class="gap"><div class="mark">!</div><div class="body"><b>Routes aren't split into controllers yet.</b> All business logic lives in one large <code class="mono">routes/index.ts</code>. Next step: move each route group into its matching controller + service pair, and move <code class="mono">requireAuth</code> into <code class="mono">middleware/authMiddleware.ts</code> with a real check in <code class="mono">roleMiddleware.ts</code>.</div></div>
          <div class="gap"><div class="mark">!</div><div class="body"><b><code class="mono">utils/scoring.ts</code>, <code class="mono">validators.ts</code>, <code class="mono">prompts.ts</code>, <code class="mono">types/index.ts</code> are empty.</b> Scoring math and Gemini prompt templates currently live inline in <code class="mono">routes/index.ts</code> and <code class="mono">geminiService.ts</code> rather than being centralized and testable.</div></div>
          <div class="gap"><div class="mark">!</div><div class="body"><b>RLS policies are permissive by design</b> — "allow all authenticated read" on nearly every table. Appropriate for an MVP demo, not multi-tenant production use.</div></div>
          <div class="gap"><div class="mark">!</div><div class="body"><b>Two <code class="mono">layouts/</code> directories</b> — <code class="mono">components/layouts/</code> and <code class="mono">layouts/</code> — with overlapping <code class="mono">EducatorLayout.tsx</code> / <code class="mono">StudentLayout.tsx</code>. Worth consolidating to avoid drift.</div></div>
          <div class="gap"><div class="mark">!</div><div class="body"><b>Several UI components are unfinished stubs</b> generated by <code class="mono">fix-empty.cjs</code> — they render a placeholder <code class="mono">&lt;div&gt;</code> rather than real UI.</div></div>
        </div>
      </section>

      <footer>
        <span class="fbrand">COGNIVA</span>
        <span>Silent classroom confusion, made visible — same idea as PulseCheck, shipped as a working stack.</span>
      </footer>

    </div>
  </main>
</div>

<script>
  // scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  revealEls.forEach(el=> io.observe(el));

  // active TOC link
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.tocLink');
  const navIo = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      const link = document.querySelector('.tocLink[href="#'+entry.target.id+'"]');
      if(!link) return;
      if(entry.isIntersecting){ links.forEach(l=>l.classList.remove('active')); link.classList.add('active'); }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });
  sections.forEach(s=> navIo.observe(s));

  // animated confusion pulse — signature element
  const concepts = [
    { name: "Big-O Notation", pct: 78, band: "high" },
    { name: "Recursion", pct: 71, band: "high" },
    { name: "Binary Search", pct: 52, band: "med" },
    { name: "Logarithms", pct: 44, band: "med" },
    { name: "Searching", pct: 27, band: "low" },
    { name: "Array Indexing", pct: 12, band: "low" },
  ];
  const rowsEl = document.getElementById('pulseRows');
  concepts.forEach(c=>{
    const row = document.createElement('div');
    row.className = 'pulse-row';
    row.innerHTML = `
      <span class="name">${c.name}</span>
      <span class="track"><span class="fill ${c.band}" style="width:0%"></span></span>
      <span class="pct">${c.pct}%</span>
      <span class="badge ${c.band}">${c.band.toUpperCase()}</span>
    `;
    rowsEl.appendChild(row);
  });

  function animatePulse(){
    document.querySelectorAll('.pulse-row .fill').forEach((fill, i)=>{
      const target = concepts[i].pct;
      requestAnimationFrame(()=>{ fill.style.width = target + '%'; });
    });
  }
  const panelIo = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ animatePulse(); panelIo.disconnect(); } });
  }, { threshold: 0.3 });
  panelIo.observe(document.getElementById('pulsePanel'));

  // gentle re-pulse loop so the "live" feel reads even after first reveal
  setInterval(()=>{
    document.querySelectorAll('.pulse-row .fill').forEach((fill, i)=>{
      const jitter = Math.max(4, Math.min(96, concepts[i].pct + (Math.random()*6-3)));
      fill.style.width = jitter + '%';
    });
  }, 4200);
</script>

</body>
</html>
