import jsPDF from 'jspdf';
import { StudentProgressRecord } from '../services/studyProgressService';
import { formatWhatsAppPhoneNumber } from './whatsappService';

/**
 * Generates and downloads a clean, multi-page vector PDF roster for any filtered student list.
 */
export function downloadRosterPDF(
  records: StudentProgressRecord[],
  title: string = 'STUDENT STUDY PROGRESS ROSTER REPORT',
  filters: { classFilter: string; mediumFilter: string; phoneFilter: string; searchQuery?: string }
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 10;
  let currentY = margin;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, currentY, pageWidth - margin * 2, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('AIMS ACADEMIC EVALUATION SYSTEMS', margin + 5, currentY + 8);

  doc.setFontSize(9);
  doc.setTextColor(129, 140, 248); // indigo-400
  doc.text(title, margin + 5, currentY + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // slate-300
  const metaText = `Class: ${filters.classFilter === 'ALL' ? 'All' : filters.classFilter} | Medium: ${filters.mediumFilter} | Phone: ${filters.phoneFilter}`;
  doc.text(metaText, pageWidth - margin - 5, currentY + 8, { align: 'right' });
  doc.text(`Total: ${records.length} Students | Date: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - margin - 5, currentY + 15, { align: 'right' });

  currentY += 26;

  // Table Columns Setup (Total width = 190mm)
  const columns = [
    { header: '#', width: 8, align: 'center' },
    { header: 'Adm No', width: 18, align: 'left' },
    { header: 'Student Name', width: 44, align: 'left' },
    { header: 'Class', width: 14, align: 'center' },
    { header: 'Medium', width: 18, align: 'center' },
    { header: 'Language', width: 20, align: 'center' },
    { header: 'Progress', width: 16, align: 'center' },
    { header: 'Phone Number', width: 28, align: 'left' },
    { header: 'WA Status', width: 24, align: 'center' },
  ];

  const drawTableHeader = (y: number) => {
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);

    let x = margin;
    columns.forEach(col => {
      let textX = x;
      if (col.align === 'center') textX = x + col.width / 2;
      if (col.align === 'right') textX = x + col.width;
      doc.text(col.header, textX, y + 4.8, { align: col.align as any });
      x += col.width;
    });

    return y + 7;
  };

  currentY = drawTableHeader(currentY);

  const rowHeight = 6.5;

  records.forEach((rec, idx) => {
    // Page overflow check
    if (currentY + rowHeight > pageHeight - 12) {
      doc.addPage();
      currentY = margin;
      currentY = drawTableHeader(currentY);
    }

    // Alternating Row Background
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(margin, currentY, pageWidth - margin * 2, rowHeight, 'F');
    }

    // Row border bottom
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(margin, currentY + rowHeight, pageWidth - margin, currentY + rowHeight);

    const formattedPhone = formatWhatsAppPhoneNumber(rec.phoneNumber) || 'Not Registered';
    let waStatus = 'Unsent';
    if (rec.whatsappSentAt) waStatus = 'Sent ✓';
    else if (rec.whatsappFailedAt) waStatus = 'Failed ❌';

    const rowData = [
      (idx + 1).toString(),
      rec.admissionNo,
      rec.studentName.length > 24 ? rec.studentName.slice(0, 22) + '..' : rec.studentName,
      rec.studentClass,
      rec.medium,
      rec.firstLanguage || 'Malayalam',
      `${rec.overallPercentage}%`,
      formattedPhone,
      waStatus
    ];

    let x = margin;
    rowData.forEach((text, i) => {
      const col = columns[i];
      let textX = x;
      if (col.align === 'center') textX = x + col.width / 2;
      if (col.align === 'right') textX = x + col.width;

      if (i === 6) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 185, 129); // emerald-600
      } else if (i === 7 && text === 'Not Registered') {
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(225, 29, 72); // rose-600
      } else if (i === 8 && text.includes('Sent')) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 185, 129);
      } else if (i === 8 && text.includes('Failed')) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(225, 29, 72);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42); // slate-900
      }

      doc.text(text, textX, currentY + 4.5, { align: col.align as any });
      x += col.width;
    });

    currentY += rowHeight;
  });

  // Footer Page Numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${totalPages} • AIMS Academic Evaluation Systems • aims-kondotty1.web.app`, pageWidth / 2, pageHeight - 5, { align: 'center' });
  }

  const fileName = `AIMS_Student_Roster_${filters.classFilter}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}

/**
 * Generates and downloads a clean printable PDF for students missing phone numbers with a blank handwriting space.
 */
export function downloadMissingNumbersPDF(
  records: StudentProgressRecord[],
  classFilter: string = 'ALL'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  let currentY = margin;

  // Header Banner
  doc.setFillColor(225, 29, 72); // rose-600
  doc.rect(margin, currentY, pageWidth - margin * 2, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('AIMS ACADEMIC EVALUATION SYSTEMS', margin + 5, currentY + 8);

  doc.setFontSize(9);
  doc.setTextColor(254, 205, 211); // rose-200
  doc.text('MISSING PHONE NUMBERS ROSTER REPORT', margin + 5, currentY + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`Class: ${classFilter === 'ALL' ? 'All Classes' : `Class ${classFilter}`}`, pageWidth - margin - 5, currentY + 8, { align: 'right' });
  doc.text(`Unregistered Count: ${records.length} Students | Date: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - margin - 5, currentY + 15, { align: 'right' });

  currentY += 26;

  // Columns: # (8), Adm No (18), Student Name (45), Class (14), Medium (18), Progress (16), Blank Phone Space (71)
  const columns = [
    { header: '#', width: 8, align: 'center' },
    { header: 'Adm No', width: 18, align: 'left' },
    { header: 'Student Name', width: 45, align: 'left' },
    { header: 'Class', width: 14, align: 'center' },
    { header: 'Medium', width: 18, align: 'center' },
    { header: 'Progress', width: 16, align: 'center' },
    { header: 'Parent Phone Number (Handwrite Here)', width: 71, align: 'left' },
  ];

  const drawTableHeader = (y: number) => {
    doc.setFillColor(30, 41, 59);
    doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);

    let x = margin;
    columns.forEach(col => {
      let textX = x;
      if (col.align === 'center') textX = x + col.width / 2;
      if (col.align === 'right') textX = x + col.width;
      doc.text(col.header, textX, y + 4.8, { align: col.align as any });
      x += col.width;
    });

    return y + 7;
  };

  currentY = drawTableHeader(currentY);

  const rowHeight = 7.5;

  records.forEach((rec, idx) => {
    if (currentY + rowHeight > pageHeight - 12) {
      doc.addPage();
      currentY = margin;
      currentY = drawTableHeader(currentY);
    }

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, currentY, pageWidth - margin * 2, rowHeight, 'F');
    }

    doc.setDrawColor(203, 213, 225);
    doc.line(margin, currentY + rowHeight, pageWidth - margin, currentY + rowHeight);

    const rowData = [
      (idx + 1).toString(),
      rec.admissionNo,
      rec.studentName.length > 25 ? rec.studentName.slice(0, 23) + '..' : rec.studentName,
      rec.studentClass,
      rec.medium,
      `${rec.overallPercentage}%`,
      '' // Blank for handwriting line
    ];

    let x = margin;
    rowData.forEach((text, i) => {
      const col = columns[i];
      let textX = x;
      if (col.align === 'center') textX = x + col.width / 2;
      if (col.align === 'right') textX = x + col.width;

      if (i === 5) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 185, 129);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
      }

      doc.text(text, textX, currentY + 5, { align: col.align as any });

      // Draw dashed line for handwriting phone number
      if (i === 6) {
        doc.setDrawColor(148, 163, 184);
        doc.setLineDashPattern([1, 1], 0);
        doc.line(x + 2, currentY + 5.5, x + col.width - 2, currentY + 5.5);
        doc.setLineDashPattern([], 0); // reset
      }

      x += col.width;
    });

    currentY += rowHeight;
  });

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${totalPages} • AIMS Missing Numbers Roster • aims-kondotty1.web.app`, pageWidth / 2, pageHeight - 5, { align: 'center' });
  }

  const fileName = `AIMS_Missing_Numbers_${classFilter}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
