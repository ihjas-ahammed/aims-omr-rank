export { default as ScoreAnalysisDashboard } from './ScoreAnalysisDashboard';
export { default as PrintableScoreCards } from './PrintableScoreCards';
export { default as PrintableDailyList } from './PrintableDailyList';

export interface StudentScoreRecord {
  name: string;
  scores: Record<string, string | number>;
}