export const QP_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Batch B3 - Set B - Daily Examination</title>
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    <style>
        body { font-family: 'Georgia', 'Times New Roman', serif; background-color: #fafafa; color: #222; margin: 0; padding: 40px; display: flex; justify-content: center; }
        .page { background-color: #fff; width: 800px; padding: 50px 60px; box-shadow: 0 0 10px rgba(0,0,0,0.05); position: relative; }
        .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); opacity: 0.04; width: 70%; pointer-events: none; z-index: 0; }
        .header-content { position: relative; z-index: 1; }
        .logo-header { text-align: center; margin-bottom: 10px; }
        .logo-header img { height: 60px; }
        .main-title { text-align: center; margin-bottom: 25px; }
        .main-title .sub { font-size: 13px; font-weight: bold; color: #555; letter-spacing: 0.5px; }
        .main-title .main { font-size: 16px; font-weight: bold; letter-spacing: 0.5px; margin-top: 3px; }
        .meta-box { display: flex; background-color: #f7f7f5; border: 1px solid #c0c0c0; border-radius: 6px; padding: 15px 0; margin-bottom: 25px; }
        .meta-col { flex: 1; text-align: center; display: flex; flex-direction: column; justify-content: center; }
        .meta-col:not(:last-child) { border-right: 1px solid #d0d0d0; }
        .meta-item { margin: 6px 0; }
        .meta-label { font-size: 10px; font-weight: bold; color: #666; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 2px; }
        .meta-value { font-size: 14px; font-weight: bold; color: #111; }
        .divider { border-top: 2px solid #111; margin: 0 0 25px 0; }
        .section { display: flex; align-items: center; margin: 30px 0 15px 0; }
        .sec-badge { width: 24px; height: 24px; background-color: #222; color: #fff; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 12px; font-weight: bold; }
        .sec-title { font-weight: bold; font-size: 16px; margin-left: 12px; }
        .sec-line { flex-grow: 1; border-bottom: 1px solid #ccc; margin: 0 15px; }
        .sec-marks { font-size: 13px; color: #444; }
        .question { display: grid; grid-template-columns: 35px 1fr; padding: 15px 0; border-bottom: 1px solid #eaeaea; font-size: 14.5px; line-height: 1.6; }
        .question:last-child { border-bottom: none; }
        .q-num { font-weight: bold; }
        .mark-badge { display: inline-flex; justify-content: center; align-items: center; min-width: 18px; padding: 0 4px; height: 18px; background-color: #333; color: white; border-radius: 9px; font-size: 11px; font-weight: bold; margin-left: 8px; vertical-align: middle; }
    </style>
</head>
<body>
    <div class="page">
        <img src="logo1.png" class="watermark" alt="Watermark">
        <div class="header-content">
            <div class="logo-header"><img src="logo1.png" alt="Institution Logo"></div>
            <div class="main-title">
                <div class="sub">DAILY EXAMINATION</div>
                <div class="main">CHEMISTRY, MATHEMATICS & BIOLOGY</div>
            </div>
            <div class="meta-box">
                <div class="meta-col">
                    <div class="meta-item"><div class="meta-label">Date</div><div class="meta-value">18 / 04 / 2026</div></div>
                    <div class="meta-item"><div class="meta-label">Duration</div><div class="meta-value">30 minutes</div></div>
                </div>
                <div class="meta-col">
                    <div class="meta-item"><div class="meta-label">Set</div><div class="meta-value">B</div></div>
                    <div class="meta-item"><div class="meta-label">Max Marks</div><div class="meta-value">15</div></div>
                </div>
                <div class="meta-col">
                    <div class="meta-item"><div class="meta-label">Batch</div><div class="meta-value">B3</div></div>
                    <div class="meta-item"><div class="meta-label">Instructions</div><div class="meta-value">Attempt all questions</div></div>
                </div>
            </div>
            <div class="divider"></div>

            <div class="section">
                <div class="sec-badge">I</div><div class="sec-title">Chemistry</div><div class="sec-line"></div><div class="sec-marks">5 marks</div>
            </div>
            <div class="question">
                <div class="q-num">1.</div><div class="q-text">\\(5.85\\text{g NaCl}\\) is dissolved in \\(180\\text{g H}_2\\text{O}\\). Calculate the mole fraction of \\(\\text{NaCl}\\) and \\(\\text{H}_2\\text{O}\\)? <span class="mark-badge">2.5</span></div>
            </div>
            <div class="question">
                <div class="q-num">2.</div><div class="q-text">A \\(5\\text{M}\\) solution of \\(\\text{NaOH}\\) with volume \\(20\\text{ml}\\) is diluted to \\(1000\\text{ml}\\). Calculate its Molarity? <span class="mark-badge">1.5</span></div>
            </div>
            <div class="question">
                <div class="q-num">3.</div><div class="q-text">Aqueous solution of \\(\\text{NaOH}\\) has mass by volume percent \\(15\\). What does it mean? <span class="mark-badge">1</span></div>
            </div>

            <div class="section">
                <div class="sec-badge">II</div><div class="sec-title">Mathematics</div><div class="sec-line"></div><div class="sec-marks">5 marks</div>
            </div>
            <div class="question">
                <div class="q-num">4.</div><div class="q-text">Find the derivative of \\(f(x) = \\sin(\\sqrt{\\tan x})\\). <span class="mark-badge">1.5</span></div>
            </div>
            <div class="question">
                <div class="q-num">5.</div><div class="q-text">Find the derivative of \\(f(x) = \\tan(3^{\\sin x})\\). <span class="mark-badge">1.5</span></div>
            </div>
            <div class="question">
                <div class="q-num">6.</div><div class="q-text">Find \\(\\frac{dy}{dx}\\) if \\(x^2 + 3y = \\cos y\\). <span class="mark-badge">2</span></div>
            </div>

            <div class="section">
                <div class="sec-badge">III</div><div class="sec-title">Biology</div><div class="sec-line"></div><div class="sec-marks">5 marks</div>
            </div>
            <div class="question">
                <div class="q-num">7.</div><div class="q-text">Proximal end of stamen connected with _________ and _________. <span class="mark-badge">2</span></div>
            </div>
            <div class="question">
                <div class="q-num">8.</div><div class="q-text">What is sporogeneous tissue? <span class="mark-badge">2</span></div>
            </div>
            <div class="question">
                <div class="q-num">9.</div><div class="q-text">Stamen represent _________. <span class="mark-badge">1</span></div>
            </div>
        </div>
    </div>
</body>
</html>`;

export const DEFAULT_QP_PROMPT = `You are about to create daily exam question papers for [DATE] - 30 Minutes for 15 marks.

Each paper must have questions as given in the provided images.

There will be six question papers you have to create. Use the exact HTML structure provided in the template, retaining MathJax for LaTeX equations. Write the batch name along with the set letter.

Create six HTML entries for:
B1 - A
B2 - A
B3 - A
B1 - B
B2 - B
B3 - B

Make sure to allocate the right questions and you can change the marks if needed. Each subject must have 5, 5, 5 (total 15 marks).

Take insight from the file descriptions below:

file1: PHYSICS (for all class, set A, set B (change values))
B1, B2
B3

file2: Maths (for all class, set A, set B (similar question))
B1
B2, B3

file3: Bio (for all class, both sets)
B1, B2 - set A and B
B3 - set A and B`;