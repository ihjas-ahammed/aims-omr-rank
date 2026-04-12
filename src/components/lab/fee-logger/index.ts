export { default as FeeLogForm } from './FeeLogForm';
export { default as FeeLogList } from './FeeLogList';
export { default as ImageScanner } from './ImageScanner';
export { default as FeeLogger } from './FeeLogger';
export { default as FeeLogCard } from './FeeLogCard';
export { default as FeeDashboard } from './FeeDashboard';
export { default as StudentFeeCard } from './StudentFeeCard';
export { default as StudentFeeTable } from './StudentFeeTable';
export { default as StudentProgressCard } from './StudentProgressCard';
export { default as FeeStatsRow } from './FeeStatsRow';
export { default as ImageScannerResults } from './ImageScannerResults';
export { default as EditableTargetFee } from './EditableTargetFee';
export { default as FeeTargetCSVImport } from './FeeTargetCSVImport';

export interface PaymentEntry {
  amount: number;
  isGPay: boolean;
  date: string;
}

export interface StudentSummary {
  id: string;
  admissionNo: string;
  studentName: string;
  studentClass: string;
  monthlyPayments: Record<number, PaymentEntry[]>; // month index (0-11) -> array of payments
  totalPaid: number;
  targetFee: number;
}

export interface ExtractedRecord {
  admissionNo: string;
  studentClass: string;
  studentName: string;
  feeAmount: number;
  isGPay: boolean;
  date: string;
}
