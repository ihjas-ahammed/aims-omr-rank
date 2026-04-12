import React, { useMemo, useState } from 'react';
import { OMRResult } from '../../services/geminiService';
import { Chapter } from '../../utils/topicParser';
import { AlertTriangle, TrendingUp, Users, Target, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';

interface Props {
  results: OMRResult[];
  chapters: Chapter[];
}

export default function ClassDashboard({ results, chapters }: Props) {
  const [showAllTopics, setShowAllTopics] = useState(false);

  const stats = useMemo(() => {
    if (!results.length || !chapters.length) return null;

    let maxQ = 0;
    const qMap = new Map<number, { chapter: string, topic: string }>();
    
    chapters.forEach(c => {
      if (c.topics.length > 0) {
        c.topics.forEach(t => {
          t.questions.forEach(q => {
            qMap.set(q, { chapter: c.name, topic: t.name });
            if (q > maxQ) maxQ = q;
          });
        });
      } else {
        c.questions.forEach(q => {
          qMap.set(q, { chapter: c.name, topic: '' });
          if (q > maxQ) maxQ = q;
        });
      }
    });

    if (qMap.size === 0) return null;

    const qStats: Record<number, { correct: number, wrong: number, unattempted: number }> = {};
    let totalScore = 0;
    let maxScore = -Infinity;
    let totalQuestionsAttempted = 0;
    let totalCorrectAll = 0;

    results.forEach(r => {
      const score = (r.right * 4) - r.wrong;
      totalScore += score;
      if (score > maxScore) maxScore = score;

      for (let i = 1; i <= Math.max(25, maxQ); i++) {
        if (!qMap.has(i)) continue; // only count mapped questions for stats
        
        if (!qStats[i]) qStats[i] = { correct: 0, wrong: 0, unattempted: 0 };
        
        const s = r.scores[`q${i}`];
        if (s === 1) {
          qStats[i].correct++;
          totalCorrectAll++;
        } else if (s === -1) {
          qStats[i].wrong++;
        } else {
          qStats[i].unattempted++;
        }
        totalQuestionsAttempted++;
      }
    });

    const avgScore = totalScore / results.length;
    const overallAccuracy = totalQuestionsAttempted > 0 ? (totalCorrectAll / totalQuestionsAttempted) * 100 : 0;

    const qArray = [];
    for (const [qNum, mapping] of qMap.entries()) {
      const s = qStats[qNum];
      if (!s) continue;
      const total = results.length;
      const accuracy = total > 0 ? (s.correct / total) * 100 : 0;
      qArray.push({ qNum, accuracy, wrong: s.wrong, unattempted: s.unattempted, ...mapping });
    }

    const hardestQs = qArray.sort((a, b) => {
      if (a.accuracy === b.accuracy) {
        return (b.wrong + b.unattempted) - (a.wrong + a.unattempted);
      }
      return a.accuracy - b.accuracy;
    }).slice(0, 4);

    const topicStats: { name: string; accuracy: number; correct: number; totalQs: number }[] = [];
    
    chapters.forEach(c => {
      if (c.topics.length > 0) {
        c.topics.forEach(t => {
          if (t.questions.length === 0) return;
          let tCorrect = 0;
          t.questions.forEach(q => tCorrect += qStats[q]?.correct || 0);
          const totalQs = t.questions.length * results.length;
          topicStats.push({
            name: `${c.name} - ${t.name}`,
            correct: tCorrect,
            totalQs,
            accuracy: totalQs > 0 ? (tCorrect / totalQs) * 100 : 0
          });
        });
      } else if (c.questions.length > 0) {
        let cCorrect = 0;
        c.questions.forEach(q => cCorrect += qStats[q]?.correct || 0);
        const totalQs = c.questions.length * results.length;
        topicStats.push({
          name: c.name,
          correct: cCorrect,
          totalQs,
          accuracy: totalQs > 0 ? (cCorrect / totalQs) * 100 : 0
        });
      }
    });

    // Sort topics ascending by accuracy to highlight weak areas
    const sortedTopics = topicStats.sort((a, b) => a.accuracy - b.accuracy);

    return {
      avgScore,
      maxScore,
      overallAccuracy,
      hardestQs,
      topicArr: sortedTopics
    };

  }, [results, chapters]);

  if (!stats) return null;

  const StatCard = ({ icon, label, value, title }: any) => (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col justify-center" title={title}>
      <div className="flex items-center gap-1.5 text-gray-500 mb-1">
        {icon}
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-lg sm:text-xl font-black text-gray-900">{value}</div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6 w-full mb-6 print:hidden">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-gray-900">Class Performance Summary</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={<Users className="w-3.5 h-3.5"/>} label="Students" value={results.length} />
        <StatCard icon={<Target className="w-3.5 h-3.5"/>} label="Class Avg" value={`${stats.avgScore.toFixed(1)} pts`} />
        <StatCard icon={<TrendingUp className="w-3.5 h-3.5"/>} label="Highest Score" value={`${stats.maxScore} pts`} />
        <StatCard icon={<BarChart3 className="w-3.5 h-3.5"/>} label="Avg Accuracy" value={`${stats.overallAccuracy.toFixed(1)}%`} title="Percentage of all attempted mapped questions answered correctly" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hardest Questions */}
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" /> Most Incorrectly Answered
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {stats.hardestQs.map(q => (
              <div key={q.qNum} className="bg-red-50 border border-red-100 rounded-xl p-3 relative overflow-hidden flex flex-col h-full">
                <div className="absolute top-0 right-0 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded-bl-lg border-b border-l border-red-200 shadow-sm">
                  {q.wrong + q.unattempted} missed
                </div>
                <div className="text-lg sm:text-xl font-black text-red-700 mb-1">Q{q.qNum}</div>
                <div className="text-[10px] sm:text-xs font-medium text-red-900/70 leading-tight line-clamp-2 flex-1 mb-2" title={q.topic ? `${q.chapter} - ${q.topic}` : q.chapter}>
                  {q.topic ? `${q.chapter} - ${q.topic}` : q.chapter}
                </div>
                <div className="mt-auto">
                  <div className="flex justify-between text-[10px] font-bold text-red-800 mb-1">
                    <span>Accuracy</span>
                    <span>{Math.round(q.accuracy)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-red-200 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${q.accuracy}%` }} />
                  </div>
                </div>
              </div>
            ))}
            {stats.hardestQs.length === 0 && (
              <div className="col-span-2 text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                No question data available.
              </div>
            )}
          </div>
        </div>

        {/* Topic Performance */}
        <div className="flex flex-col h-full">
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center justify-between">
            <span>Topic Performance</span>
            {stats.topicArr.length > 4 && (
              <button onClick={() => setShowAllTopics(!showAllTopics)} className="text-xs text-indigo-600 font-bold flex items-center hover:bg-indigo-50 px-2 py-1 rounded transition-colors">
                {showAllTopics ? 'Show Top 4' : 'Show All'} {showAllTopics ? <ChevronUp className="w-3 h-3 ml-1"/> : <ChevronDown className="w-3 h-3 ml-1"/>}
              </button>
            )}
          </h3>
          <div className="space-y-3 flex-1">
            {(showAllTopics ? stats.topicArr : stats.topicArr.slice(0, 4)).map(t => (
              <div key={t.name} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700 truncate pr-2" title={t.name}>{t.name}</span>
                    <span className="font-bold text-gray-900 shrink-0">{Math.round(t.accuracy)}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${t.accuracy < 40 ? 'bg-red-400' : t.accuracy < 70 ? 'bg-yellow-400' : 'bg-green-400'}`} 
                      style={{ width: `${t.accuracy}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}
            {stats.topicArr.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                No topic mapping found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}