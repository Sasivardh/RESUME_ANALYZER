'use client';

import React from 'react';
import { motion } from 'motion/react';
import { 
  History, 
  TrendingUp, 
  Calendar, 
  Briefcase, 
  ArrowRight,
  Trash2,
  Clock
} from 'lucide-react';

interface HistoryItem {
  id: string;
  date: string;
  score: number;
  jdTitle: string;
  status: string;
}

interface HistoryViewProps {
  history: HistoryItem[];
  onClear: () => void;
  onBack: () => void;
}

export default function HistoryView({ history, onClear, onBack }: HistoryViewProps) {
  const getScoreColor = (score: number) => {
    if (score >= 71) return 'text-emerald-600';
    if (score >= 41) return 'text-amber-600';
    return 'text-rose-600';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-100 mb-2 flex items-center gap-3">
            <History className="w-8 h-8" />
            Analysis History
          </h1>
          <p className="text-stone-500 dark:text-stone-400">
            Track your progress and see how your resume improves over time.
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
          <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-stone-400" />
          </div>
          <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">No history yet</h2>
          <p className="text-stone-500 dark:text-stone-400 mb-8">Start analyzing your resume to see your progress here.</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl font-semibold hover:bg-stone-800 dark:hover:bg-stone-200 transition-all"
          >
            Analyze Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Progress Chart Placeholder / Simple Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
              <div className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1">Total Analyzed</div>
              <div className="text-3xl font-bold text-stone-900 dark:text-stone-100">{history.length}</div>
            </div>
            <div className="p-6 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
              <div className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1">Average Score</div>
              <div className="text-3xl font-bold text-stone-900 dark:text-stone-100">
                {Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / history.length)}%
              </div>
            </div>
            <div className="p-6 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
              <div className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1">Latest Score</div>
              <div className={`text-3xl font-bold ${getScoreColor(history[0].score)}`}>
                {history[0].score}%
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800">
                    <th className="px-6 py-4 text-sm font-semibold text-stone-900 dark:text-stone-100">Date</th>
                    <th className="px-6 py-4 text-sm font-semibold text-stone-900 dark:text-stone-100">Job Description</th>
                    <th className="px-6 py-4 text-sm font-semibold text-stone-900 dark:text-stone-100">Score</th>
                    <th className="px-6 py-4 text-sm font-semibold text-stone-900 dark:text-stone-100">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {history.map((item, index) => (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                          <Calendar className="w-4 h-4" />
                          {item.date}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-stone-900 dark:text-stone-100">
                          <Briefcase className="w-4 h-4 text-stone-400" />
                          <span className="truncate max-w-[200px]">{item.jdTitle}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-lg font-bold ${getScoreColor(item.score)}`}>
                          {item.score}%
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status.toLowerCase().includes('strong') 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : item.status.toLowerCase().includes('moderate')
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
