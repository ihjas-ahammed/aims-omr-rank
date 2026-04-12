export { default as ScoreAnalysisDashboard } from './ScoreAnalysisDashboard';
export { default as PrintableScoreCards } from './PrintableScoreCards';

export interface StudentScoreRecord {
  name: string;
  scores: Record<string, string | number>;
}