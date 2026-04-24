Make the following changes:

* Update QP Maker:
    Turn the question paper design into an array so that I can chose on the design on time of creation and add the following html as second design:
        
```html
<!DOCTYPE html>
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
</html>
```
    

Apply changes to both mobile view and desktop (movbile view is the priority)

After applying the changes recreate project_snapshot.txt only for new files and files with changes, each time improve modularity of the program by introducing new component files (only on modified or new files), don't modify system files like pubspec, if we need new packages, or file path changes, removal etc, give the command for bash


Thoroughly check for ui sizing errors before writing the code
Note: as output only give project_snapshot and commands if needed



also if ur editing a big file, split it into smaller ones to improve modularity