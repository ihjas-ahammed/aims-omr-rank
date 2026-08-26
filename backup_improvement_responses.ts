import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

const firebaseConfig = {
  apiKey: "AIzaSyA88qBFpFuxgZTOmE5qRCzaAYqcQlPRRoA",
  authDomain: "aims-kondotty1.firebaseapp.com",
  projectId: "aims-kondotty1",
  storageBucket: "aims-kondotty1.firebasestorage.app",
  messagingSenderId: "613707197972",
  appId: "1:613707197972:web:98ee168875b8d76d78c101"
};

async function backup() {
  console.log('Connecting to Firebase...');
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log('Fetching improvement_responses from Firestore...');
  const snapshot = await getDocs(collection(db, 'improvement_responses'));
  console.log(`Found ${snapshot.docs.length} documents.`);

  const responses = snapshot.docs.map(doc => {
    const data = doc.data();
    let submittedAtStr = 'N/A';
    if (data.submittedAt) {
      try {
        submittedAtStr = data.submittedAt.toDate().toISOString();
      } catch (e) {
        submittedAtStr = String(data.submittedAt);
      }
    }
    return {
      id: doc.id,
      ...data,
      submittedAt: submittedAtStr
    };
  });

  // Save JSON backup as well
  const jsonBackupPath = path.join(process.cwd(), `backup_improvement_responses_${new Date().toISOString().slice(0, 10)}.json`);
  fs.writeFileSync(jsonBackupPath, JSON.stringify(responses, null, 2));
  console.log(`JSON backup saved to: ${jsonBackupPath}`);

  // Create Excel file
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Improvement Responses Backup');

  worksheet.addRow(['AIMS Plus Improvement Responses Backup']);
  worksheet.mergeCells('A1:O1');
  const titleCell = worksheet.getCell('A1');
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF7C3AED' }
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 40;

  worksheet.addRow([
    `Exported: ${new Date().toLocaleString()}`, 
    `Total Records: ${responses.length}`,
    'Backup before reset'
  ]);
  worksheet.mergeCells('A2:O2');
  const subtitleCell = worksheet.getCell('A2');
  subtitleCell.font = { name: 'Arial', size: 10, italic: true };
  subtitleCell.alignment = { vertical: 'middle', horizontal: 'left' };
  worksheet.getRow(2).height = 20;

  const headerRowData = [
    'No.', 
    'Document ID',
    'Student Name', 
    'Batch', 
    'English (100)', 
    'Language (100)', 
    'Physics (80)', 
    'Chemistry (80)', 
    'Mathematics (80)', 
    'Elective (80)', 
    'Elective Type',
    'Total Score (520)', 
    'Improvement Subjects', 
    'Wants Night Class / Entrance', 
    'Preferred Entrance', 
    'Submission Date'
  ];
  worksheet.addRow(headerRowData);

  const headerRow = worksheet.getRow(3);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF1F2937' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' }
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      bottom: { style: 'medium', color: { argb: 'FF9CA3AF' } },
      left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  responses.forEach((r: any, idx) => {
    const rowData = [
      idx + 1,
      r.id,
      r.name || '',
      r.batch || '',
      r.scores?.english ?? '',
      r.scores?.language ?? '',
      r.scores?.physics ?? '',
      r.scores?.chemistry ?? '',
      r.scores?.mathematics ?? '',
      r.scores?.sixthSubjectScore ?? '',
      r.scores?.sixthSubjectType === 'Biology' ? 'Biology' : (r.scores?.sixthSubjectType || ''),
      r.totalScore ?? '',
      r.improvementSubjects && Array.isArray(r.improvementSubjects) ? r.improvementSubjects.join(', ') : '',
      r.wantsEntranceExams ? 'Yes' : 'No',
      r.preferredEntranceExams && Array.isArray(r.preferredEntranceExams) ? r.preferredEntranceExams.join(', ') : '',
      r.submittedAt || ''
    ];
    worksheet.addRow(rowData);
    const row = worksheet.getRow(4 + idx);
    row.height = 20;
    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Arial', size: 9 };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFF3F4F6' } },
        bottom: { style: 'thin', color: { argb: 'FFF3F4F6' } },
        left: { style: 'thin', color: { argb: 'FFF3F4F6' } },
        right: { style: 'thin', color: { argb: 'FFF3F4F6' } }
      };
      if ([2, 3, 13, 15].includes(colNumber)) {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    });
  });

  worksheet.columns.forEach((column) => {
    let maxLen = 0;
    column.eachCell!({ includeEmpty: true }, (cell, rowNum) => {
      if (rowNum > 2 && cell.value) {
        const len = String(cell.value).length;
        if (len > maxLen) maxLen = len;
      }
    });
    column.width = Math.max(maxLen + 4, 12);
  });

  const excelBackupPath = path.join(process.cwd(), `improvement_responses_backup_${new Date().toISOString().slice(0, 10)}.xlsx`);
  await workbook.xlsx.writeFile(excelBackupPath);
  console.log(`Excel backup saved to: ${excelBackupPath}`);
  process.exit(0);
}

backup().catch(err => {
  console.error('Backup failed:', err);
  process.exit(1);
});
