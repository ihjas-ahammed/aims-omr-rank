export const QP_TEMPLATES =[
  {
    id: 'default',
    name: 'Classic Minimal',
    description: 'Clean, simple design with a top/bottom curve.',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Examination - Question Paper</title>
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    <style>
        :root {
            --primary-dark: #464646;
            --primary-light: #ffffff;
            --primary-gradient: linear-gradient(to right, #000000, #000000);
            --bg-body: #e4eef6;
            --bg-page: #ffffff;
            --text-main: #333333;
            --text-muted: #666666;
            --border-color: #e0e0e0;
        }

        body {
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: var(--text-main);
            margin: 0;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
        }

        .page {
            background-color: var(--bg-page);
            width: 850px;
            position: relative;
            overflow: hidden;
            border-radius: 4px;
        }

        /* Decorative top/bottom curves */
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
            padding: 50px 60px 30px 60px;
            position: relative;
            z-index: 1;
        }

        /* Top Header */
        .top-header {
            display: flex;
            justify-content: cv;
            justify-content: center;
            align-items: center;
            margin-bottom: 30px;
        }

        .logo-area {
            display: flex;
            align-items: center;
        }

        .logo-area img {
            height: 100px;
            /* White background logo sits perfectly on the white page background */
        }

        .student-info {
            text-align: right;
            font-size: 14px;
            color: var(--primary-dark);
            margin-top: 10px;
        }

        .student-info div {
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
        }

        .student-line {
            display: inline-block;
            width: 250px;
            border-bottom: 1px solid var(--primary-dark);
            margin-left: 10px;
        }

        /* Main Title */
        .main-title-container {
            text-align: center;
            margin-bottom: 25px;
        }

        .main-title {
            font-size: 42px;
            font-weight: 900;
            color: var(--primary-dark);
            letter-spacing: 1px;
            margin: 0 0 5px 0;
        }

        .sub-title {
            font-size: 16px;
            color: var(--text-muted);
            font-weight: 600;
            letter-spacing: 0.5px;
        }

        /* Meta Bar */
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
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .meta-item {
            display: flex;
            align-items: center;
        }
        
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

        /* Sections (Ribbon Style) */
        .section-container {
            margin-bottom: 30px;
            border-radius: 8px 8px 0 0;
            overflow: hidden;
            box-shadow: 0 0 0 1px rgba(0,0,0,0.03);
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
            margin-left: -15px; /* pull under clip-path */
        }

        .section-instruction {
            background-color: #f0f5fa;
            color: #444;
            font-size: 13.5px;
            padding: 10px 20px;
            border-bottom: 1px solid var(--border-color);
        }

        /* Questions */
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

        .question-row:last-child {
            border-bottom: none;
        }

        .question-num {
            font-weight: bold;
            width: 35px;
            flex-shrink: 0;
            color: var(--primary-dark);
        }

        .question-text {
            flex-grow: 1;
            padding-right: 20px;
        }

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

        /* Footer Icons */
        .footer-area {
            background: #f8fbff;
            border-top: 2px solid #e0ebf5;
            padding: 30px 60px;
            display: flex;
            justify-content: space-around;
            align-items: center;
            border-radius: 0 0 4px 4px;
        }

        .footer-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            color: var(--primary-dark);
            max-width: 150px;
        }

        .icon-circle {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: white;
            box-shadow: 0 4px 10px rgba(25, 64, 101, 0.1);
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 10px;
            color: var(--primary-dark);
        }

        .icon-circle svg {
            width: 24px;
            height: 24px;
        }
        
        .icon-circle.filled {
            background-color: var(--primary-dark);
            color: white;
        }

        .footer-text {
            font-size: 12px;
            font-weight: 600;
            line-height: 1.4;
        }

    </style>
</head>
<body>
    <div class="page">
        <div class="content-wrapper">
            
            <div class="top-header">
                <div class="logo-area">
                    <img src="logo1.png" alt="Institution Logo">
                </div>
            </div>

            <div class="main-title-container">
                <div class="sub-title">DAILY EXAMINATION - CHEMISTRY, MATHEMATICS & BIOLOGY</div>
            </div>

            <div class="meta-bar">
                <div class="meta-item"><span class="meta-label">Batch:</span> B3</div>
                <div class="meta-divider"></div>
                <div class="meta-item"><span class="meta-label">Set:</span> B</div>
                <div class="meta-divider"></div>
                <div class="meta-item"><span class="meta-label">Date:</span> 18th April 2026</div>
                <div class="meta-divider"></div>
                <div class="meta-item"><span class="meta-label">Duration:</span> 30 Minutes</div>
                <div class="meta-divider"></div>
                <div class="meta-item"><span class="meta-label">Max Marks:</span> 15</div>
            </div>

            <!-- Section 1 -->
            <div class="section-container">
                <div class="section-header-bar">
                    <div class="section-badge-wrapper">SECTION I</div>
                    <div class="section-title-wrapper">CHEMISTRY</div>
                </div>
                <div class="section-instruction">
                    Attempt all questions in this section. Total 5 marks.
                </div>
                <div class="questions-list">
                    <div class="question-row">
                        <div class="question-num">1.</div>
                        <div class="question-text">\\(5.85\\text{g NaCl}\\) is dissolved in \\(180\\text{g H}_2\\text{O}\\). Calculate the mole fraction of \\(\\text{NaCl}\\) and \\(\\text{H}_2\\text{O}\\)?</div>
                        <div class="question-mark"><span class="mark-badge">2.5</span></div>
                    </div>
                    <div class="question-row">
                        <div class="question-num">2.</div>
                        <div class="question-text">A \\(5\\text{M}\\) solution of \\(\\text{NaOH}\\) with volume \\(20\\text{ml}\\) is diluted to \\(1000\\text{ml}\\). Calculate its Molarity?</div>
                        <div class="question-mark"><span class="mark-badge">1.5</span></div>
                    </div>
                    <div class="question-row">
                        <div class="question-num">3.</div>
                        <div class="question-text">Aqueous solution of \\(\\text{NaOH}\\) has mass by volume percent \\(15\\). What does it mean?</div>
                        <div class="question-mark"><span class="mark-badge">1</span></div>
                    </div>
                </div>
            </div>

            <!-- Section 2 -->
            <div class="section-container">
                <div class="section-header-bar">
                    <div class="section-badge-wrapper">SECTION II</div>
                    <div class="section-title-wrapper">MATHEMATICS</div>
                </div>
                <div class="section-instruction">
                    Attempt all questions in this section. Total 5 marks.
                </div>
                <div class="questions-list">
                    <div class="question-row">
                        <div class="question-num">4.</div>
                        <div class="question-text">Find the derivative of \\(f(x) = \\sin(\\sqrt{\\tan x})\\).</div>
                        <div class="question-mark"><span class="mark-badge">1.5</span></div>
                    </div>
                    <div class="question-row">
                        <div class="question-num">5.</div>
                        <div class="question-text">Find the derivative of \\(f(x) = \\tan(3^{\\sin x})\\).</div>
                        <div class="question-mark"><span class="mark-badge">1.5</span></div>
                    </div>
                    <div class="question-row">
                        <div class="question-num">6.</div>
                        <div class="question-text">Find \\(\\frac{dy}{dx}\\) if \\(x^2 + 3y = \\cos y\\).</div>
                        <div class="question-mark"><span class="mark-badge">2</span></div>
                    </div>
                </div>
            </div>

            <!-- Section 3 -->
            <div class="section-container">
                <div class="section-header-bar">
                    <div class="section-badge-wrapper">SECTION III</div>
                    <div class="section-title-wrapper">BIOLOGY</div>
                </div>
                <div class="section-instruction">
                    Attempt all questions in this section. Total 5 marks.
                </div>
                <div class="questions-list">
                    <div class="question-row">
                        <div class="question-num">7.</div>
                        <div class="question-text">Proximal end of stamen connected with _________ and _________.</div>
                        <div class="question-mark"><span class="mark-badge">2</span></div>
                    </div>
                    <div class="question-row">
                        <div class="question-num">8.</div>
                        <div class="question-text">What is sporogeneous tissue?</div>
                        <div class="question-mark"><span class="mark-badge"></span></div>
                    </div>
                    <div class="question-row">
                        <div class="question-num">9.</div>
                        <div class="question-text">Stamen represent _________.</div>
                        <div class="question-mark"><span class="mark-badge">1</span></div>
                    </div>
                </div>
            </div>

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
<title>AIMS PLUS – Daily Examination</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy: #0d1b2a;
    --blue-accent: #1a4f8b;
    --blue-light: #dbeafe;
    --blue-mid: #93c5fd;
    --green-accent: #1a6b3a;
    --green-light: #d1fae5;
    --green-mid: #6ee7b7;
    --purple-accent: #5b21b6;
    --purple-light: #ede9fe;
    --purple-mid: #c4b5fd;
    --text: #111827;
    --muted: #6b7280;
    --border: #d1d5db;
    --white: #ffffff;
    --page-w: 210mm;
    --page-h: 297mm;
  }

  html, body {
    background: #e5e7eb;
    font-family: 'Outfit', sans-serif;
    color: var(--text);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── PAGE WRAPPER ── */
  .page {
    width: var(--page-w);
    min-height: var(--page-h);
    margin: 20px auto;
    background: var(--white);
    border: 1.5px solid #9ca3af;
    padding: 10mm 12mm 10mm;
    position: relative;
    box-shadow: 0 8px 40px rgba(0,0,0,0.18);
  }

  /* thin outer frame */
  .page::before {
    content: '';
    position: absolute;
    inset: 4mm;
    border: 0.6px solid #cbd5e1;
    pointer-events: none;
    z-index: 0;
  }

  /* ── HEADER ── */
  .header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 7px;
    border-bottom: 2px solid var(--navy);
    margin-bottom: 6px;
  }
  .logo-box {
    width: 62px;
    height: 62px;
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .logo-box img {
    width: 62px;
    height: 62px;
    object-fit: contain;
  }
  .header-center {
    flex: 1;
    text-align: center;
  }
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
  .tagline-top {
    font-size: 6.5pt;
    color: var(--muted);
    letter-spacing: 1px;
    margin-top: 2px;
    font-weight: 400;
  }

  /* ── INFO BAR ── */
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
    letter-spacing: 0.4px;
  }
  .info-field {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
  }
  .info-label {
    font-size: 5.5pt;
    font-weight: 700;
    color: #93c5fd;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .info-value {
    font-size: 8pt;
    font-weight: 600;
    border-bottom: 1px solid rgba(255,255,255,0.3);
    min-width: 60px;
    text-align: center;
    padding-bottom: 1px;
  }
  .info-divider {
    width: 1px;
    height: 28px;
    background: rgba(255,255,255,0.2);
  }

  /* ── INSTRUCTIONS ── */
  .instructions {
    background: #f8fafc;
    border-left: 3px solid var(--navy);
    padding: 5px 10px;
    font-size: 6.8pt;
    color: #374151;
    margin-bottom: 9px;
    border-radius: 0 3px 3px 0;
    line-height: 1.6;
  }
  .instructions strong {
    font-weight: 700;
    color: var(--navy);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* ── SECTION PANEL ── */
  .section-panel {
    border-radius: 5px;
    overflow: hidden;
    margin-bottom: 10px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 6px rgba(0,0,0,0.06);
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 14px;
    position: relative;
  }
  .section-header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .section-roman {
    font-family: 'Outfit', sans-serif;
    font-size: 7pt;
    font-weight: 700;
    color: rgba(255,255,255,0.7);
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .section-title {
    font-family: 'Outfit', sans-serif;
    font-weight: 800;
    font-size: 11.5pt;
    color: var(--white);
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }
  .section-topic {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-size: 7pt;
    color: rgba(255,255,255,0.85);
    margin-top: 1px;
  }
  .marks-badge {
    background: rgba(255,255,255,0.18);
    border: 1.5px solid rgba(255,255,255,0.5);
    color: var(--white);
    font-size: 7pt;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 20px;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }

  /* Physics – blue */
  .physics .section-header { background: var(--blue-accent); }
  .physics .question-area { background: #f0f6ff; }
  .physics .q-number-circle { background: var(--blue-accent); }
  .physics .diff-dot.active { background: var(--blue-accent); }

  /* Chemistry – green */
  .chemistry .section-header { background: var(--green-accent); }
  .chemistry .question-area { background: #f0fdf6; }
  .chemistry .q-number-circle { background: var(--green-accent); }
  .chemistry .diff-dot.active { background: var(--green-accent); }

  /* Biology – purple */
  .biology .section-header { background: var(--purple-accent); }
  .biology .question-area { background: #f5f3ff; }
  .biology .q-number-circle { background: var(--purple-accent); }
  .biology .diff-dot.active { background: var(--purple-accent); }

  .question-area {
    padding: 8px 14px 4px;
  }

  /* ── QUESTION ROW ── */
  .question-row {
    display: flex;
    gap: 8px;
    margin-bottom: 9px;
    align-items: flex-start;
  }
  .q-meta {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    min-width: 32px;
  }
  .q-number-circle {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    color: white;
    font-size: 7.5pt;
    font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .diff-dots {
    display: flex;
    flex-direction: column;
    gap: 2px;
    align-items: center;
  }
  .diff-label {
    font-size: 4.5pt;
    color: var(--muted);
    letter-spacing: 0.5px;
    text-transform: uppercase;
    line-height: 1;
    margin-top: 1px;
  }
  .diff-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #d1d5db;
  }
  .diff-dot.active { /* colored by parent */ }

  .q-content {
    flex: 1;
  }
  .q-type-tag {
    display: inline-block;
    font-size: 5.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    padding: 1.5px 6px;
    border-radius: 3px;
    margin-bottom: 3px;
  }
  .tag-deriv  { background: #dbeafe; color: var(--blue-accent); }
  .tag-short  { background: #d1fae5; color: var(--green-accent); }
  .tag-mcq    { background: #ede9fe; color: var(--purple-accent); }
  .tag-fill   { background: #fef9c3; color: #92400e; }
  .tag-long   { background: #ffe4e6; color: #9f1239; }

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
  .q-text {
    font-family: 'Playfair Display', serif;
    font-size: 8.2pt;
    line-height: 1.55;
    color: var(--text);
    margin-bottom: 4px;
  }
  .q-text em {
    font-style: italic;
    color: #374151;
  }

  /* Diagram placeholder */
  .diagram-box {
    border: 1px dashed #94a3b8;
    background: #f8fafc;
    width: 70mm;
    height: 20mm;
    display: flex; align-items: center; justify-content: center;
    border-radius: 3px;
    margin: 4px 0 5px;
  }
  .diagram-label {
    font-size: 6pt;
    color: #94a3b8;
    letter-spacing: 0.5px;
    font-style: italic;
  }

  /* Answer lines */
  .answer-lines {
    margin-top: 4px;
  }
  .answer-line {
    border-bottom: 0.7px solid #d1d5db;
    height: 10px;
    margin-bottom: 6px;
    width: 100%;
  }

  /* MCQ options */
  .mcq-box {
    background: rgba(255,255,255,0.65);
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    padding: 5px 10px;
    margin: 4px 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3px 16px;
  }
  .mcq-option {
    font-size: 7.8pt;
    font-family: 'Playfair Display', serif;
    color: var(--text);
    display: flex;
    gap: 5px;
    align-items: baseline;
    line-height: 1.4;
  }
  .opt-label {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 7pt;
    color: var(--muted);
    min-width: 10px;
  }

  /* Fill in the blank */
  .blank {
    display: inline-block;
    border-bottom: 1.2px solid var(--text);
    min-width: 28mm;
    margin: 0 2px;
    height: 10px;
    vertical-align: bottom;
  }

  /* Section divider */
  .section-divider {
    height: 1px;
    background: linear-gradient(to right, transparent, #d1d5db, transparent);
    margin: 3px 0 6px;
  }

  /* ── FOOTER ── */
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    padding-top: 6px;
    border-top: 1.5px solid var(--navy);
    font-size: 6.5pt;
    color: var(--muted);
  }
  .footer-tagline {
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    color: var(--navy);
    letter-spacing: 0.5px;
  }
  .footer-page {
    font-size: 6.5pt;
    font-weight: 600;
    color: var(--navy);
  }

  @media print {
    body { background: none; }
    .page { margin: 0; box-shadow: none; border: none; }
    .page::before { border-color: #d1d5db; }
  }
</style>
</head>
<body>

<div class="page">

  <!-- ══ HEADER ══ -->
  <div class="header">
    <div class="logo-box">
      <img src="logo1.png" alt="AIMS PLUS Logo">
    </div>
    <div class="header-center">
      <div class="institute-name">AIMS&nbsp;PLUS</div>
      <div class="exam-title">Daily Examination &mdash; Physics, Chemistry &amp; Biology</div>
      <div class="tagline-top">Powered by Harvest Group of Institutions</div>
    </div>
    <div class="logo-box">
      <!-- mirrored space for balance -->
    </div>
  </div>

  <!-- ══ INFO BAR ══ -->
  <div class="info-bar">
    <div class="info-field">
      <span class="info-label">Batch</span>
      <span class="info-value">NEET 2025–26</span>
    </div>
    <div class="info-divider"></div>
    <div class="info-field">
      <span class="info-label">Set</span>
      <span class="info-value">Set – A</span>
    </div>
    <div class="info-divider"></div>
    <div class="info-field">
      <span class="info-label">Date</span>
      <span class="info-value">____ / ____ / 2025</span>
    </div>
    <div class="info-divider"></div>
    <div class="info-field">
      <span class="info-label">Duration</span>
      <span class="info-value">1 Hour 30 Min</span>
    </div>
    <div class="info-divider"></div>
    <div class="info-field">
      <span class="info-label">Max Marks</span>
      <span class="info-value">90 Marks</span>
    </div>
  </div>

  <!-- ══ INSTRUCTIONS ══ -->
  <div class="instructions">
    <strong>General Instructions:</strong>&nbsp;
    Attempt all questions. Marks are indicated against each question. Write legibly. MCQ answers must be circled. Use blue/black pen only. Rough work should be done on the last page. Calculators and electronic devices are strictly prohibited.
  </div>

  <!-- ════════════════════════════════════
       SECTION I – PHYSICS
  ════════════════════════════════════ -->
  <div class="section-panel physics">
    <div class="section-header">
      <div class="section-header-left">
        <div>
          <div class="section-roman">Section I</div>
          <div class="section-title">Physics</div>
          <div class="section-topic">Laws of Motion &amp; Work, Energy &amp; Power</div>
        </div>
      </div>
      <div class="marks-badge">30 Marks</div>
    </div>

    <div class="question-area">

      <!-- Q1 – Derivation -->
      <div class="question-row">
        <div class="q-meta">
          <div class="q-number-circle">1</div>
          <div class="diff-dots">
            <div class="diff-dot active"></div>
            <div class="diff-dot active"></div>
            <div class="diff-dot active"></div>
          </div>
          <div class="diff-label">Hard</div>
        </div>
        <div class="q-content">
          <span class="q-marks">[8 M]</span>
          <span class="q-type-tag tag-deriv">Derivation</span>
          <div class="q-text">
            Derive an expression for the <em>work done by a variable force</em> acting on a particle moving along the X-axis. Hence show that the work-energy theorem holds for a variable force. Support your derivation with a neat and labelled diagram.
          </div>
          <div class="diagram-box">
            <span class="diagram-label">[ Diagram / Figure Space ]</span>
          </div>
          <div class="answer-lines">
            <div class="answer-line"></div>
            <div class="answer-line"></div>
            <div class="answer-line"></div>
            <div class="answer-line"></div>
          </div>
        </div>
      </div>

      <div class="section-divider"></div>

      <!-- Q2 – Short Answer -->
      <div class="question-row">
        <div class="q-meta">
          <div class="q-number-circle">2</div>
          <div class="diff-dots">
            <div class="diff-dot active"></div>
            <div class="diff-dot active"></div>
            <div class="diff-dot"></div>
          </div>
          <div class="diff-label">Med</div>
        </div>
        <div class="q-content">
          <span class="q-marks">[4 M]</span>
          <span class="q-type-tag tag-short">Short Answer</span>
          <div class="q-text">
            A body of mass 5 kg is moving on a rough horizontal surface with a uniform velocity of 12 m/s. If the coefficient of kinetic friction is 0.4, calculate the force applied on the body and the work done against friction in 3 seconds. (g = 10 m/s²)
          </div>
          <div class="answer-lines">
            <div class="answer-line"></div>
            <div class="answer-line"></div>
            <div class="answer-line"></div>
          </div>
        </div>
      </div>

      <div class="section-divider"></div>

      <!-- Q3 – MCQ -->
      <div class="question-row">
        <div class="q-meta">
          <div class="q-number-circle">3</div>
          <div class="diff-dots">
            <div class="diff-dot active"></div>
            <div class="diff-dot"></div>
            <div class="diff-dot"></div>
          </div>
          <div class="diff-label">Easy</div>
        </div>
        <div class="q-content">
          <span class="q-marks">[1 M]</span>
          <span class="q-type-tag tag-mcq">MCQ</span>
          <div class="q-text">
            A block of mass 2 kg is placed on a frictionless inclined plane of angle 30°. The magnitude of acceleration of the block sliding down the plane is:
          </div>
          <div class="mcq-box">
            <div class="mcq-option"><span class="opt-label">(a)</span> 4.9 m/s²</div>
            <div class="mcq-option"><span class="opt-label">(b)</span> 9.8 m/s²</div>
            <div class="mcq-option"><span class="opt-label">(c)</span> 5.0 m/s²</div>
            <div class="mcq-option"><span class="opt-label">(d)</span> 8.5 m/s²</div>
          </div>
        </div>
      </div>

      <div class="section-divider"></div>

      <!-- Q4 – Fill in the blank -->
      <div class="question-row">
        <div class="q-meta">
          <div class="q-number-circle">4</div>
          <div class="diff-dots">
            <div class="diff-dot active"></div>
            <div class="diff-dot"></div>
            <div class="diff-dot"></div>
          </div>
          <div class="diff-label">Easy</div>
        </div>
        <div class="q-content">
          <span class="q-marks">[2 M]</span>
          <span class="q-type-tag tag-fill">Fill in the Blank</span>
          <div class="q-text">
            The rate of doing work is called <span class="blank"></span>. Its SI unit is <span class="blank"></span>, which is equivalent to one joule per second. When a force acts perpendicular to displacement, the work done is <span class="blank"></span>.
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- ════════════════════════════════════
       SECTION II – CHEMISTRY
  ════════════════════════════════════ -->
  <div class="section-panel chemistry">
    <div class="section-header">
      <div class="section-header-left">
        <div>
          <div class="section-roman">Section II</div>
          <div class="section-title">Chemistry</div>
          <div class="section-topic">Chemical Bonding &amp; Molecular Structure</div>
        </div>
      </div>
      <div class="marks-badge">30 Marks</div>
    </div>

    <div class="question-area">

      <!-- Q5 – Derivation / Long -->
      <div class="question-row">
        <div class="q-meta">
          <div class="q-number-circle">5</div>
          <div class="diff-dots">
            <div class="diff-dot active"></div>
            <div class="diff-dot active"></div>
            <div class="diff-dot active"></div>
          </div>
          <div class="diff-label">Hard</div>
        </div>
        <div class="q-content">
          <span class="q-marks">[8 M]</span>
          <span class="q-type-tag tag-deriv">Derivation</span>
          <div class="q-text">
            Explain the formation of a covalent bond using the <em>Molecular Orbital Theory (MOT)</em>. Describe how bonding and antibonding molecular orbitals arise from the linear combination of atomic orbitals (LCAO). Draw the energy-level diagram for N₂ and comment on its bond order and magnetic properties.
          </div>
          <div class="diagram-box">
            <span class="diagram-label">[ Energy Level Diagram – Draw Here ]</span>
          </div>
          <div class="answer-lines">
            <div class="answer-line"></div>
            <div class="answer-line"></div>
            <div class="answer-line"></div>
            <div class="answer-line"></div>
          </div>
        </div>
      </div>

      <div class="section-divider"></div>

      <!-- Q6 – Short Answer -->
      <div class="question-row">
        <div class="q-meta">
          <div class="q-number-circle">6</div>
          <div class="diff-dots">
            <div class="diff-dot active"></div>
            <div class="diff-dot active"></div>
            <div class="diff-dot"></div>
          </div>
          <div class="diff-label">Med</div>
        </div>
        <div class="q-content">
          <span class="q-marks">[4 M]</span>
          <span class="q-type-tag tag-short">Short Answer</span>
          <div class="q-text">
            Define electronegativity. Using Fajan's rules, explain why AlCl₃ has more covalent character than NaCl. What is the significance of electronegativity difference in determining the type of chemical bond formed between two atoms?
          </div>
          <div class="answer-lines">
            <div class="answer-line"></div>
            <div class="answer-line"></div>
            <div class="answer-line"></div>
          </div>
        </div>
      </div>

      <div class="section-divider"></div>

      <!-- Q7 – MCQ -->
      <div class="question-row">
        <div class="q-meta">
          <div class="q-number-circle">7</div>
          <div class="diff-dots">
            <div class="diff-dot active"></div>
            <div class="diff-dot"></div>
            <div class="diff-dot"></div>
          </div>
          <div class="diff-label">Easy</div>
        </div>
        <div class="q-content">
          <span class="q-marks">[1 M]</span>
          <span class="q-type-tag tag-mcq">MCQ</span>
          <div class="q-text">
            Which of the following molecules has a <em>trigonal bipyramidal</em> geometry according to VSEPR theory?
          </div>
          <div class="mcq-box">
            <div class="mcq-option"><span class="opt-label">(a)</span> NH₃</div>
            <div class="mcq-option"><span class="opt-label">(b)</span> PCl₅</div>
            <div class="mcq-option"><span class="opt-label">(c)</span> SF₆</div>
            <div class="mcq-option"><span class="opt-label">(d)</span> H₂O</div>
          </div>
        </div>
      </div>

      <div class="section-divider"></div>

      <!-- Q8 – Fill in the blank -->
      <div class="question-row">
        <div class="q-meta">
          <div class="q-number-circle">8</div>
          <div class="diff-dots">
            <div class="diff-dot active"></div>
            <div class="diff-dot"></div>
            <div class="diff-dot"></div>
          </div>
          <div class="diff-label">Easy</div>
        </div>
        <div class="q-content">
          <span class="q-marks">[2 M]</span>
          <span class="q-type-tag tag-fill">Fill in the Blank</span>
          <div class="q-text">
            The type of hybridisation in the carbon atoms of benzene is <span class="blank"></span>. The bond angle in a water molecule is approximately <span class="blank"></span>, which is less than the ideal tetrahedral angle due to <span class="blank"></span> repulsions.
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- ════════════════════════════════════
       SECTION III – BIOLOGY
  ════════════════════════════════════ -->
  <div class="section-panel biology">
    <div class="section-header">
      <div class="section-header-left">
        <div>
          <div class="section-roman">Section III</div>
          <div class="section-title">Biology</div>
          <div class="section-topic">Cell Cycle, Cell Division &amp; Biomolecules</div>
        </div>
      </div>
      <div class="marks-badge">30 Marks</div>
    </div>

    <div class="question-area">

      <!-- Q9 – Derivation / Long -->
      <div class="question-row">
        <div class="q-meta">
          <div class="q-number-circle">9</div>
          <div class="diff-dots">
            <div class="diff-dot active"></div>
            <div class="diff-dot active"></div>
            <div class="diff-dot active"></div>
          </div>
          <div class="diff-label">Hard</div>
        </div>
        <div class="q-content">
          <span class="q-marks">[8 M]</span>
          <span class="q-type-tag tag-deriv">Long Answer</span>
          <div class="q-text">
            Describe the various stages of <em>Prophase I of Meiosis</em> in detail. Explain the significance of crossing over in the context of genetic variation. With the help of a labelled diagram, depict the arrangement of chromosomes during the zygotene and pachytene sub-stages.
          </div>
          <div class="diagram-box">
            <span class="diagram-label">[ Labelled Diagram – Draw Here ]</span>
          </div>
          <div class="answer-lines">
            <div class="answer-line"></div>
            <div class="answer-line"></div>
            <div class="answer-line"></div>
            <div class="answer-line"></div>
          </div>
        </div>
      </div>

      <div class="section-divider"></div>

      <!-- Q10 – Short Answer -->
      <div class="question-row">
        <div class="q-meta">
          <div class="q-number-circle">10</div>
          <div class="diff-dots">
            <div class="diff-dot active"></div>
            <div class="diff-dot active"></div>
            <div class="diff-dot"></div>
          </div>
          <div class="diff-label">Med</div>
        </div>
        <div class="q-content">
          <span class="q-marks">[4 M]</span>
          <span class="q-type-tag tag-short">Short Answer</span>
          <div class="q-text">
            Differentiate between <em>competitive</em> and <em>non-competitive inhibition</em> of enzyme activity. How does the concentration of substrate affect the rate of an enzyme-catalysed reaction? Mention the role of cofactors and coenzymes in enzyme function.
          </div>
          <div class="answer-lines">
            <div class="answer-line"></div>
            <div class="answer-line"></div>
            <div class="answer-line"></div>
          </div>
        </div>
      </div>

      <div class="section-divider"></div>

      <!-- Q11 – MCQ -->
      <div class="question-row">
        <div class="q-meta">
          <div class="q-number-circle">11</div>
          <div class="diff-dots">
            <div class="diff-dot active"></div>
            <div class="diff-dot"></div>
            <div class="diff-dot"></div>
          </div>
          <div class="diff-label">Easy</div>
        </div>
        <div class="q-content">
          <span class="q-marks">[1 M]</span>
          <span class="q-type-tag tag-mcq">MCQ</span>
          <div class="q-text">
            During which phase of the cell cycle does <em>DNA replication</em> take place?
          </div>
          <div class="mcq-box">
            <div class="mcq-option"><span class="opt-label">(a)</span> G₁ Phase</div>
            <div class="mcq-option"><span class="opt-label">(b)</span> S Phase</div>
            <div class="mcq-option"><span class="opt-label">(c)</span> G₂ Phase</div>
            <div class="mcq-option"><span class="opt-label">(d)</span> M Phase</div>
          </div>
        </div>
      </div>

      <div class="section-divider"></div>

      <!-- Q12 – Fill in the blank -->
      <div class="question-row">
        <div class="q-meta">
          <div class="q-number-circle">12</div>
          <div class="diff-dots">
            <div class="diff-dot active"></div>
            <div class="diff-dot"></div>
            <div class="diff-dot"></div>
          </div>
          <div class="diff-label">Easy</div>
        </div>
        <div class="q-content">
          <span class="q-marks">[2 M]</span>
          <span class="q-type-tag tag-fill">Fill in the Blank</span>
          <div class="q-text">
            The functional unit of a kidney is the <span class="blank"></span>. The process by which plants manufacture food using sunlight is called <span class="blank"></span>. The genetic material in most living organisms is <span class="blank"></span>, which exists as a double helix.
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- ══ FOOTER ══ -->
  <div class="footer">
    <div>
      <span class="footer-tagline">Powered by Harvest Group of Institutions</span>
    </div>
    <div style="font-size:6pt; color:#9ca3af; letter-spacing:0.5px;">
      All questions carry marks as indicated. Unauthorised reproduction prohibited.
    </div>
    <div class="footer-page">Page 1 of 1</div>
  </div>

</div><!-- /.page -->

</body>
</html>`
  }
];