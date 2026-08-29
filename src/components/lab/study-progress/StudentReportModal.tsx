import React, { useState, useEffect, useRef } from 'react';
import { StudentProgressRecord } from '../../../services/studyProgressService';
import { getSubjectListForStudent } from '../../../data/studyProgressData';
import { 
  Download, 
  X, 
  Layers, 
  Moon, 
  Sun, 
  RefreshCw,
  FileCheck,
  CheckCircle,
  BookOpen,
  Award,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { sendReportViaWhatsAppCloudAPI, generateWhatsAppWebShareUrl, getExamDaysLeft } from '../../../utils/whatsappService';
import { updateStudentWhatsAppSent } from '../../../services/studyProgressService';

interface StudentReportModalProps {
  record: StudentProgressRecord;
  allRecords?: StudentProgressRecord[];
  onClose: () => void;
  onSelectStudent?: (record: StudentProgressRecord) => void;
}

export default function StudentReportModal({
  record,
  allRecords = [],
  onClose,
  onSelectStudent
}: StudentReportModalProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  // Default to subject-wise progress report (compact view requested by user)
  const [showFullChapters, setShowFullChapters] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSendingWA, setIsSendingWA] = useState<boolean>(false);
  const [waStatus, setWaStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const subjects = getSubjectListForStudent(record.firstLanguage);
  
  // Calculate aggregate stats for student
  let totalCheckedCheckpoints = 0;
  let totalPossibleCheckpoints = 0;
  let subjectsCompletedCount = 0;

  subjects.forEach(sub => {
    let subChecked = 0;
    let subTotal = 0;
    sub.chapters.forEach(ch => {
      const maxB = ch.totalBoxes || 1;
      subTotal += maxB;
      const entry = record.progress?.[ch.id] || { boxes: [false, false, false], timestamps: [null, null, null] };
      for (let i = 0; i < maxB; i++) {
        if (entry.boxes?.[i]) subChecked++;
      }
    });
    totalCheckedCheckpoints += subChecked;
    totalPossibleCheckpoints += subTotal;
    if (subTotal > 0 && subChecked === subTotal) {
      subjectsCompletedCount++;
    }
  });

  const overallPerc = record.overallPercentage || 0;

  // Preload logo helper
  const loadImage = (src: string): Promise<HTMLImageElement | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  };

  // Draw Report to Canvas and update Data URL with PRECISE HEIGHT (no extra spacing / cropping)
  const renderCanvas = async (): Promise<HTMLCanvasElement | null> => {
    const scale = 2; // 2x Retina Resolution
    const width = 1100;
    
    // First pass calculation for exact content height
    const subjectRowHeight = 60;
    let chaptersHeight = 0;
    
    if (showFullChapters) {
      subjects.forEach(s => {
        chaptersHeight += (s.chapters.length * 36) + 12;
      });
    }

    // Exact required height: Header (170) + Profile (120) + KPI (110) + Sub Header (60) + Rows + Footer (70)
    const exactRequiredHeight = 170 + 120 + 110 + 60 + (subjects.length * subjectRowHeight) + chaptersHeight + 70;
    const height = Math.ceil(exactRequiredHeight);

    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.scale(scale, scale);

    // Preload logos
    const logo1 = await loadImage('/logo1.png');
    const appIcon = await loadImage('/app_icon.png?v=2');

    const isDark = theme === 'dark';

    // Theme Colors
    const bgGradient = isDark ? ['#0b1329', '#070b19'] : ['#f8fafc', '#edf2f7'];
    const cardBg = isDark ? '#131d36' : '#ffffff';
    const cardBorder = isDark ? '#1e2d4a' : '#e2e8f0';
    const textPrimary = isDark ? '#ffffff' : '#0f172a';
    const textSecondary = isDark ? '#94a3b8' : '#475569';
    const textMuted = isDark ? '#64748b' : '#94a3b8';
    const accentIndigo = '#6366f1';
    const accentEmerald = '#10b981';

    // Helper: Draw Rounded Rect
    const drawRoundedRect = (
      x: number, y: number, w: number, h: number, r: number, fill?: string, stroke?: string, strokeWidth: number = 1
    ) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
      }
    };

    // 1. Main Background Gradient
    const gr = ctx.createLinearGradient(0, 0, 0, height);
    gr.addColorStop(0, bgGradient[0]);
    gr.addColorStop(1, bgGradient[1]);
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, width, height);

    // Decorative top accent border
    const topAccent = ctx.createLinearGradient(0, 0, width, 0);
    topAccent.addColorStop(0, '#6366f1');
    topAccent.addColorStop(0.5, '#10b981');
    topAccent.addColorStop(1, '#ec4899');
    ctx.fillStyle = topAccent;
    ctx.fillRect(0, 0, width, 6);

    let curY = 30;

    // 2. Header Box with Logos
    drawRoundedRect(35, curY, width - 70, 115, 18, cardBg, cardBorder, 1.5);

    // Logos drawing
    let logoOffset = 55;
    if (logo1) {
      drawRoundedRect(logoOffset, curY + 16, 130, 82, 12, '#ffffff', '#e2e8f0', 1);
      ctx.drawImage(logo1, logoOffset + 10, curY + 23, 110, 66);
      logoOffset += 148;
    } else if (appIcon) {
      ctx.drawImage(appIcon, logoOffset, curY + 18, 75, 75);
      logoOffset += 95;
    }

    // Title & Brand text
    ctx.fillStyle = accentIndigo;
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText('AIMS ACADEMIC EVALUATION & LEARNING SYSTEMS', logoOffset, curY + 38);

    ctx.fillStyle = textPrimary;
    ctx.font = '900 24px Inter, sans-serif';
    ctx.fillText('STUDENT STUDY PROGRESS REPORT', logoOffset, curY + 68);

    ctx.fillStyle = textSecondary;
    ctx.font = '500 12px Inter, sans-serif';
    ctx.fillText('Official Subject Wise Checkpoint Analytics Matrix', logoOffset, curY + 90);

    // Verified Badge
    const badgeX = width - 195;
    drawRoundedRect(badgeX, curY + 32, 140, 34, 10, isDark ? '#10b9811a' : '#ecfdf5', isDark ? '#10b98144' : '#a7f3d0', 1);
    ctx.fillStyle = accentEmerald;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText('✓ VERIFIED REPORT', badgeX + 15, curY + 53);

    curY += 130;

    // 3. Student Profile Info Card
    drawRoundedRect(35, curY, width - 70, 100, 16, cardBg, cardBorder, 1);

    const colW = (width - 110) / 4;

    // Student Name
    ctx.fillStyle = textMuted;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText('STUDENT NAME', 55, curY + 30);
    ctx.fillStyle = textPrimary;
    ctx.font = 'bold 17px Inter, sans-serif';
    ctx.fillText(record.studentName || 'N/A', 55, curY + 58);
    ctx.fillStyle = accentIndigo;
    ctx.font = '500 11px Inter, sans-serif';
    ctx.fillText(`Medium: ${record.medium || 'English'}`, 55, curY + 79);

    // Admission No
    ctx.fillStyle = textMuted;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText('ADMISSION NO', 55 + colW, curY + 30);
    ctx.fillStyle = textPrimary;
    ctx.font = 'bold 17px Inter, sans-serif';
    ctx.fillText(record.admissionNo || 'N/A', 55 + colW, curY + 58);
    ctx.fillStyle = textSecondary;
    ctx.font = '500 11px Inter, sans-serif';
    ctx.fillText(`Phone: ${record.phoneNumber || 'N/A'}`, 55 + colW, curY + 79);

    // Class
    ctx.fillStyle = textMuted;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText('CLASS / BATCH', 55 + colW * 2, curY + 30);
    ctx.fillStyle = textPrimary;
    ctx.font = 'bold 17px Inter, sans-serif';
    ctx.fillText(`Class ${record.studentClass || 'N/A'}`, 55 + colW * 2, curY + 58);
    ctx.fillStyle = textSecondary;
    ctx.font = '500 11px Inter, sans-serif';
    ctx.fillText(`Lang: ${record.firstLanguage || 'Malayalam'}`, 55 + colW * 2, curY + 79);

    // Date
    ctx.fillStyle = textMuted;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText('REPORT DATE', 55 + colW * 3, curY + 30);
    ctx.fillStyle = textPrimary;
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.fillText(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), 55 + colW * 3, curY + 58);

    curY += 115;

    // 4. KPI Metric Cards (3 Cards)
    const kpiW = (width - 110) / 3;

    // KPI 1: Overall Completion
    drawRoundedRect(35, curY, kpiW, 90, 14, cardBg, cardBorder, 1);
    ctx.fillStyle = textMuted;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText('OVERALL PROGRESS', 52, curY + 28);
    ctx.fillStyle = overallPerc === 100 ? accentEmerald : accentIndigo;
    ctx.font = '900 28px Inter, sans-serif';
    ctx.fillText(`${overallPerc}%`, 52, curY + 63);

    const gradeText = overallPerc >= 90 ? 'Grade A+' : overallPerc >= 75 ? 'Grade A' : overallPerc >= 50 ? 'Grade B' : 'In Progress';
    drawRoundedRect(52 + kpiW - 105, curY + 30, 85, 26, 8, isDark ? '#6366f122' : '#e0e7ff', isDark ? '#6366f144' : '#c7d2fe', 1);
    ctx.fillStyle = accentIndigo;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText(gradeText, 52 + kpiW - 95, curY + 47);

    // KPI 2: Ticked Checkpoints
    drawRoundedRect(35 + kpiW + 20, curY, kpiW, 90, 14, cardBg, cardBorder, 1);
    ctx.fillStyle = textMuted;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText('CHECKPOINTS TICKED', 52 + kpiW + 20, curY + 28);
    ctx.fillStyle = textPrimary;
    ctx.font = '900 28px Inter, sans-serif';
    ctx.fillText(`${totalCheckedCheckpoints}`, 52 + kpiW + 20, curY + 63);
    ctx.fillStyle = textSecondary;
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.fillText(`/ ${totalPossibleCheckpoints} Ticked`, 52 + kpiW + 60 + (totalCheckedCheckpoints.toString().length * 16), curY + 63);

    // KPI 3: Subjects Mastered
    drawRoundedRect(35 + (kpiW + 20) * 2, curY, kpiW, 90, 14, cardBg, cardBorder, 1);
    ctx.fillStyle = textMuted;
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText('SUBJECTS COMPLETED', 52 + (kpiW + 20) * 2, curY + 28);
    ctx.fillStyle = accentEmerald;
    ctx.font = '900 28px Inter, sans-serif';
    ctx.fillText(`${subjectsCompletedCount}`, 52 + (kpiW + 20) * 2, curY + 63);
    ctx.fillStyle = textSecondary;
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.fillText(`/ ${subjects.length} Subjects`, 52 + (kpiW + 20) * 2 + 32, curY + 63);

    curY += 110;

    // 5. Subject Wise Progress Header & Table
    ctx.fillStyle = textPrimary;
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.fillText('SUBJECT WISE PROGRESS MATRIX', 35, curY + 12);

    curY += 24;

    // Table Header Bar
    drawRoundedRect(35, curY, width - 70, 36, 8, isDark ? '#1e293b' : '#cbd5e1');
    ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText('CODE', 55, curY + 22);
    ctx.fillText('SUBJECT NAME', 135, curY + 22);
    ctx.fillText('PROGRESS BAR', 440, curY + 22);
    ctx.fillText('CHECKPOINTS', 740, curY + 22);
    ctx.fillText('PERCENT', 930, curY + 22);

    curY += 44;

    // Render Each Subject Row (COMPACT SUBJECT-WISE FOCUS)
    subjects.forEach((subject) => {
      const isMalayalam = record.medium === 'Malayalam';
      const subName = isMalayalam ? subject.nameMl : subject.nameEn;
      const subPerc = record.subjectPercentages?.[subject.id] || 0;

      let checkedInSub = 0;
      let totalInSub = 0;
      subject.chapters.forEach(ch => {
        const maxB = ch.totalBoxes || 1;
        totalInSub += maxB;
        const entry = record.progress?.[ch.id] || { boxes: [false, false, false], timestamps: [null, null, null] };
        for (let i = 0; i < maxB; i++) {
          if (entry.boxes?.[i]) checkedInSub++;
        }
      });

      // Subject Row Card
      drawRoundedRect(35, curY, width - 70, 52, 10, cardBg, cardBorder, 1);

      // Subject Code Badge
      const subBadgeColor = subPerc === 100 ? '#10b98122' : subPerc > 0 ? '#6366f122' : isDark ? '#33415544' : '#f1f5f9';
      const subBadgeBorder = subPerc === 100 ? accentEmerald : subPerc > 0 ? accentIndigo : textMuted;
      drawRoundedRect(48, curY + 10, 65, 32, 7, subBadgeColor, subBadgeBorder, 1);
      ctx.fillStyle = subPerc === 100 ? accentEmerald : subPerc > 0 ? accentIndigo : textSecondary;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText(subject.code, 62, curY + 30);

      // Subject Name
      ctx.fillStyle = textPrimary;
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText(subName, 135, curY + 31);

      // Progress Bar
      const barX = 440;
      const barW = 270;
      const barH = 12;
      const barY = curY + 20;
      drawRoundedRect(barX, barY, barW, barH, 6, isDark ? '#0f172a' : '#e2e8f0');

      if (subPerc > 0) {
        const fillW = Math.max(12, (barW * subPerc) / 100);
        const barGradient = ctx.createLinearGradient(barX, 0, barX + fillW, 0);
        if (subPerc === 100) {
          barGradient.addColorStop(0, '#10b981');
          barGradient.addColorStop(1, '#34d399');
        } else {
          barGradient.addColorStop(0, '#6366f1');
          barGradient.addColorStop(1, '#818cf8');
        }
        drawRoundedRect(barX, barY, fillW, barH, 6, barGradient as any);
      }

      // Checkpoints Count Text
      ctx.fillStyle = textSecondary;
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.fillText(`${checkedInSub} / ${totalInSub}`, 750, curY + 31);

      // Percentage Text
      const percPillColor = subPerc === 100 ? accentEmerald : subPerc > 0 ? accentIndigo : textMuted;
      ctx.fillStyle = percPillColor;
      ctx.font = '900 15px Inter, sans-serif';
      ctx.fillText(`${subPerc}%`, 930, curY + 31);

      curY += 60;

      // Optional Chapter Detail View
      if (showFullChapters) {
        subject.chapters.forEach((ch) => {
          const entry = record.progress?.[ch.id] || { boxes: [false, false, false], timestamps: [null, null, null] };
          const boxes = entry.boxes;
          const timestamps = entry.timestamps;
          const chTitle = isMalayalam ? ch.titleMl : ch.titleEn;
          const maxB = ch.totalBoxes || 1;

          drawRoundedRect(55, curY, width - 110, 30, 7, isDark ? '#0b1329' : '#f1f5f9', isDark ? '#1e293b' : '#e2e8f0', 0.8);

          ctx.fillStyle = textPrimary;
          ctx.font = '500 11px Inter, sans-serif';
          ctx.fillText(`Ch ${ch.chapterNumber}: ${chTitle}`, 70, curY + 19);

          let boxX = 660;
          for (let bIdx = 0; bIdx < maxB; bIdx++) {
            const isChecked = boxes[bIdx];
            const boxColor = isChecked ? accentEmerald : (isDark ? '#1e293b' : '#cbd5e1');
            drawRoundedRect(boxX, curY + 6, 16, 16, 4, boxColor);

            if (isChecked) {
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 10px Inter, sans-serif';
              ctx.fillText('✓', boxX + 3, curY + 18);
            }

            boxX += 24;
          }

          const lastTs = timestamps.filter(Boolean).pop();
          if (lastTs) {
            ctx.fillStyle = textMuted;
            ctx.font = '400 10px Inter, sans-serif';
            const dateStr = new Date(lastTs).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
            ctx.fillText(`Completed ${dateStr}`, width - 200, curY + 19);
          } else {
            ctx.fillStyle = textMuted;
            ctx.font = '400 10px Inter, sans-serif';
            ctx.fillText('Pending', width - 160, curY + 19);
          }

          curY += 34;
        });

        curY += 8;
      }
    });

    curY += 15;

    // 6. Footer Stamp & Watermark (PERFECTLY BOUNDED)
    ctx.strokeStyle = cardBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(35, curY);
    ctx.lineTo(width - 35, curY);
    ctx.stroke();

    curY += 22;

    ctx.fillStyle = textMuted;
    ctx.font = '500 11px Inter, sans-serif';
    ctx.fillText(`Generated by AIMS Plus Lab Study Progress Engine • ${new Date().toLocaleString('en-GB')}`, 35, curY);

    ctx.fillStyle = textMuted;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText(`Student ID: ${record.admissionNo} • Verified Report Card`, width - 360, curY);

    return canvas;
  };

  // Re-generate preview whenever theme or options change
  useEffect(() => {
    let isMounted = true;
    const generatePreview = async () => {
      setIsGenerating(true);
      const canvas = await renderCanvas();
      if (canvas && isMounted) {
        canvasRef.current = canvas;
        setPreviewDataUrl(canvas.toDataURL('image/png'));
      }
      if (isMounted) setIsGenerating(false);
    };
    generatePreview();
    return () => { isMounted = false; };
  }, [record, theme, showFullChapters]);

  // Handle Download PNG
  const handleDownloadPNG = async () => {
    setIsGenerating(true);
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = await renderCanvas();
    }
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const safeName = (record.studentName || 'Student').replace(/[^a-zA-Z0-9_\-]/g, '_');
      const safeAdm = (record.admissionNo || 'Record').replace(/[^a-zA-Z0-9_\-]/g, '_');
      const filename = `AIMS_Study_Report_${safeName}_${safeAdm}.png`;

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setIsGenerating(false);
  };

  // Handle WhatsApp API Send
  const handleSendWhatsApp = async () => {
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = await renderCanvas();
    }
    if (!canvas) return;

    setIsSendingWA(true);
    setWaStatus(null);

    const res = await sendReportViaWhatsAppCloudAPI(record, canvas);
    setIsSendingWA(false);

    if (res.success) {
      setWaStatus({ success: true, message: res.message });
      await updateStudentWhatsAppSent(record.id || record.admissionNo, new Date().toISOString());
    } else {
      setWaStatus({ success: false, message: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl max-w-4xl w-full p-3 sm:p-5 md:p-6 shadow-2xl text-white space-y-3.5 my-auto max-h-[95vh] flex flex-col">
        {/* Modal Top Navigation Bar (Mobile Optimized) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
                <FileCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                Student Wise Study Report
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Subject progress card with official AIMS logo
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-between sm:justify-end">
            {/* Student Switcher Dropdown */}
            {allRecords.length > 1 && onSelectStudent && (
              <select
                value={record.id}
                onChange={(e) => {
                  const target = allRecords.find(r => r.id === e.target.value);
                  if (target) onSelectStudent(target);
                }}
                className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer max-w-[150px] sm:max-w-none truncate"
              >
                {allRecords.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.studentName} ({r.admissionNo})
                  </option>
                ))}
              </select>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
              <span className="hidden xs:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>

            {/* WhatsApp Direct Send Button */}
            <button
              onClick={handleSendWhatsApp}
              disabled={isSendingWA}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
              title="Send Scorecard directly to Student's WhatsApp"
            >
              {isSendingWA ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5 fill-current" />}
              <span>{isSendingWA ? 'Sending...' : 'Send WhatsApp'}</span>
            </button>

            {/* Compact vs Detailed Toggle */}
            <button
              onClick={() => setShowFullChapters(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                showFullChapters 
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {showFullChapters ? 'Subject Only' : '+ Chapters'}
            </button>

            {/* Download PNG Button */}
            <button
              onClick={handleDownloadPNG}
              disabled={isGenerating}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isGenerating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Download PNG</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Report Image Preview Container */}
        <div className="flex-1 overflow-y-auto bg-slate-950/90 rounded-xl sm:rounded-2xl border border-slate-800/80 p-2 sm:p-4 flex flex-col items-center justify-start min-h-[280px]">
          {isGenerating && !previewDataUrl ? (
            <div className="my-auto py-12 text-center text-slate-400 space-y-2.5">
              <RefreshCw className="w-7 h-7 animate-spin mx-auto text-emerald-500" />
              <p className="text-xs font-semibold">Generating subject-wise study report...</p>
            </div>
          ) : (
            <div className="w-full flex justify-center py-1">
              <img
                src={previewDataUrl}
                alt={`Study Report for ${record.studentName}`}
                className="max-w-full h-auto rounded-xl shadow-2xl border border-slate-800/90 object-contain"
                style={{ maxHeight: '65vh' }}
              />
            </div>
          )}
        </div>

        {/* Modal Bottom Status Bar (Mobile Optimized) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1 text-xs text-slate-400 border-t border-slate-800/80 shrink-0">
          <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
            <span className="font-semibold text-white">{record.studentName}</span>
            <span>•</span>
            <span>Adm: <code className="text-indigo-300 font-mono">{record.admissionNo}</code></span>
            <span>•</span>
            <span>Class: <code className="text-emerald-300 font-mono">{record.studentClass}</code></span>
            <span>•</span>
            <span>Overall: <strong className="text-indigo-400">{record.overallPercentage}%</strong></span>
          </div>

          <div className="w-full sm:w-auto flex items-center justify-end gap-2">
            <button
              onClick={handleDownloadPNG}
              disabled={isGenerating}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" /> Save PNG Report Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateOffscreenReportCanvas(
  record: StudentProgressRecord,
  theme: 'dark' | 'light' = 'dark'
): Promise<HTMLCanvasElement> {
  const width = 1000;
  const height = 1350;
  const daysLeft = getExamDaysLeft();
  const subjects = getSubjectListForStudent(record.firstLanguage);

  let totalPossibleCheckpoints = 0;
  let totalCheckedCheckpoints = 0;
  let subjectsCompletedCount = 0;

  subjects.forEach(sub => {
    let subChecked = 0;
    let subTotal = 0;
    sub.chapters.forEach(ch => {
      const maxB = ch.totalBoxes || 1;
      subTotal += maxB;
      const b = record.progress?.[ch.id]?.boxes || [false, false, false];
      for (let i = 0; i < maxB; i++) {
        if (b[i]) subChecked++;
      }
    });
    totalPossibleCheckpoints += subTotal;
    totalCheckedCheckpoints += subChecked;
    if (subTotal > 0 && subChecked === subTotal) {
      subjectsCompletedCount++;
    }
  });

  const overallPct = record.overallPercentage || 0;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const loadImage = (src: string): Promise<HTMLImageElement | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  };

  const logo1 = await loadImage('/logo1.png');
  const appIcon = await loadImage('/app_icon.png?v=2');

  const bgCard = '#1e293b';
  const borderCard = '#334155';
  const accentBlue = '#0284c7';
  const accentEmerald = '#10b981';
  const accentAmber = '#f59e0b';
  const accentIndigo = '#6366f1';
  const textWhite = '#ffffff';
  const textMuted = '#94a3b8';

  const drawRoundedRect = (
    x: number, y: number, w: number, h: number, r: number, fill?: string, stroke?: string, strokeWidth: number = 1
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }
  };

  // 1. Canvas Background (#0f172a)
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, height);

  let curY = 30;

  // 2. WHITE HEADER CARD (Matching send_real_scorecard.py)
  drawRoundedRect(35, curY, width - 70, 130, 20, '#ffffff', '#e2e8f0', 2);

  let logoOffset = 65;
  if (logo1) {
    ctx.drawImage(logo1, 55, curY + 12, 150, 105);
    logoOffset = 225;
  } else if (appIcon) {
    ctx.drawImage(appIcon, 55, curY + 25, 80, 80);
    logoOffset = 155;
  }

  ctx.fillStyle = accentBlue;
  ctx.font = 'bold 14px Inter, sans-serif';
  ctx.fillText('AIMS ACADEMIC EVALUATION SYSTEMS', logoOffset, curY + 38);

  ctx.fillStyle = '#0f172a';
  ctx.font = '900 26px Inter, sans-serif';
  ctx.fillText('STUDENT STUDY PROGRESS REPORT', logoOffset, curY + 72);

  ctx.fillStyle = '#475569';
  ctx.font = '600 14px Inter, sans-serif';
  ctx.fillText(`MISSION SUCCESS MATRIX • EXAM IN ${daysLeft} DAYS`, logoOffset, curY + 102);

  curY += 150;

  // 3. Student Info Card
  drawRoundedRect(35, curY, width - 70, 130, 20, bgCard, borderCard, 2);

  // Column 1: Student Name
  ctx.fillStyle = textMuted;
  ctx.font = 'bold 14px Inter, sans-serif';
  ctx.fillText('STUDENT NAME', 65, curY + 35);
  ctx.fillStyle = textWhite;
  ctx.font = 'bold 24px Inter, sans-serif';
  ctx.fillText((record.studentName || 'N/A').toUpperCase(), 65, curY + 68);
  ctx.fillStyle = '#a5b4fc';
  ctx.font = '500 16px Inter, sans-serif';
  ctx.fillText(`Medium: ${record.medium || 'English'} Medium`, 65, curY + 100);

  // Column 2: Admission No
  ctx.fillStyle = textMuted;
  ctx.font = 'bold 14px Inter, sans-serif';
  ctx.fillText('ADMISSION NO', 420, curY + 35);
  ctx.fillStyle = textWhite;
  ctx.font = 'bold 24px Inter, sans-serif';
  ctx.fillText(record.admissionNo || 'N/A', 420, curY + 68);
  ctx.fillStyle = textWhite;
  ctx.font = '500 16px Inter, sans-serif';
  ctx.fillText(`Class: Batch ${record.studentClass || 'N/A'}`, 420, curY + 100);

  // Column 3: First Language
  ctx.fillStyle = textMuted;
  ctx.font = 'bold 14px Inter, sans-serif';
  ctx.fillText('FIRST LANGUAGE', 720, curY + 35);
  ctx.fillStyle = textWhite;
  ctx.font = 'bold 24px Inter, sans-serif';
  ctx.fillText(record.firstLanguage || 'Malayalam', 720, curY + 68);
  ctx.fillStyle = accentAmber;
  ctx.font = 'bold 16px Inter, sans-serif';
  ctx.fillText(`Exam Target: ${daysLeft} Days Left`, 720, curY + 100);

  curY += 155;

  // 4. Overall Completion KPI Card
  drawRoundedRect(35, curY, width - 70, 135, 20, '#312e81', '#6366f1', 2);

  ctx.fillStyle = '#c7d2fe';
  ctx.font = 'bold 14px Inter, sans-serif';
  ctx.fillText('MISSION SUCCESS - OVERALL PROGRESS COMPLETION', 65, curY + 35);

  ctx.fillStyle = textWhite;
  ctx.font = '900 48px Inter, sans-serif';
  ctx.fillText(`${overallPct}%`, 65, curY + 88);

  ctx.fillStyle = '#e0e7ff';
  ctx.font = '600 16px Inter, sans-serif';
  ctx.fillText(`${totalCheckedCheckpoints} of ${totalPossibleCheckpoints} Checkpoints Ticked • Only ${daysLeft} Days Left For Exam!`, 220, curY + 75);

  // KPI Progress Bar
  const kpiBarW = width - 130;
  drawRoundedRect(65, curY + 105, kpiBarW, 14, 7, '#1e1b4b');
  if (overallPct > 0) {
    const fillW = Math.max(14, Math.round(kpiBarW * (overallPct / 100)));
    drawRoundedRect(65, curY + 105, fillW, 14, 7, accentEmerald);
  }

  curY += 165;

  // 5. Subject Breakdown Section Title
  ctx.fillStyle = textWhite;
  ctx.font = 'bold 22px Inter, sans-serif';
  ctx.fillText('SUBJECT-WISE PROGRESS BREAKDOWN', 35, curY);

  curY += 25;

  // Render Subjects List
  subjects.forEach(sub => {
    let subChecked = 0;
    let subTotal = 0;
    sub.chapters.forEach(ch => {
      const maxB = ch.totalBoxes || 1;
      subTotal += maxB;
      const b = record.progress?.[ch.id]?.boxes || [false, false, false];
      for (let i = 0; i < maxB; i++) {
        if (b[i]) subChecked++;
      }
    });

    const pct = subTotal > 0 ? Math.round((subChecked / subTotal) * 100) : 0;
    const isMalayalam = record.medium === 'Malayalam';
    const subTitle = isMalayalam ? sub.nameMl : sub.nameEn;
    const statusText = pct === 100 ? `Fully Ticked (${subChecked}/${subTotal})` : `In Progress (${subChecked}/${subTotal})`;
    const subColor = pct === 100 ? accentEmerald : pct >= 50 ? accentIndigo : accentAmber;

    drawRoundedRect(35, curY, width - 70, 80, 16, bgCard, borderCard, 1);

    ctx.fillStyle = textWhite;
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillText(`${subTitle} (${sub.code})`, 65, curY + 32);

    ctx.fillStyle = textMuted;
    ctx.font = '500 14px Inter, sans-serif';
    ctx.fillText(statusText, 660, curY + 32);

    ctx.fillStyle = subColor;
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillText(`${pct}%`, width - 120, curY + 32);

    // Subject Progress bar
    const barW = width - 130;
    drawRoundedRect(65, curY + 50, barW, 12, 6, '#0f172a');
    if (pct > 0) {
      const fillW = Math.max(12, Math.round(barW * (pct / 100)));
      drawRoundedRect(65, curY + 50, fillW, 12, 6, subColor);
    }

    curY += 92;
  });

  // Footer
  ctx.strokeStyle = borderCard;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(35, height - 55);
  ctx.lineTo(width - 35, height - 55);
  ctx.stroke();

  ctx.fillStyle = textMuted;
  ctx.font = '500 13px Inter, sans-serif';
  ctx.fillText('Generated by AIMS Group of Institutions • Verification: aims-kondotty1.web.app', 35, height - 30);

  ctx.fillStyle = accentBlue;
  ctx.font = 'bold 13px Inter, sans-serif';
  ctx.fillText('Official Verified Report', width - 200, height - 30);

  return canvas;
}
