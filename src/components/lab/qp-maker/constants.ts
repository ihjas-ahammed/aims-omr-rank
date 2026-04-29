export const QP_TEMPLATES = [
  {
    id: 'default',
    name: 'Classic Minimal',
    description: 'Clean, simple design with a top/bottom curve.',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Question Paper</title>
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    <style>
        :root {
            --primary-dark: #464646;
            --primary-light: #ffffff;
            --primary-gradient: linear-gradient(to right, #000000, #000000);
            --text-main: #333333;
            --text-muted: #666666;
            --border-color: #e0e0e0;
        }
        body {
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: var(--text-main);
            margin: 0;
            padding: 20px;
        }
        .page {
            width: 100%;
            position: relative;
            overflow: hidden;
            border-radius: 4px;
        }
        .page::before {
            content: '';
            position: absolute;
            top: 0; right: 0;
            width: 50%; height: 120px;
            background: linear-gradient(135deg, transparent 40%, rgba(91, 163, 224, 0.1) 100%);
            border-bottom-left-radius: 100%;
            pointer-events: none;
            z-index: 0;
        }
        .content-wrapper {
            position: relative;
            z-index: 1;
        }
        .top-header {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 30px;
        }
        .logo-area img {
            height: 80px;
        }
        .main-title-container {
            text-align: center;
            margin-bottom: 25px;
        }
        .sub-title {
            font-size: 16px;
            color: var(--text-muted);
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        .meta-bar {
            background: #000;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 25px;
            border-radius: 6px;
            font-size: 13.5px;
            font-weight: 600;
            margin-bottom: 40px;
        }
        .meta-item { display: flex; align-items: center; }
        .meta-divider {
            width: 1px;
            height: 16px;
            background-color: rgba(255,255,255,0.3);
            margin: 0 15px;
        }
        .meta-label {
            color: #ffffff;
            margin-right: 6px;
            font-weight: normal;
        }
        .section-container {
            margin-bottom: 30px;
            border-radius: 8px 8px 0 0;
            overflow: hidden;
            background-color: #fafbfc;
        }
        .section-header-bar {
            display: flex;
            background: var(--primary-gradient);
            color: white;
            position: relative;
        }
        .section-badge-wrapper {
            background-color: var(--primary-dark);
            padding: 10px 30px 10px 20px;
            font-weight: bold;
            font-size: 16px;
            clip-path: polygon(0 0, 100% 0, 85% 100%, 0% 100%);
            min-width: 130px;
            display: flex;
            align-items: center;
            z-index: 2;
        }
        .section-title-wrapper {
            padding: 10px 20px;
            font-weight: 800;
            font-style: italic;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            text-transform: uppercase;
            font-size: 15px;
            z-index: 1;
            margin-left: -15px;
        }
        .section-instruction {
            background-color: #f0f5fa;
            color: #444;
            font-size: 13.5px;
            padding: 10px 20px;
            border-bottom: 1px solid var(--border-color);
        }
        .questions-list {
            background-color: white;
            border-radius: 0 0 8px 8px;
        }
        .question-row {
            display: flex;
            padding: 16px 20px;
            border-bottom: 1px solid var(--border-color);
            font-size: 14.5px;
            line-height: 1.6;
        }
        .question-row:last-child { border-bottom: none; }
        .question-num {
            font-weight: bold;
            width: 35px;
            flex-shrink: 0;
            color: var(--primary-dark);
        }
        .question-text { flex-grow: 1; padding-right: 20px; }
        .question-mark {
            font-weight: 600;
            color: var(--text-muted);
            width: 50px;
            text-align: right;
            flex-shrink: 0;
            font-size: 13px;
            display: flex;
            align-items: flex-start;
            justify-content: flex-end;
        }
        .mark-badge {
            background-color: #eee;
            padding: 2px 6px;
            border-radius: 4px;
            border: 1px solid #ddd;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="content-wrapper">
            <div class="top-header">
                <div class="logo-area">
                    <img src="logo1.png" alt="Logo">
                </div>
            </div>
            <div class="main-title-container">
                <div class="sub-title">DAILY EXAMINATION</div>
            </div>
            <div class="meta-bar">
                <div class="meta-item"><span class="meta-label">Batch:</span> {BATCH}</div>
                <div class="meta-divider"></div>
                <div class="meta-item"><span class="meta-label">Set:</span> {SET}</div>
                <div class="meta-divider"></div>
                <div class="meta-item"><span class="meta-label">Date:</span> {DATE}</div>
                <div class="meta-divider"></div>
                <div class="meta-item"><span class="meta-label">Duration:</span> {DURATION} Mins</div>
                <div class="meta-divider"></div>
                <div class="meta-item"><span class="meta-label">Max Marks:</span> {MAX_MARKS}</div>
            </div>
            <!-- AI will generate sections and questions here -->
        </div>
    </div>
</body>
</html>`
  },
  {
    id: 'modern',
    name: 'Modern Academy',
    description: 'Structured layout with side-bars and rich colors.',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Question Paper</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --navy: #0d1b2a;
    --blue-accent: #1a4f8b;
    --green-accent: #1a6b3a;
    --purple-accent: #5b21b6;
    --text: #111827;
    --muted: #6b7280;
    --border: #d1d5db;
    --white: #ffffff;
  }
  body {
    font-family: 'Outfit', sans-serif;
    color: var(--text);
    padding: 20px;
  }
  .page {
    width: 100%;
    background: var(--white);
    padding: 10mm 5mm;
    position: relative;
  }
  .header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 7px;
    border-bottom: 2px solid var(--navy);
    margin-bottom: 6px;
  }
  .logo-box { width: 60px; display: flex; align-items: center; justify-content: center; }
  .logo-box img { width: 60px; object-fit: contain; }
  .header-center { flex: 1; text-align: center; }
  .institute-name {
    font-family: 'Outfit', sans-serif;
    font-weight: 800;
    font-size: 22pt;
    letter-spacing: 3px;
    color: var(--navy);
    line-height: 1;
    text-transform: uppercase;
  }
  .exam-title {
    font-family: 'Playfair Display', serif;
    font-weight: 700;
    font-size: 9.5pt;
    color: #374151;
    letter-spacing: 0.5px;
    margin-top: 3px;
    text-transform: uppercase;
  }
  .info-bar {
    background: var(--navy);
    color: var(--white);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 14px;
    border-radius: 3px;
    margin-bottom: 9px;
    font-size: 7.8pt;
    font-weight: 500;
  }
  .info-field { display: flex; flex-direction: column; align-items: center; gap: 1px; }
  .info-label { font-size: 5.5pt; font-weight: 700; color: #93c5fd; text-transform: uppercase; }
  .info-value { font-size: 8pt; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.3); min-width: 60px; text-align: center; }
  .info-divider { width: 1px; height: 28px; background: rgba(255,255,255,0.2); }
  .instructions {
    background: #f8fafc;
    border-left: 3px solid var(--navy);
    padding: 5px 10px;
    font-size: 6.8pt;
    color: #374151;
    margin-bottom: 15px;
    border-radius: 0 3px 3px 0;
  }
  .section-panel {
    border-radius: 5px;
    overflow: hidden;
    margin-bottom: 10px;
    border: 1px solid #e2e8f0;
  }
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 14px;
    background: var(--blue-accent);
  }
  .section-header-left { display: flex; align-items: center; gap: 10px; }
  .section-roman { font-size: 7pt; font-weight: 700; color: rgba(255,255,255,0.7); text-transform: uppercase; }
  .section-title { font-weight: 800; font-size: 11.5pt; color: var(--white); text-transform: uppercase; }
  .marks-badge {
    background: rgba(255,255,255,0.18);
    border: 1.5px solid rgba(255,255,255,0.5);
    color: var(--white);
    font-size: 7pt;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 20px;
  }
  .question-area { padding: 8px 14px 4px; background: #f0f6ff; }
  .question-row { display: flex; gap: 8px; margin-bottom: 15px; align-items: flex-start; }
  .q-number-circle {
    width: 20px; height: 20px;
    border-radius: 50%;
    background: var(--navy);
    color: white;
    font-size: 7.5pt;
    font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .q-content { flex: 1; }
  .q-marks {
    float: right;
    font-size: 6.5pt;
    font-weight: 700;
    color: var(--muted);
    background: rgba(255,255,255,0.7);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 1px 7px;
  }
  .q-text { font-family: 'Playfair Display', serif; font-size: 8.2pt; line-height: 1.55; color: var(--text); }
  .section-divider { height: 1px; background: linear-gradient(to right, transparent, #d1d5db, transparent); margin: 6px 0; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="logo-box"><img src="logo1.png" alt="Logo"></div>
    <div class="header-center">
      <div class="institute-name">AIMS&nbsp;PLUS</div>
      <div class="exam-title">Daily Examination</div>
    </div>
    <div class="logo-box"></div>
  </div>
  <div class="info-bar">
    <div class="info-field"><span class="info-label">Batch</span><span class="info-value">{BATCH}</span></div>
    <div class="info-divider"></div>
    <div class="info-field"><span class="info-label">Set</span><span class="info-value">{SET}</span></div>
    <div class="info-divider"></div>
    <div class="info-field"><span class="info-label">Date</span><span class="info-value">{DATE}</span></div>
    <div class="info-divider"></div>
    <div class="info-field"><span class="info-label">Duration</span><span class="info-value">{DURATION} Min</span></div>
    <div class="info-divider"></div>
    <div class="info-field"><span class="info-label">Max Marks</span><span class="info-value">{MAX_MARKS}</span></div>
  </div>
  <!-- AI will populate sections and questions -->
</div>
</body>
</html>`
  },
  {
    id: 'elegant',
    name: 'Elegant Serif',
    description: 'A sophisticated, academic look with serif typography.',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Question Paper</title>
<link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
<style>
  body {
    font-family: 'Merriweather', serif;
    color: #000;
    margin: 0;
    padding: 20px;
  }
  .page { width: 100%; }
  .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
  .logo { height: 60px; margin-bottom: 10px; }
  .title { font-size: 24pt; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; margin: 0; }
  .subtitle { font-family: 'Open Sans', sans-serif; font-size: 10pt; color: #555; margin-top: 5px; }
  .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-family: 'Open Sans', sans-serif; font-size: 9pt; margin-bottom: 20px; font-weight: 600; }
  .meta-item { border-bottom: 1px dotted #ccc; padding-bottom: 2px; }
  .instructions { font-family: 'Open Sans', sans-serif; font-size: 8pt; font-style: italic; margin-bottom: 20px; }
  .section-title { font-size: 14pt; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid #000; margin: 20px 0 10px; padding-bottom: 4px; }
  .question { margin-bottom: 15px; display: flex; align-items: flex-start; }
  .q-num { font-weight: bold; width: 30px; flex-shrink: 0; }
  .q-body { flex-grow: 1; font-size: 10pt; line-height: 1.6; }
  .q-marks { font-weight: bold; margin-left: 10px; white-space: nowrap; }
  .options { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-top: 5px; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <img src="logo1.png" alt="Logo" class="logo">
    <h1 class="title">AIMS PLUS</h1>
    <div class="subtitle">EXAMINATION PAPER</div>
  </div>
  <div class="meta-grid">
    <div class="meta-item">BATCH: {BATCH}</div>
    <div class="meta-item" style="text-align: center;">SET: {SET}</div>
    <div class="meta-item" style="text-align: right;">DATE: {DATE}</div>
    <div class="meta-item">DURATION: {DURATION} Min</div>
    <div class="meta-item"></div>
    <div class="meta-item" style="text-align: right;">MAX MARKS: {MAX_MARKS}</div>
  </div>
  <div class="instructions">Instructions: Read all questions carefully. All questions are compulsory.</div>
  <!-- AI will append sections and questions -->
</div>
</body>
</html>`
  },
  {
    id: 'boxed',
    name: 'Boxed Structured',
    description: 'Clean boxes for each question, very organized.',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Question Paper</title>
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
<style>
  body { font-family: 'Arial', sans-serif; color: #111; margin: 0; padding: 20px; }
  .page { width: 100%; }
  .header { display: flex; justify-content: space-between; align-items: center; background: #f0f0f0; padding: 15px; border-radius: 8px; border: 2px solid #ccc; margin-bottom: 20px; }
  .logo { height: 50px; }
  .header-text { text-align: right; }
  .header-text h1 { margin: 0; font-size: 20px; text-transform: uppercase; }
  .meta { display: flex; flex-wrap: wrap; gap: 15px; background: #fff; border: 1px solid #ddd; padding: 10px 15px; border-radius: 6px; margin-bottom: 20px; font-size: 13px; font-weight: bold; }
  .section-head { background: #333; color: #fff; padding: 8px 15px; font-size: 14px; font-weight: bold; text-transform: uppercase; margin: 20px 0 10px; border-radius: 4px; }
  .question-box { border: 1px solid #ccc; border-radius: 6px; padding: 12px; margin-bottom: 12px; background: #fafafa; }
  .q-top { display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
  .q-body { font-size: 14px; line-height: 1.5; }
  .options { margin-top: 10px; padding-left: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <img src="logo1.png" alt="Logo" class="logo">
    <div class="header-text">
      <h1>AIMS PLUS EVALUATION</h1>
      <div style="font-size: 12px; color: #666; margin-top: 4px;">Standardized Test Format</div>
    </div>
  </div>
  <div class="meta">
    <div>BATCH: {BATCH}</div>
    <div>SET: {SET}</div>
    <div>DATE: {DATE}</div>
    <div>TIME: {DURATION} Min</div>
    <div style="margin-left: auto;">MARKS: {MAX_MARKS}</div>
  </div>
  <!-- AI will populate section-head and question-box elements -->
</div>
</body>
</html>`
  }
];