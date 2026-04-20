export const QP_HTML_TEMPLATE = `<!DOCTYPE html>
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
                        <div class="question-text">\(5.85\text{g NaCl}\) is dissolved in \(180\text{g H}_2\text{O}\). Calculate the mole fraction of \(\text{NaCl}\) and \(\text{H}_2\text{O}\)?</div>
                        <div class="question-mark"><span class="mark-badge">2.5</span></div>
                    </div>
                    <div class="question-row">
                        <div class="question-num">2.</div>
                        <div class="question-text">A \(5\text{M}\) solution of \(\text{NaOH}\) with volume \(20\text{ml}\) is diluted to \(1000\text{ml}\). Calculate its Molarity?</div>
                        <div class="question-mark"><span class="mark-badge">1.5</span></div>
                    </div>
                    <div class="question-row">
                        <div class="question-num">3.</div>
                        <div class="question-text">Aqueous solution of \(\text{NaOH}\) has mass by volume percent \(15\). What does it mean?</div>
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
                        <div class="question-text">Find the derivative of \(f(x) = \sin(\sqrt{\tan x})\).</div>
                        <div class="question-mark"><span class="mark-badge">1.5</span></div>
                    </div>
                    <div class="question-row">
                        <div class="question-num">5.</div>
                        <div class="question-text">Find the derivative of \(f(x) = \tan(3^{\sin x})\).</div>
                        <div class="question-mark"><span class="mark-badge">1.5</span></div>
                    </div>
                    <div class="question-row">
                        <div class="question-num">6.</div>
                        <div class="question-text">Find \(\frac{dy}{dx}\) if \(x^2 + 3y = \cos y\).</div>
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
</html>`;