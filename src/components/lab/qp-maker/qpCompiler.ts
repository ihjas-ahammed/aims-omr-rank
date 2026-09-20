import { QpTemplate, DEFAULT_DART_TEMPLATES } from './defaultDartTemplates';
import { QPSection } from './types';

export interface CompileQpOptions {
  templateId: string;
  sections: QPSection[];
  batch?: string;
  setLabel?: string;
  date?: string;
  duration?: string;
  marks?: string;
  subtitle?: string;
  logoSrc?: string;
  assetSources?: Record<string, string>;
  scale?: number;
  duplicateForDuplex?: boolean;
  hideSet?: boolean;
  setCount?: number;
  twoColumn?: boolean;
  fontSize?: string;
  latexSize?: string;
  customHtml?: string;
  templates?: QpTemplate[];
}

export function processSetPlaceholder(
  filled: string,
  setLabel?: string,
  hideSet?: boolean,
  setCount?: number
): string {
  let shouldHide = hideSet;
  if (shouldHide === undefined) {
    const rawStr = String(setLabel || '').trim().toLowerCase();
    shouldHide = !setLabel || ['', 'none', 'null', 'default'].includes(rawStr) || (setCount !== undefined && setCount <= 1);
  }

  if (shouldHide) {
    const patterns = [
      /<div class="meta-item">\s*<span class="meta-label">Set:<\/span>\s*\{SET\}\s*<\/div>/gi,
      /<div class="info-field">\s*<span class="info-label">Set<\/span>\s*<span class="info-value">\{SET\}<\/span>\s*<\/div>/gi,
      /<div class="meta-item"[^>]*>\s*SET:\s*\{SET\}\s*<\/div>/gi,
      /<div>\s*SET:\s*\{SET\}\s*<\/div>/gi,
      /<div class="grid-cell">\s*<span class="label">SET:<\/span>\s*<span class="val">\{SET\}<\/span>\s*<\/div>/gi,
      /<div class="nordic-meta-item">\s*Set:\s*<strong>\{SET\}<\/strong>\s*<\/div>/gi,
      /<div class="cyber-cell">\s*<span>SET<\/span>\s*<strong>\{SET\}<\/strong>\s*<\/div>/gi,
      /<div class="meta-cell">\s*<span class="meta-label">Set:<\/span>\s*<span class="meta-val">\{SET\}<\/span>\s*<\/div>/gi,
      /<div class="meta-tag">\s*SET:\s*<strong>\{SET\}<\/strong>\s*<\/div>/gi,
      /<td>\s*Set:\s*<strong>\{SET\}<\/strong>\s*<\/td>/gi,
      /([•·|])\s*\{SET\}\s*([•·|])/gi,
      /<([a-zA-Z0-9]+)[^>]*>[^<]*\{SET\}[^<]*<\/\1>/gi
    ];
    for (const p of patterns) {
      filled = filled.replace(p, '');
    }
    filled = filled.replace(/\{SET\}/g, '');
  } else {
    let cleanVal = String(setLabel || '').replace(/^(?:set|set\s*:?)\s*/i, '').trim();
    if (!cleanVal) {
      cleanVal = String(setLabel || '').trim();
    }
    filled = filled.replace(/([•·|])\s*\{SET\}\s*([•·|])/gi, `$1 SET ${cleanVal} $2`);
    filled = filled.replace(/\{SET\}/g, cleanVal);
  }
  return filled;
}

export function getPageSheetRules(tid: string): string {
  const isA5 = String(tid || '').toLowerCase().startsWith('a5_');
  const pageSize = isA5 ? 'A5' : 'A4 portrait';
  const pageWidth = isA5 ? '148mm' : '210mm';
  const pageMinHeight = isA5 ? '210mm' : '297mm';

  return `<style id="qp-sheet-layout-rules">
  @page {
    size: ${pageSize};
    margin: 10mm 10mm 10mm 10mm;
  }
  @media screen {
    html {
      background-color: #f1f5f9;
      margin: 0;
      padding: 0;
      min-height: 100%;
    }
    body {
      background-color: #f1f5f9 !important;
      margin: 0 !important;
      padding: 24px 12px 60px 12px !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      min-height: 100vh !important;
      box-sizing: border-box !important;
    }
    .page, .paper-container, body > div.page, body > div.paper-container, body > div:first-child {
      background-color: #ffffff !important;
      width: ${pageWidth} !important;
      min-height: ${pageMinHeight} !important;
      max-width: 96vw !important;
      margin: 0 auto 24px auto !important;
      padding: 12mm 12mm 14mm 12mm !important;
      box-sizing: border-box !important;
      box-shadow: 0 4px 20px rgba(15, 23, 42, 0.12), 0 1px 4px rgba(15, 23, 42, 0.08) !important;
      border: 1px solid #cbd5e1 !important;
      border-radius: 2px !important;
      position: relative !important;
    }
  }
  @media print {
    html, body {
      background: transparent !important;
      padding: 0 !important;
      margin: 0 !important;
      display: block !important;
    }
    .page, .paper-container, body > div.page, body > div.paper-container, body > div:first-child {
      width: 100% !important;
      min-height: auto !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
      border: none !important;
    }
  }
</style>
`;
}

export function getTwoColumnRules(isTwoCol: boolean): string {
  if (!isTwoCol) return '';
  return `<style id="qp-two-column-rules">
  .sections-content-wrapper,
  .sections-content-wrapper.two-column-layout,
  .questions-columns,
  .content-columns,
  .two-column-layout .sections-content-wrapper {
    column-count: 2 !important;
    column-gap: 20px !important;
    column-fill: auto !important;
    column-rule: 1px solid #cbd5e1 !important;
    width: 100% !important;
    min-height: calc(297mm - 75mm) !important;
  }
  .question, .tech-q-row, .exec-q-row, .question-card, .apex-q-card, .question-row, .q-row, .question-box, .section-panel, .section-container, .section-tech, .executive-section, .editorial-section, .nordic-section, .cyber-section {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    margin-bottom: 8px !important;
    min-width: 0 !important;
    max-width: 100% !important;
  }
  .section-title, .section-title-wrap, .section-banner-tech, .section-banner, .executive-sec-header, .section-header-block, .apex-section-header, .section-head, .section-header-bar, .editorial-section-header, .nordic-sec-header, .cyber-banner {
    break-inside: avoid !important;
    break-after: avoid !important;
    page-break-inside: avoid !important;
    page-break-after: avoid !important;
    margin-top: 8px !important;
    margin-bottom: 4px !important;
    width: 100% !important;
  }
  @media print {
    .sections-content-wrapper,
    .sections-content-wrapper.two-column-layout,
    .questions-columns,
    .content-columns {
      column-count: 2 !important;
      column-gap: 18px !important;
      column-fill: auto !important;
      column-rule: 1px solid #cbd5e1 !important;
      min-height: auto !important;
    }
  }
</style>
`;
}

export function getFontSizeRules(fontSize?: string, latexSize?: string): string {
  if (!fontSize && !latexSize) return '';
  let fs = String(fontSize || '').trim();
  if (fs && !['px', 'pt', 'em', 'rem', '%'].some(u => fs.endsWith(u))) {
    fs = `${fs}pt`;
  }
  let ls = String(latexSize || '').trim();
  if (ls && !['px', 'pt', 'em', 'rem', '%'].some(u => ls.endsWith(u))) {
    ls = `${ls}pt`;
  }

  let css = '<style id="qp-font-size-rules">\n  :root {\n';
  if (fs) css += `    --qp-font-size: ${fs};\n`;
  if (ls) css += `    --qp-latex-size: ${ls};\n`;
  css += '  }\n';

  if (fs) {
    css += `  body, .page, .paper-container,
  .question-text, .q-body, .q-text, .tech-q-body, .exec-q-body, .apex-q-content,
  .question-box, .question-row, .question, .editorial-q-row, .nordic-q-row, .cyber-q-row,
  .question-text p, .q-body p, .q-text p, .question-text div, .q-body div,
  .question-text ol, .q-body ol, .q-text ol, .tech-q-body ol, .exec-q-body ol, .apex-q-content ol,
  .question-text ul, .q-body ul, .q-text ul,
  .question-text li, .q-body li, .q-text li, .tech-q-body li, .exec-q-body li, .apex-q-content li {
    font-size: var(--qp-font-size) !important;
  }
  .question-num, .q-num, .tech-q-num, .exec-q-num, .q-number-circle {
    font-size: var(--qp-font-size) !important;
  }
`;
  }

  if (ls) {
    css += `  mjx-container, .MathJax, .MathJax_Display, .mjx-chtml, mjx-math {
    font-size: var(--qp-latex-size) !important;
  }
  mjx-container[jax="CHTML"] {
    font-size: var(--qp-latex-size) !important;
  }
`;
  }
  css += '</style>\n';
  return css;
}

export function compileQpHtml(options: CompileQpOptions): string {
  const {
    templateId,
    sections,
    batch = 'B1',
    setLabel = 'Set A',
    date = new Date().toLocaleDateString('en-GB'),
    duration = '30',
    marks = '15',
    subtitle = 'Daily Examination',
    logoSrc = '/logo0.png',
    assetSources = {},
    scale = 1.0,
    duplicateForDuplex = false,
    hideSet,
    setCount,
    twoColumn = false,
    fontSize = '13px',
    latexSize = '100%',
    customHtml,
    templates = DEFAULT_DART_TEMPLATES
  } = options;

  const template = templates.find(t => t.id === templateId) || templates[0];
  const tid = template?.id || templateId;

  const sectionsHtmlParts: string[] = [];

  if (tid === 'default') {
    for (const sec of sections) {
      sectionsHtmlParts.push('<div class="section-container">\n');
      sectionsHtmlParts.push('  <div class="section-header-bar">\n');
      sectionsHtmlParts.push(`    <div class="section-badge-wrapper">${sec.badge || ''}</div>\n`);
      sectionsHtmlParts.push(`    <div class="section-title-wrapper">${sec.title || ''}</div>\n`);
      sectionsHtmlParts.push('  </div>\n');
      if (sec.instruction) {
        sectionsHtmlParts.push(`  <div class="section-instruction">${sec.instruction}</div>\n`);
      }
      sectionsHtmlParts.push('  <div class="questions-list">\n');
      for (const q of sec.questions || []) {
        sectionsHtmlParts.push('    <div class="question-row">\n');
        sectionsHtmlParts.push(`      <div class="question-num">${q.number || ''}.</div>\n`);
        sectionsHtmlParts.push(`      <div class="question-text">${q.text || ''}</div>\n`);
        sectionsHtmlParts.push(`      <div class="question-mark"><span class="mark-badge">${q.marks || ''}</span></div>\n`);
        sectionsHtmlParts.push('    </div>\n');
      }
      sectionsHtmlParts.push('  </div>\n');
      sectionsHtmlParts.push('</div>\n');
    }
  } else if (tid === 'modern') {
    for (const sec of sections) {
      const questions = sec.questions || [];
      const totalMarks = questions.reduce((sum, q) => sum + (parseInt(q.marks, 10) || 0), 0);
      sectionsHtmlParts.push('<div class="section-panel">\n');
      sectionsHtmlParts.push('  <div class="section-header">\n');
      sectionsHtmlParts.push('    <div class="section-header-left">\n');
      sectionsHtmlParts.push(`      <span class="section-roman">${sec.badge || ''}</span>\n`);
      sectionsHtmlParts.push(`      <span class="section-title">${sec.title || ''}</span>\n`);
      sectionsHtmlParts.push('    </div>\n');
      sectionsHtmlParts.push(`    <span class="marks-badge">${totalMarks} Marks</span>\n`);
      sectionsHtmlParts.push('  </div>\n');
      sectionsHtmlParts.push('  <div class="question-area">\n');
      questions.forEach((q, i) => {
        if (i > 0) sectionsHtmlParts.push('    <div class="section-divider"></div>\n');
        sectionsHtmlParts.push('    <div class="question-row">\n');
        sectionsHtmlParts.push(`      <div class="q-number-circle">${q.number || ''}</div>\n`);
        sectionsHtmlParts.push('      <div class="q-content">\n');
        sectionsHtmlParts.push(`        <span class="q-marks">${q.marks || ''}</span>\n`);
        sectionsHtmlParts.push(`        <div class="q-text">${q.text || ''}</div>\n`);
        sectionsHtmlParts.push('      </div>\n');
        sectionsHtmlParts.push('    </div>\n');
      });
      sectionsHtmlParts.push('  </div>\n');
      sectionsHtmlParts.push('</div>\n');
    }
  } else if (tid === 'elegant') {
    for (const sec of sections) {
      sectionsHtmlParts.push('<div class="section-title-wrap">\n');
      sectionsHtmlParts.push(`  <div class="section-title">${sec.badge || ''} &mdash; ${sec.title || ''}</div>\n`);
      if (sec.instruction) {
        sectionsHtmlParts.push(`  <div class="instructions">${sec.instruction}</div>\n`);
      }
      sectionsHtmlParts.push('</div>\n');
      for (const q of sec.questions || []) {
        sectionsHtmlParts.push('<div class="question">\n');
        sectionsHtmlParts.push(`  <div class="q-num">${q.number || ''}.</div>\n`);
        sectionsHtmlParts.push(`  <div class="q-body">${q.text || ''}</div>\n`);
        sectionsHtmlParts.push(`  <div class="q-marks">[${q.marks || ''}]</div>\n`);
        sectionsHtmlParts.push('</div>\n');
      }
    }
  } else if (tid === 'boxed') {
    for (const sec of sections) {
      sectionsHtmlParts.push(`<div class="section-head">${sec.badge || ''} &mdash; ${sec.title || ''}</div>\n`);
      if (sec.instruction) {
        sectionsHtmlParts.push(`<div style="font-size: 13px; font-style: italic; margin-bottom: 12px;">${sec.instruction}</div>\n`);
      }
      for (const q of sec.questions || []) {
        sectionsHtmlParts.push('<div class="question-box">\n');
        sectionsHtmlParts.push(`  <div class="q-top"><span>Question ${q.number || ''}</span><span>${q.marks || ''} Marks</span></div>\n`);
        sectionsHtmlParts.push(`  <div class="q-body">${q.text || ''}</div>\n`);
        sectionsHtmlParts.push('</div>\n');
      }
    }
  } else if (tid === 'tech_slate') {
    for (const sec of sections) {
      sectionsHtmlParts.push('<div class="section-tech">\n');
      sectionsHtmlParts.push('  <div class="section-banner">\n');
      sectionsHtmlParts.push(`    <div class="banner-badge">${sec.badge || ''}</div>\n`);
      sectionsHtmlParts.push(`    <div class="banner-title">${sec.title || ''}</div>\n`);
      sectionsHtmlParts.push('  </div>\n');
      if (sec.instruction) {
        sectionsHtmlParts.push(`  <div class="section-instruction">${sec.instruction}</div>\n`);
      }
      sectionsHtmlParts.push('  <div class="tech-questions">\n');
      for (const q of sec.questions || []) {
        sectionsHtmlParts.push('    <div class="tech-q-row">\n');
        sectionsHtmlParts.push(`      <div class="tech-q-num">Q.${q.number || ''}</div>\n`);
        sectionsHtmlParts.push(`      <div class="tech-q-body">${q.text || ''}</div>\n`);
        sectionsHtmlParts.push(`      <div class="tech-q-mark"><span>[${q.marks || ''} pts]</span></div>\n`);
        sectionsHtmlParts.push('    </div>\n');
      }
      sectionsHtmlParts.push('  </div>\n');
      sectionsHtmlParts.push('</div>\n');
    }
  } else if (tid === 'executive') {
    for (const sec of sections) {
      sectionsHtmlParts.push('<div class="executive-sec-header">\n');
      sectionsHtmlParts.push(`  <span class="executive-badge">${sec.badge || ''}</span>\n`);
      sectionsHtmlParts.push(`  <span class="executive-title">${sec.title || ''}</span>\n`);
      sectionsHtmlParts.push('</div>\n');
      if (sec.instruction) {
        sectionsHtmlParts.push(`  <div class="executive-instruction">${sec.instruction}</div>\n`);
      }
      for (const q of sec.questions || []) {
        sectionsHtmlParts.push('<div class="exec-q-row">\n');
        sectionsHtmlParts.push('  <div class="exec-q-meta">\n');
        sectionsHtmlParts.push(`    <span class="exec-q-num">Question ${q.number || ''}</span>\n`);
        sectionsHtmlParts.push(`    <span class="exec-q-marks">(${q.marks || ''} Marks)</span>\n`);
        sectionsHtmlParts.push('  </div>\n');
        sectionsHtmlParts.push(`  <div class="exec-q-body">${q.text || ''}</div>\n`);
        sectionsHtmlParts.push('</div>\n');
      }
    }
  } else if (tid === 'apex_journal') {
    for (const sec of sections) {
      sectionsHtmlParts.push('<div class="apex-section-header">\n');
      sectionsHtmlParts.push('  <div class="apex-sec-left">\n');
      sectionsHtmlParts.push(`    <span class="apex-sec-badge">${sec.badge || ''}</span>\n`);
      sectionsHtmlParts.push(`    <span class="apex-sec-title">${sec.title || ''}</span>\n`);
      sectionsHtmlParts.push('  </div>\n');
      sectionsHtmlParts.push('</div>\n');
      if (sec.instruction) {
        sectionsHtmlParts.push(`  <div class="apex-sec-instruction">${sec.instruction}</div>\n`);
      }
      for (const q of sec.questions || []) {
        sectionsHtmlParts.push('<div class="apex-q-card">\n');
        sectionsHtmlParts.push(`  <div class="apex-q-num">${q.number || ''}</div>\n`);
        sectionsHtmlParts.push(`  <div class="apex-q-content">${q.text || ''}</div>\n`);
        sectionsHtmlParts.push(`  <div class="apex-q-marks">[${q.marks || ''} M]</div>\n`);
        sectionsHtmlParts.push('</div>\n');
      }
    }
  } else if (tid === 'two_column') {
    for (const sec of sections) {
      const questions = sec.questions || [];
      const firstMark = questions[0]?.marks || '';
      const markText = firstMark ? `(${firstMark} Mark${firstMark !== '1' ? 's' : ''} Each)` : '';

      sectionsHtmlParts.push('<div class="section-header-block">\n');
      sectionsHtmlParts.push('  <div class="section-title">\n');
      sectionsHtmlParts.push('    <div class="section-title-left">\n');
      sectionsHtmlParts.push(`      <span class="section-title-badge">${sec.badge || ''}</span>\n`);
      if (sec.title) {
        sectionsHtmlParts.push(`      <span class="section-title-name">&mdash; ${sec.title}</span>\n`);
      }
      sectionsHtmlParts.push('    </div>\n');
      if (markText) {
        sectionsHtmlParts.push(`    <span class="section-title-marks">${markText}</span>\n`);
      }
      sectionsHtmlParts.push('  </div>\n');
      if (sec.instruction) {
        sectionsHtmlParts.push(`  <div class="section-instruction">${sec.instruction}</div>\n`);
      }
      sectionsHtmlParts.push('</div>\n');

      for (const q of questions) {
        sectionsHtmlParts.push('<div class="question-card">\n');
        sectionsHtmlParts.push(`  <p class="question-text"><span class="question-number">${q.number || ''}.</span> ${q.text || ''}</p>\n`);
        sectionsHtmlParts.push('</div>\n');
      }
    }
  } else {
    // Default fallback layout for editorial / nordic / cyber / a5 templates
    for (const sec of sections) {
      sectionsHtmlParts.push('<div class="section-container">\n');
      sectionsHtmlParts.push('  <div class="section-header-bar">\n');
      sectionsHtmlParts.push(`    <div class="section-badge-wrapper">${sec.badge || ''}</div>\n`);
      sectionsHtmlParts.push(`    <div class="section-title-wrapper">${sec.title || ''}</div>\n`);
      sectionsHtmlParts.push('  </div>\n');
      if (sec.instruction) {
        sectionsHtmlParts.push(`  <div class="section-instruction">${sec.instruction}</div>\n`);
      }
      sectionsHtmlParts.push('  <div class="questions-list">\n');
      for (const q of sec.questions || []) {
        sectionsHtmlParts.push('    <div class="question-row">\n');
        sectionsHtmlParts.push(`      <div class="question-num">${q.number || ''}.</div>\n`);
        sectionsHtmlParts.push(`      <div class="question-text">${q.text || ''}</div>\n`);
        sectionsHtmlParts.push(`      <div class="question-mark"><span class="mark-badge">${q.marks || ''}</span></div>\n`);
        sectionsHtmlParts.push('    </div>\n');
      }
      sectionsHtmlParts.push('  </div>\n');
      sectionsHtmlParts.push('</div>\n');
    }
  }

  const rawSectionsHtml = sectionsHtmlParts.join('');
  const isTwoCol = Boolean(twoColumn || tid === 'two_column');

  const templateBaseHtml = customHtml || template?.html || '';
  let sectionsHtml = rawSectionsHtml;
  if (isTwoCol && !templateBaseHtml.includes('sections-content-wrapper') && !templateBaseHtml.includes('questions-columns')) {
    sectionsHtml = `<div class="sections-content-wrapper two-column-layout">\n${rawSectionsHtml}\n</div>`;
  }

  let filled = templateBaseHtml;
  filled = filled.replace(/\{BATCH\}/g, batch || '');
  filled = filled.replace(/\{DATE\}/g, date || '');
  filled = filled.replace(/\{DURATION\}/g, String(duration || '30'));
  filled = filled.replace(/\{MAX_MARKS\}/g, String(marks || '15'));
  filled = filled.replace(/\{SUBTITLE\}/g, subtitle || 'Daily Examination');
  filled = processSetPlaceholder(filled, setLabel, hideSet, setCount);

  if (logoSrc) {
    filled = filled.replace(/logo1\.png/g, logoSrc);
  }

  // Replace embedded assets
  if (assetSources) {
    for (const [filename, base64Src] of Object.entries(assetSources)) {
      const dotIdx = filename.lastIndexOf('.');
      const baseName = dotIdx > 0 ? filename.slice(0, dotIdx) : filename;
      const ext = dotIdx > 0 ? filename.slice(dotIdx) : '';

      const escapedBase = baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const escapedExt = ext ? ext.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';
      const pattern = new RegExp(`(?:\\.?\\/)?${escapedBase}(?:\\s*${escapedExt})?(?=["'\\s/>]|$)`, 'gi');
      filled = filled.replace(pattern, base64Src);
    }
  }

  // Insert sections HTML
  const bodyStart = filled.indexOf('<body>');
  const placeholderPattern = /<!--\s*(?:AI|section|questions|content)[\s\S]*?-->/i;
  let finalHtml = filled;

  if (bodyStart !== -1) {
    const headPart = filled.slice(0, bodyStart);
    const bodyPart = filled.slice(bodyStart);
    const match = placeholderPattern.exec(bodyPart) || /<!--[\s\S]*?-->/.exec(bodyPart);
    if (match) {
      const newBody = bodyPart.slice(0, match.index) + sectionsHtml + bodyPart.slice(match.index + match[0].length);
      finalHtml = headPart + newBody;
    } else {
      finalHtml = filled.replace('</body>', `${sectionsHtml}\n</body>`);
    }
  } else {
    const match = placeholderPattern.exec(filled) || /<!--[\s\S]*?-->/.exec(filled);
    if (match) {
      finalHtml = filled.slice(0, match.index) + sectionsHtml + filled.slice(match.index + match[0].length);
    } else {
      finalHtml = filled + sectionsHtml;
    }
  }

  // Add styles to <head>
  const headEnd = finalHtml.indexOf('</head>');
  if (headEnd !== -1) {
    const zoomStyle = `<style>body { zoom: ${scale}; } @media print { .no-print { display: none !important; } }</style>\n`;
    const latexBreakRules = `<style id="qp-latex-break-rules">
  *, *::before, *::after { box-sizing: border-box; }
  p, div, span, .question-text, .q-body, .q-text, .tech-q-body, .exec-q-body, .apex-q-content {
    word-break: break-word !important;
    overflow-wrap: anywhere !important;
    word-wrap: break-word !important;
    min-width: 0 !important;
  }
  .question-text ol, .q-body ol, .q-text ol, .tech-q-body ol, .exec-q-body ol, .apex-q-content ol {
    margin: 4px 0 6px 20px !important;
    padding-left: 6px !important;
  }
  .question-text ol li, .q-body ol li, .q-text ol li, .tech-q-body ol li, .exec-q-body ol li, .apex-q-content ol li {
    margin-bottom: 2px !important;
    line-height: 1.4 !important;
  }
  mjx-container, .MathJax, .MathJax_Display, .mjx-chtml {
    display: inline !important;
    max-width: 100% !important;
    overflow: visible !important;
    overflow-x: visible !important;
    overflow-y: visible !important;
    white-space: normal !important;
    word-break: break-word !important;
    overflow-wrap: anywhere !important;
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }
  mjx-container::-webkit-scrollbar, .MathJax::-webkit-scrollbar, .MathJax_Display::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }
  mjx-container[jax="CHTML"][display="true"] {
    display: block !important;
    text-align: left !important;
    margin: 4px 0 !important;
    max-width: 100% !important;
    overflow: visible !important;
    white-space: normal !important;
  }
  mjx-math {
    white-space: normal !important;
    word-break: break-word !important;
    overflow-wrap: anywhere !important;
    display: inline !important;
  }
  mjx-mrow {
    white-space: normal !important;
    word-break: break-word !important;
    overflow-wrap: anywhere !important;
    display: inline !important;
    flex-wrap: wrap !important;
  }
  mjx-mo, mjx-mi, mjx-mn, mjx-mtext, mjx-texatom {
    white-space: normal !important;
    display: inline !important;
  }
</style>\n`;
    const sheetRules = getPageSheetRules(tid);
    const twoColRules = getTwoColumnRules(isTwoCol);
    const fontSizeRules = getFontSizeRules(fontSize, latexSize);

    finalHtml = finalHtml.slice(0, headEnd) + zoomStyle + sheetRules + fontSizeRules + latexBreakRules + twoColRules + finalHtml.slice(headEnd);
  }

  // MathJax calculation
  let mjScale = '0.95';
  if (latexSize) {
    const cleanLs = String(latexSize).trim();
    if (cleanLs.endsWith('%')) {
      const pct = parseFloat(cleanLs.slice(0, -1));
      if (!isNaN(pct)) mjScale = ((pct / 100.0) * 0.95).toFixed(2);
    }
  }

  const mathjaxBundle = `<script>
  window.MathJax = {
    tex: {
      inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
      displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
      processEscapes: true,
      processEnvironments: true
    },
    options: {
      skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
      enableMenu: false
    },
    chtml: {
      displayAlign: 'left',
      scale: ${mjScale},
      minScale: 0.7,
      matchFontHeight: true
    },
    svg: {
      scale: ${mjScale},
      minScale: 0.7,
      matchFontHeight: true
    },
    startup: {
      pageReady: () => {
        return MathJax.startup.defaultPageReady().then(() => {
          if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise();
          }
        });
      }
    }
  };
</script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>`;

  finalHtml = finalHtml.replace(/<script>\s*window\.MathJax\s*=[\s\S]*?<\/script>/gi, '');
  finalHtml = finalHtml.replace(/<script\s+id="MathJax-script"[\s\S]*?<\/script>/gi, '');

  const headIdx = finalHtml.indexOf('</head>');
  if (headIdx !== -1) {
    finalHtml = finalHtml.slice(0, headIdx) + mathjaxBundle + '\n</head>' + finalHtml.slice(headIdx + 7);
  }

  // Floating Print Button
  const printBtnHtml = `
<div class="no-print" style="position: fixed; bottom: 24px; right: 24px; z-index: 10000; display: flex; gap: 10px;">
  <button onclick="window.print()" style="padding: 12px 24px; font-family: 'Outfit', sans-serif; font-size: 11pt; font-weight: 800; color: #ffffff; background: linear-gradient(135deg, #1e3a8a, #3b82f6); border: none; border-radius: 50px; cursor: pointer; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4); transition: transform 0.2s, box-shadow 0.2s; display: flex; align-items: center; gap: 8px;">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 2px;">
      <polyline points="6 9 6 2 18 2 18 9"></polyline>
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
      <rect x="6" y="14" width="12" height="8"></rect>
    </svg>
    Print Paper
  </button>
</div>
</body>`;

  const bodyEnd = finalHtml.lastIndexOf('</body>');
  if (bodyEnd !== -1) {
    finalHtml = finalHtml.slice(0, bodyEnd) + printBtnHtml + finalHtml.slice(bodyEnd + 7);
  }

  if (duplicateForDuplex) {
    const bStart = finalHtml.indexOf('<body>');
    const bEnd = finalHtml.lastIndexOf('</body>');
    if (bStart !== -1 && bEnd !== -1) {
      const headPart = finalHtml.slice(0, bStart + 6);
      const bodyPart = finalHtml.slice(bStart + 6, bEnd);
      const tailPart = finalHtml.slice(bEnd);
      finalHtml = headPart + bodyPart + '\n<div class="page-break" style="page-break-before: always; break-before: page;"></div>\n' + bodyPart + tailPart;
    }
  }

  return finalHtml;
}

export function buildPreviewHtml(template: QpTemplate, options: Partial<CompileQpOptions> = {}): string {
  const {
    batch = 'B1',
    setLabel = 'Set A',
    date = new Date().toLocaleDateString('en-GB'),
    duration = '30',
    marks = '15',
    subtitle = 'Daily Examination',
    logoSrc = '/logo0.png',
    twoColumn = false,
    fontSize = '13px',
    latexSize = '100%',
    hideSet,
    setCount,
  } = options;

  let filled = template.html || '';
  filled = filled.replace(/\{BATCH\}/g, batch);
  filled = filled.replace(/\{DATE\}/g, date);
  filled = filled.replace(/\{DURATION\}/g, String(duration));
  filled = filled.replace(/\{MAX_MARKS\}/g, String(marks));
  filled = filled.replace(/\{SUBTITLE\}/g, subtitle);
  filled = processSetPlaceholder(filled, setLabel, hideSet, setCount);

  if (logoSrc) {
    filled = filled.replace(/logo1\.png/g, logoSrc);
  }

  let sampleContent = template.sample || '';
  const isTwoCol = Boolean(twoColumn || template.id === 'two_column');
  if (isTwoCol && !filled.includes('sections-content-wrapper') && !filled.includes('questions-columns')) {
    sampleContent = `<div class="sections-content-wrapper two-column-layout">\n${sampleContent}\n</div>`;
  }

  const placeholderPattern = /<!--\s*(?:AI|section|questions|content)[\s\S]*?-->/i;
  const bodyStart = filled.indexOf('<body>');
  let previewHtml = filled;

  if (bodyStart !== -1) {
    const headPart = filled.slice(0, bodyStart);
    const bodyPart = filled.slice(bodyStart);
    const match = placeholderPattern.exec(bodyPart) || /<!--[\s\S]*?-->/.exec(bodyPart);
    if (match) {
      previewHtml = headPart + bodyPart.slice(0, match.index) + sampleContent + bodyPart.slice(match.index + match[0].length);
    } else {
      previewHtml = filled.replace('</body>', `${sampleContent}\n</body>`);
    }
  } else {
    const match = placeholderPattern.exec(filled) || /<!--[\s\S]*?-->/.exec(filled);
    if (match) {
      previewHtml = filled.slice(0, match.index) + sampleContent + filled.slice(match.index + match[0].length);
    } else {
      previewHtml = filled + sampleContent;
    }
  }

  const headEnd = previewHtml.indexOf('</head>');
  if (headEnd !== -1) {
    const sheetRules = getPageSheetRules(template.id);
    const twoColRules = getTwoColumnRules(isTwoCol);
    const fontSizeRules = getFontSizeRules(fontSize, latexSize);

    previewHtml = previewHtml.slice(0, headEnd) + sheetRules + fontSizeRules + twoColRules + previewHtml.slice(headEnd);
  }

  const mathjaxBundle = `<script>
  window.MathJax = {
    tex: { inlineMath: [['$', '$'], ['\\\\(', '\\\\)']] },
    chtml: { displayAlign: 'left', scale: 0.95 }
  };
</script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>`;

  const headIdx = previewHtml.indexOf('</head>');
  if (headIdx !== -1) {
    previewHtml = previewHtml.slice(0, headIdx) + mathjaxBundle + '\n</head>' + previewHtml.slice(headIdx + 7);
  }

  return previewHtml;
}
