'use client';

import React from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Users, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  Download,
  ArrowRight,
  UserCheck,
  UserX,
  UserMinus
} from 'lucide-react';

interface AnalysisResult {
  matchScore: number;
  matchScoreReason: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  improvementSuggestions: string[];
  formatAnalysis: {
    isAtsFriendly: boolean;
    layoutScore: number;
    issues: string[];
    recommendations: string[];
  };
  atsCompatibilityTips: string[];
  overallVerdict: {
    status: string;
    reason: string;
  };
  summary: string;
}

interface BulkResult {
  id: string;
  fileName: string;
  result: AnalysisResult;
}

interface BulkResultsViewProps {
  results: BulkResult[];
  onBack: () => void;
}

export default function BulkResultsView({ results, onBack }: BulkResultsViewProps) {
  const getScoreColor = (score: number) => {
    if (score >= 71) return 'text-emerald-600';
    if (score >= 41) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getVerdictIcon = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('strong')) return <UserCheck className="w-5 h-5 text-emerald-600" />;
    if (s.includes('moderate')) return <UserMinus className="w-5 h-5 text-amber-600" />;
    return <UserX className="w-5 h-5 text-rose-600" />;
  };

  return (
    <div id="bulk-results" className="max-w-6xl mx-auto px-4 py-12 md:py-20">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-100 mb-2 flex items-center gap-3">
            <Users className="w-8 h-8" />
            Bulk Screening Results
          </h1>
          <p className="text-stone-500 dark:text-stone-400">
            Ranked candidates based on their resume match with the job description.
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl font-semibold hover:bg-stone-800 dark:hover:bg-stone-200 transition-all"
        >
          New Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {results.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 bg-white dark:bg-stone-900 rounded-3xl border ${
              index === 0 
                ? 'border-emerald-200 dark:border-emerald-900/50 ring-2 ring-emerald-500/20' 
                : 'border-stone-200 dark:border-stone-800'
            } shadow-sm hover:shadow-md transition-all`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl ${
                  index === 0 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                }`}>
                  #{index + 1}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    {item.fileName}
                    {index === 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-full">
                        <Trophy className="w-3 h-3" />
                        Top Match
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-1 max-w-md">
                    {item.result.summary}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(item.result.matchScore)}`}>
                    {item.result.matchScore}%
                  </div>
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Match Score</div>
                </div>

                <div className="h-12 w-px bg-stone-200 dark:bg-stone-800 hidden md:block" />

                <div className="flex flex-col items-center md:items-start">
                  <div className="flex items-center gap-2 text-sm font-semibold text-stone-900 dark:text-stone-100">
                    {getVerdictIcon(item.result.overallVerdict.status)}
                    {item.result.overallVerdict.status}
                  </div>
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Verdict</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-stone-100 dark:border-stone-800 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl">
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Top Strengths</div>
                <ul className="space-y-1">
                  {item.result.strengths.slice(0, 2).map((s, i) => (
                    <li key={i} className="text-xs text-stone-600 dark:text-stone-400 flex items-start gap-2">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl">
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Missing Keywords</div>
                <div className="flex flex-wrap gap-1">
                  {item.result.missingKeywords.slice(0, 4).map((k, i) => (
                    <span key={i} className="px-2 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 text-[10px] font-medium rounded-full">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl">
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">ATS Friendly</div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.result.formatAnalysis.isAtsFriendly ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                    {item.result.formatAnalysis.isAtsFriendly ? 'High Compatibility' : 'Needs Improvement'}
                  </span>
                </div>
                <div className="mt-1 text-[10px] text-stone-500 dark:text-stone-400">
                  Layout Score: {item.result.formatAnalysis.layoutScore}/100
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
