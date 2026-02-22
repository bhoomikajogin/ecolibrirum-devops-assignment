const express = require('express');
const app = express();
const os = require('os');

const PORT = process.env.PORT || 3000;
const MESSAGE = process.env.MESSAGE || "Hello from EKS!";
const STACK = process.env.STACK || "v1";

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>EKS Demo App</title>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Syne:wght@400;800&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #0a0a0f;
      --surface: #111118;
      --border: #1e1e2e;
      --accent: #00ffaa;
      --accent2: #7c6af7;
      --text: #e8e8f0;
      --muted: #555570;
      --mono: 'JetBrains Mono', monospace;
      --sans: 'Syne', sans-serif;
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--sans);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .grid-bg {
      position: fixed;
      inset: 0;
      background-image:
        linear-gradient(var(--border) 1px, transparent 1px),
        linear-gradient(90deg, var(--border) 1px, transparent 1px);
      background-size: 40px 40px;
      opacity: 0.4;
      z-index: 0;
    }

    .glow {
      position: fixed;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0,255,170,0.07) 0%, transparent 70%);
      top: -100px;
      left: -100px;
      z-index: 0;
      animation: drift 8s ease-in-out infinite alternate;
    }

    .glow2 {
      background: radial-gradient(circle, rgba(124,106,247,0.07) 0%, transparent 70%);
      top: auto;
      left: auto;
      bottom: -100px;
      right: -100px;
      animation-delay: -4s;
    }

    @keyframes drift {
      from { transform: translate(0, 0); }
      to   { transform: translate(40px, 40px); }
    }

    .container {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 680px;
      padding: 24px;
      animation: fadeUp 0.7s ease both;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: var(--mono);
      font-size: 11px;
      color: var(--accent);
      border: 1px solid var(--accent);
      padding: 4px 10px;
      border-radius: 20px;
      margin-bottom: 20px;
      letter-spacing: 0.05em;
    }

    .badge::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--accent);
      animation: pulse 1.5s ease infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    h1 {
      font-size: clamp(2rem, 6vw, 3.2rem);
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 12px;
      background: linear-gradient(135deg, #fff 40%, var(--accent2));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle {
      font-family: var(--mono);
      font-size: 13px;
      color: var(--muted);
      margin-bottom: 36px;
      letter-spacing: 0.02em;
    }

    .cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 12px;
    }

    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      transition: border-color 0.2s, transform 0.2s;
      animation: fadeUp 0.7s ease both;
    }

    .card:hover {
      border-color: var(--accent2);
      transform: translateY(-2px);
    }

    .card:nth-child(1) { animation-delay: 0.1s; }
    .card:nth-child(2) { animation-delay: 0.2s; }
    .card:nth-child(3) { animation-delay: 0.3s; }
    .card.wide {
      grid-column: 1 / -1;
      animation-delay: 0.35s;
    }

    .card-label {
      font-family: var(--mono);
      font-size: 10px;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 8px;
    }

    .card-value {
      font-family: var(--mono);
      font-size: 14px;
      color: var(--accent);
      word-break: break-word;
    }

    .card-value.purple { color: var(--accent2); }
    .card-value.white  { color: var(--text); font-size: 13px; }

    .footer {
      margin-top: 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: var(--mono);
      font-size: 11px;
      color: var(--muted);
      animation: fadeUp 0.7s 0.4s ease both;
    }

    .footer span { display: flex; align-items: center; gap: 6px; }

    .dot {
      width: 5px; height: 5px;
      border-radius: 50%;
      background: var(--accent);
    }
  </style>
</head>
<body>
  <div class="grid-bg"></div>
  <div class="glow"></div>
  <div class="glow glow2"></div>

  <div class="container">
    <div class="badge">LIVE &nbsp;·&nbsp; EKS CLUSTER</div>
    <h1>EKS Demo App</h1>
    <p class="subtitle">// deployed via helm · kubernetes · aws</p>

    <div class="cards">
      <div class="card">
        <div class="card-label">Message</div>
        <div class="card-value">${MESSAGE}</div>
      </div>
      <div class="card">
        <div class="card-label">stack</div>
        <div class="card-value purple">${STACK}</div>
      </div>
      <div class="card wide">
        <div class="card-label">Hostname (Pod)</div>
        <div class="card-value white">${os.hostname()}</div>
      </div>
    </div>

    <div class="footer">
      <span><div class="dot"></div> healthy</span>
      <span>port ${PORT}</span>
    </div>
  </div>
</body>
</html>`;

app.get('/', (req, res) => {
  res.send(html);
});

app.get('/api', (req, res) => {
  res.json({
    message: MESSAGE,
    stack: STACK,
    hostname: os.hostname()
  });
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});