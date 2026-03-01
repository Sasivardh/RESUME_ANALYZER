'use client';

import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Briefcase, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  TrendingUp,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Layout,
  Info,
  Copy,
  Check,
  ExternalLink,
  Download,
  Plus,
  Image as ImageIcon,
  File as FileIcon,
  X,
  Sun,
  Moon,
  MessageCircle,
  Sparkles,
  FileEdit,
  RotateCcw,
  BrainCircuit,
  MessageSquare,
  MonitorCheck,
  LayoutGrid,
  Menu
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useTheme } from 'next-themes';
import * as mammoth from 'mammoth';
import { ATS_ANALYSIS_SCHEMA, SYSTEM_INSTRUCTION, COVER_LETTER_PROMPT } from '@/lib/constants';
import HowItWorks from './HowItWorks';
import ResumeTemplates from './ResumeTemplates';
import HistoryView from './HistoryView';
import BulkResultsView from './BulkResultsView';

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

interface HistoryItem {
  id: string;
  date: string;
  score: number;
  jdTitle: string;
  status: string;
}

interface BulkResult {
  id: string;
  fileName: string;
  result: AnalysisResult;
}

interface AttachedFile {
  file: File;
  base64: string;
  mimeType: string;
  extractedText?: string;
}

const CountUp = ({ end, duration = 2 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [end, duration]);

  return <>{count}</>;
};

export default function ATSAnalyzer() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<'analyzer' | 'how-it-works' | 'resume-templates' | 'history'>('analyzer');
  const [resume, setResume] = useState('');
  const [jd, setJd] = useState('');
  const [resumeFiles, setResumeFiles] = useState<AttachedFile[]>([]);
  const [jdFile, setJdFile] = useState<AttachedFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [bulkResults, setBulkResults] = useState<BulkResult[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [rewriting, setRewriting] = useState(false);
  const [rewrittenSection, setRewrittenSection] = useState<{ original: string; improved: string } | null>(null);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [interviewPrep, setInterviewPrep] = useState<{ question: string; answer: string }[] | null>(null);
  const [generatingCL, setGeneratingCL] = useState(false);
  const [generatingPrep, setGeneratingPrep] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedCL, setCopiedCL] = useState(false);
  const [copiedPrep, setCopiedPrep] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    const savedHistory = localStorage.getItem('ats_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('ats_history', JSON.stringify(history));
    }
  }, [history, mounted]);

  const fileToDataPart = async (file: File): Promise<AttachedFile> => {
    return new Promise((resolve, reject) => {
      const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx');
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          let base64 = '';
          let extractedText = undefined;

          if (isDocx) {
            const arrayBuffer = reader.result as ArrayBuffer;
            const result = await mammoth.extractRawText({ arrayBuffer });
            extractedText = result.value;
            // We don't need base64 for DOCX as we send the extracted text
            console.log(`Extracted text from DOCX: ${file.name} (${extractedText.length} chars)`);
          } else {
            base64 = (reader.result as string).split(',')[1];
            console.log(`Processed file as base64: ${file.name} (${file.type})`);
          }

          resolve({
            file,
            base64,
            mimeType: file.type || 'application/octet-stream',
            extractedText
          });
        } catch (err) {
          console.error('Error processing file:', err);
          reject(err);
        }
      };
      
      reader.onerror = (err) => {
        console.error('FileReader error:', err);
        reject(err);
      };
      
      if (isDocx) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'jd') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (type === 'resume') {
      const newFiles: AttachedFile[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 10 * 1024 * 1024) {
          setError(`File ${file.name} is too large. Please upload files smaller than 10MB.`);
          continue;
        }
        try {
          const attached = await fileToDataPart(file);
          newFiles.push(attached);
        } catch (err) {
          setError(`Failed to process file ${file.name}.`);
        }
      }
      setResumeFiles(prev => [...prev, ...newFiles].slice(0, 10)); // Max 10
      setError(null);
    } else {
      const file = files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError('File size too large. Please upload a file smaller than 10MB.');
        return;
      }
      try {
        const attached = await fileToDataPart(file);
        setJdFile(attached);
        setError(null);
      } catch (err) {
        setError('Failed to process file.');
      }
    }
  };

  const addToHistory = (score: number, status: string) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString(),
      score,
      jdTitle: jd.trim() || jdFile?.file.name || 'Untitled JD',
      status
    };
    setHistory(prev => [newItem, ...prev].slice(0, 20)); // Keep last 20
  };

  const handleAnalyze = async () => {
    if ((resumeFiles.length === 0 && !resume.trim()) || (!jd.trim() && !jdFile)) {
      setError('Please provide both a resume and a job description (text or file).');
      return;
    }

    // If multiple resumes, use bulk screening
    if (resumeFiles.length > 1) {
      handleBulkAnalyze();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        setError('Gemini API Key is missing. Please ensure NEXT_PUBLIC_GEMINI_API_KEY is set in your environment variables.');
        setLoading(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      
      const parts: any[] = [];
      
      // Resume Part
      if (resumeFiles.length > 0) {
        const file = resumeFiles[0];
        if (file.extractedText) {
          parts.push({ text: `RESUME TEXT (Extracted from ${file.file.name}):\n${file.extractedText}` });
        } else {
          parts.push({
            inlineData: {
              data: file.base64,
              mimeType: file.mimeType
            }
          });
          parts.push({ text: "The above file is the candidate's RESUME." });
        }
      } else if (resume.trim()) {
        parts.push({ text: `RESUME TEXT:\n${resume}` });
      }

      // JD Part
      if (jdFile) {
        if (jdFile.extractedText) {
          parts.push({ text: `JOB DESCRIPTION TEXT (Extracted from ${jdFile.file.name}):\n${jdFile.extractedText}` });
        } else {
          parts.push({
            inlineData: {
              data: jdFile.base64,
              mimeType: jdFile.mimeType
            }
          });
          parts.push({ text: "The above file is the JOB DESCRIPTION." });
        }
      }
      if (jd.trim()) {
        parts.push({ text: `JOB DESCRIPTION TEXT:\n${jd}` });
      }

      parts.push({ text: "Please analyze the provided resume against the job description and return the analysis in JSON format." });

      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-3-flash-preview',
        contents: { parts },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: ATS_ANALYSIS_SCHEMA,
        },
      });

      const data = JSON.parse(response.text || '{}') as AnalysisResult;
      setResult(data);
      addToHistory(data.matchScore, data.overallVerdict.status);
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById('analysis-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze the documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const callGeminiWithRetry = async (ai: any, params: any, maxRetries = 5): Promise<any> => {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await ai.models.generateContent(params);
      } catch (err: any) {
        lastError = err;
        // Check if it's a rate limit error (429)
        const errStr = JSON.stringify(err);
        const isRateLimit = 
          err.message?.includes('429') || 
          err.status === 429 || 
          errStr.includes('429') ||
          errStr.includes('RESOURCE_EXHAUSTED') ||
          errStr.includes('quota');

        if (isRateLimit && i < maxRetries - 1) {
          // Exponential backoff: 3s, 6s, 12s, 24s...
          const delay = Math.pow(2, i) * 3000 + Math.random() * 1000;
          await sleep(delay);
          continue;
        }
        throw err;
      }
    }
    throw lastError;
  };

  const handleBulkAnalyze = async () => {
    if (resumeFiles.length === 0 || (!jd.trim() && !jdFile)) return;
    
    setBulkLoading(true);
    setBulkProgress({ current: 0, total: resumeFiles.length });
    setError(null);
    setBulkResults([]);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        setError('Gemini API Key is missing. Please ensure NEXT_PUBLIC_GEMINI_API_KEY is set in your environment variables.');
        setBulkLoading(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      const results: BulkResult[] = [];

      for (let i = 0; i < resumeFiles.length; i++) {
        setBulkProgress({ current: i + 1, total: resumeFiles.length });
        const file = resumeFiles[i];
        
        // Add a delay between requests to avoid initial burst limits
        // Free tier is very restrictive, 5s is safer for bulk
        if (i > 0) await sleep(5000);

        const parts: any[] = [];
        if (file.extractedText) {
          parts.push({ text: `RESUME TEXT (Extracted from ${file.file.name}):\n${file.extractedText}` });
        } else {
          parts.push({
            inlineData: {
              data: file.base64,
              mimeType: file.mimeType
            }
          });
          parts.push({ text: "The above file is the candidate's RESUME." });
        }

        if (jdFile) {
          if (jdFile.extractedText) {
            parts.push({ text: `JOB DESCRIPTION TEXT (Extracted from ${jdFile.file.name}):\n${jdFile.extractedText}` });
          } else {
            parts.push({
              inlineData: {
                data: jdFile.base64,
                mimeType: jdFile.mimeType
              }
            });
          }
        }
        if (jd.trim()) {
          parts.push({ text: `JOB DESCRIPTION TEXT:\n${jd}` });
        }

        parts.push({ text: "Analyze this resume against the JD and return JSON." });

        const response = await callGeminiWithRetry(ai, {
          model: 'gemini-3-flash-preview',
          contents: { parts },
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: ATS_ANALYSIS_SCHEMA,
          },
        });

        const data = JSON.parse(response.text || '{}') as AnalysisResult;
        results.push({
          id: Math.random().toString(36).substr(2, 9),
          fileName: file.file.name,
          result: data
        });
      }

      // Sort by score
      results.sort((a, b) => b.result.matchScore - a.result.matchScore);
      setBulkResults(results);
      
      // Scroll to bulk results
      setTimeout(() => {
        document.getElementById('bulk-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Bulk analysis error:', err);
      setError('Failed to perform bulk analysis.');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleRewrite = async (section: string) => {
    setRewriting(true);
    setRewrittenSection(null);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        setError('Gemini API Key is missing. Please ensure NEXT_PUBLIC_GEMINI_API_KEY is set in your environment variables.');
        setRewriting(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      
      const parts: any[] = [];
      if (resumeFiles.length > 0) {
        parts.push({ inlineData: { data: resumeFiles[0].base64, mimeType: resumeFiles[0].mimeType } });
      } else if (resume) {
        parts.push({ text: `RESUME:\n${resume}` });
      }

      if (jdFile) {
        parts.push({ inlineData: { data: jdFile.base64, mimeType: jdFile.mimeType } });
      } else if (jd) {
        parts.push({ text: `JD:\n${jd}` });
      }

      parts.push({ text: `REWRITE REQUEST: Please rewrite the following section from the resume to better align with the job description. Make it more impactful and keyword-rich while maintaining honesty.
      
      SECTION TO REWRITE:
      ${section}` });

      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-3-flash-preview',
        contents: { parts },
        config: {
          systemInstruction: "You are an expert resume writer. Rewrite the provided section to be more ATS-friendly and impactful. Return ONLY the rewritten text.",
        },
      });

      setRewrittenSection({
        original: section,
        improved: response.text || 'Failed to rewrite.'
      });
    } catch (err) {
      console.error('Rewrite error:', err);
      setError('Failed to rewrite section.');
    } finally {
      setRewriting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 71) return 'text-emerald-600';
    if (score >= 41) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getVerdictStyles = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('strong')) return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50';
    if (s.includes('moderate')) return 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/50';
    if (s.includes('weak')) return 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/50';
    return 'bg-stone-50 dark:bg-stone-800/50 text-stone-700 dark:text-stone-400 border-stone-100 dark:border-stone-800';
  };

  const handleWhatsAppShare = () => {
    if (!result) return;
    const text = `🚀 My Resume Analysis Report!\n\nMatch Score: ${result.matchScore}%\nVerdict: ${result.overallVerdict.status}\n\nAnalyze your resume for free at: ${window.location.origin}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleGenerateCoverLetter = async () => {
    if (!result) return;
    setGeneratingCL(true);
    setError(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        setError('Gemini API Key is missing. Please ensure NEXT_PUBLIC_GEMINI_API_KEY is set in your environment variables.');
        setGeneratingCL(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      
      const parts: any[] = [];
      
      // Resume Part
      if (resumeFiles.length > 0) {
        parts.push({
          inlineData: {
            data: resumeFiles[0].base64,
            mimeType: resumeFiles[0].mimeType
          }
        });
      } else if (resume) {
        parts.push({ text: `RESUME:\n${resume}` });
      }

      // JD Part
      if (jdFile) {
        parts.push({
          inlineData: {
            data: jdFile.base64,
            mimeType: jdFile.mimeType
          }
        });
      } else if (jd) {
        parts.push({ text: `JOB DESCRIPTION:\n${jd}` });
      }

      parts.push({ text: COVER_LETTER_PROMPT });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts },
      });

      setCoverLetter(response.text || 'Failed to generate cover letter.');
      
      // Scroll to cover letter
      setTimeout(() => {
        const el = document.getElementById('cover-letter-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err) {
      console.error(err);
      setError('Failed to generate cover letter. Please try again.');
    } finally {
      setGeneratingCL(false);
    }
  };

  const handleGenerateInterviewPrep = async () => {
    setGeneratingPrep(true);
    setError(null);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        setError('Gemini API Key is missing. Please ensure NEXT_PUBLIC_GEMINI_API_KEY is set in your environment variables.');
        setGeneratingPrep(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      const parts: any[] = [];

      if (resumeFiles.length > 0) {
        parts.push({
          inlineData: {
            data: resumeFiles[0].base64,
            mimeType: resumeFiles[0].mimeType
          }
        });
      } else if (resume) {
        parts.push({ text: `RESUME:\n${resume}` });
      }

      if (jdFile) {
        parts.push({
          inlineData: {
            data: jdFile.base64,
            mimeType: jdFile.mimeType
          }
        });
      } else if (jd) {
        parts.push({ text: `JOB DESCRIPTION:\n${jd}` });
      }

      parts.push({ text: "Based on this resume and job description, generate 5-7 likely interview questions and suggested high-impact answers. Return the response as a JSON array of objects with 'question' and 'answer' properties." });

      const response = await callGeminiWithRetry(ai, {
        model: "gemini-3-flash-preview",
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING }
              },
              required: ["question", "answer"]
            }
          }
        }
      });

      const data = JSON.parse(response.text || "[]");
      setInterviewPrep(data);
      
      // Scroll to interview prep
      setTimeout(() => {
        const el = document.getElementById('interview-prep-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err) {
      console.error(err);
      setError('Failed to generate interview prep. Please try again.');
    } finally {
      setGeneratingPrep(false);
    }
  };

  const handleCopyPrep = () => {
    if (!interviewPrep) return;
    const text = interviewPrep.map(p => `Q: ${p.question}\nA: ${p.answer}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedPrep(true);
    setTimeout(() => setCopiedPrep(false), 2000);
  };

  const handleDownloadPrepPDF = () => {
    if (!interviewPrep) return;

    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 20;

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(26, 26, 26);
    doc.text('Interview Preparation Guide', margin, y);
    y += 12;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated on ${new Date().toLocaleDateString()} via ATS Resume Analyst`, margin, y);
    y += 15;

    // Horizontal Line
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, y, pageWidth - margin, y);
    y += 15;

    // Content
    interviewPrep.forEach((item, index) => {
      // Question
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55);
      const qLines = doc.splitTextToSize(`${index + 1}. ${item.question}`, pageWidth - (margin * 2));
      
      if (y + (qLines.length * 6) > pageHeight - margin) {
        doc.addPage();
        y = 20;
      }
      doc.text(qLines, margin, y);
      y += (qLines.length * 6) + 2;

      // Answer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(75, 85, 99);
      const aLines = doc.splitTextToSize(`Suggested Answer: ${item.answer}`, pageWidth - (margin * 2));
      
      if (y + (aLines.length * 6) > pageHeight - margin) {
        doc.addPage();
        y = 20;
      }
      doc.text(aLines, margin, y);
      y += (aLines.length * 6) + 10;
    });

    doc.save('Interview_Prep_Guide.pdf');
  };

  const handleCopyCL = () => {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter);
    setCopiedCL(true);
    setTimeout(() => setCopiedCL(false), 2000);
  };

  const handleDownloadCLPDF = () => {
    if (!coverLetter) return;

    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 20;

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(26, 26, 26);
    doc.text('Personalized Cover Letter', margin, y);
    y += 12;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated on ${new Date().toLocaleDateString()} via ATS Resume Analyst`, margin, y);
    y += 15;

    // Horizontal Line
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, y, pageWidth - margin, y);
    y += 15;

    // Content
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(31, 41, 55);
    
    const splitText = doc.splitTextToSize(coverLetter, pageWidth - (margin * 2));
    
    for (let i = 0; i < splitText.length; i++) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = 20;
      }
      doc.text(splitText[i], margin, y);
      y += 6; // line height
    }

    doc.save('Cover_Letter.pdf');
  };

  const handleCopyReport = () => {
    if (!result) return;
    
    const report = `
ATS ANALYSIS REPORT
-------------------
Match Score: ${result.matchScore}/100
Verdict: ${result.overallVerdict.status} - ${result.overallVerdict.reason}

SUMMARY
${result.summary}

MATCHED KEYWORDS
${result.matchedKeywords.join(', ')}

MISSING KEYWORDS
${result.missingKeywords.join(', ')}

STRENGTHS
${result.strengths.map(s => `- ${s}`).join('\n')}

IMPROVEMENT SUGGESTIONS
${result.improvementSuggestions.map(s => `- ${s}`).join('\n')}

FORMAT ANALYSIS
---------------
ATS Friendly: ${result.formatAnalysis.isAtsFriendly ? 'Yes' : 'No'}
Layout Score: ${result.formatAnalysis.layoutScore}/100
Issues: ${result.formatAnalysis.issues.join(', ')}
Recommendations: ${result.formatAnalysis.recommendations.join(', ')}

ATS COMPATIBILITY TIPS
${result.atsCompatibilityTips.map(t => `- ${t}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    if (!result) return;

    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(26, 26, 26);
    doc.text('ATS ANALYST', margin, y);
    y += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, y);
    y += 15;

    // Match Score
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(224, 123, 0); // Primary color
    doc.text(`Match Score: ${result.matchScore}/100`, margin, y);
    y += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 26, 26);
    doc.text(`Verdict: ${result.overallVerdict.status}`, margin, y);
    y += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(result.overallVerdict.reason, margin, y, { maxWidth: 170 });
    y += 15;

    // Summary Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('SUMMARY', margin, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(result.summary, 170);
    doc.text(summaryLines, margin, y);
    y += (summaryLines.length * 5) + 10;

    // Keywords
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('MATCHED KEYWORDS', margin, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(result.matchedKeywords.join(', '), margin, y, { maxWidth: 170 });
    y += 15;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('MISSING KEYWORDS', margin, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(result.missingKeywords.join(', '), margin, y, { maxWidth: 170 });
    y += 15;

    // Check for page overflow
    const checkPageOverflow = (needed: number) => {
      if (y + needed > 280) {
        doc.addPage();
        y = 20;
      }
    };

    // Strengths
    checkPageOverflow(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('KEY STRENGTHS', margin, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    result.strengths.forEach(s => {
      const lines = doc.splitTextToSize(`• ${s}`, 170);
      checkPageOverflow(lines.length * 5);
      doc.text(lines, margin, y);
      y += (lines.length * 5) + 2;
    });
    y += 10;

    // Suggestions
    checkPageOverflow(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('IMPROVEMENT SUGGESTIONS', margin, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    result.improvementSuggestions.forEach(s => {
      const lines = doc.splitTextToSize(`• ${s}`, 170);
      checkPageOverflow(lines.length * 5);
      doc.text(lines, margin, y);
      y += (lines.length * 5) + 2;
    });
    y += 10;

    // Format Analysis
    checkPageOverflow(40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('FORMAT ANALYSIS', margin, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`ATS Friendly: ${result.formatAnalysis.isAtsFriendly ? 'Yes' : 'No'}`, margin, y);
    y += 5;
    doc.text(`Layout Score: ${result.formatAnalysis.layoutScore}/100`, margin, y);
    y += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Detected Issues:', margin, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    result.formatAnalysis.issues.forEach(issue => {
      const lines = doc.splitTextToSize(`• ${issue}`, 170);
      checkPageOverflow(lines.length * 5);
      doc.text(lines, margin, y);
      y += (lines.length * 5) + 2;
    });
    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.text('Formatting Recommendations:', margin, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    result.formatAnalysis.recommendations.forEach(rec => {
      const lines = doc.splitTextToSize(`• ${rec}`, 170);
      checkPageOverflow(lines.length * 5);
      doc.text(lines, margin, y);
      y += (lines.length * 5) + 2;
    });
    y += 10;

    // ATS Tips
    checkPageOverflow(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('ATS COMPATIBILITY TIPS', margin, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    result.atsCompatibilityTips.forEach(t => {
      const lines = doc.splitTextToSize(`• ${t}`, 170);
      checkPageOverflow(lines.length * 5);
      doc.text(lines, margin, y);
      y += (lines.length * 5) + 2;
    });

    doc.save('ATS_Analysis_Report.pdf');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F5F4EF] dark:bg-stone-950 transition-colors duration-300">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl border-b border-white/20 dark:border-stone-800/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => setView('analyzer')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-stone-900 dark:bg-stone-100 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-white dark:text-stone-900" />
            </div>
            <span className="font-bold text-xl tracking-tight text-stone-900 dark:text-stone-100">ATS Analyst</span>
          </button>
          <div className="flex items-center gap-2 md:gap-8">
            <div className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => setView('analyzer')}
                className={`text-sm font-medium transition-colors ${view === 'analyzer' ? 'text-stone-900 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'}`}
              >
                Home
              </button>
              <button 
                onClick={() => setView('how-it-works')}
                className={`text-sm font-medium transition-colors ${view === 'how-it-works' ? 'text-stone-900 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'}`}
              >
                How it works
              </button>
              <button 
                onClick={() => setView('resume-templates')}
                className={`text-sm font-medium transition-colors ${view === 'resume-templates' ? 'text-stone-900 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'}`}
              >
                Resume Templates
              </button>
              <button 
                onClick={() => setView('history')}
                className={`text-sm font-medium transition-colors ${view === 'history' ? 'text-stone-900 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'}`}
              >
                History
              </button>
              <button 
                onClick={() => setView('analyzer')}
                className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-semibold hover:bg-stone-800 dark:hover:bg-stone-200 transition-all"
              >
                Get Started
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all"
                aria-label="Toggle theme"
              >
                {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 overflow-hidden"
            >
              <div className="flex flex-col p-4 gap-4">
                <button 
                  onClick={() => { setView('analyzer'); setMobileMenuOpen(false); }}
                  className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'analyzer' ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'}`}
                >
                  Home
                </button>
                <button 
                  onClick={() => { setView('how-it-works'); setMobileMenuOpen(false); }}
                  className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'how-it-works' ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'}`}
                >
                  How it works
                </button>
                <button 
                  onClick={() => { setView('resume-templates'); setMobileMenuOpen(false); }}
                  className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'resume-templates' ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'}`}
                >
                  Resume Templates
                </button>
                <button 
                  onClick={() => { setView('history'); setMobileMenuOpen(false); }}
                  className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'history' ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'}`}
                >
                  History
                </button>
                <button 
                  onClick={() => { setView('analyzer'); setMobileMenuOpen(false); }}
                  className="w-full px-4 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl text-sm font-semibold hover:bg-stone-800 dark:hover:bg-stone-200 transition-all text-center"
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {view === 'how-it-works' ? (
        <HowItWorks onBackToAnalyzer={() => setView('analyzer')} />
      ) : view === 'resume-templates' ? (
        <ResumeTemplates onBack={() => setView('analyzer')} />
      ) : view === 'history' ? (
        <HistoryView 
          history={history} 
          onClear={() => setHistory([])} 
          onBack={() => setView('analyzer')} 
        />
      ) : bulkResults.length > 0 ? (
        <BulkResultsView 
          results={bulkResults} 
          onBack={() => { setBulkResults([]); setView('analyzer'); }} 
        />
      ) : (
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <header className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs font-bold uppercase tracking-wider mb-6"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            AI-Powered Career Intelligence
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mb-6">
            Optimize Your Resume <br className="hidden md:block" /> for the <span className="text-[#E07B00]">Modern ATS</span>
          </h1>
          <p className="text-xl text-stone-500 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed">
            Don&apos;t let algorithms hide your talent. Our AI analyzes your resume against job descriptions to give you the exact keywords and formatting you need to get hired.
          </p>
        </header>

        {/* Input Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wide">
                <FileText className="w-4 h-4" />
                Your Resumes (Max 10)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="resume-upload"
                  className="hidden"
                  multiple
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                  onChange={(e) => handleFileChange(e, 'resume')}
                />
                <label
                  htmlFor="resume-upload"
                  className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer transition-all shadow-sm"
                >
                  <Plus className="w-3 h-3" />
                  Upload PDF/Image
                </label>
                {resumeFiles.length > 0 && (
                  <button 
                    onClick={() => setResumeFiles([])}
                    className="text-[10px] font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 transition-colors uppercase tracking-wider"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -top-3 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-100 dark:bg-amber-900/50 border border-amber-200 dark:border-amber-800 rounded-md shadow-sm">
                  <MonitorCheck className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-tight">Format Check Enabled</span>
                </div>
              </div>
              <textarea
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                placeholder="Paste your resume text here..."
                className="w-full h-96 p-6 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm border border-white/20 dark:border-stone-800/50 rounded-2xl shadow-sm focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 focus:border-transparent transition-all resize-none font-sans text-stone-800 dark:text-stone-200 leading-relaxed"
              />
              {resumeFiles.length > 0 && (
                <div className="absolute bottom-4 left-4 right-4 p-3 bg-stone-900/95 dark:bg-stone-100/95 backdrop-blur text-white dark:text-stone-900 rounded-xl flex flex-col gap-2 shadow-lg border border-white/10 dark:border-black/10 max-h-32 overflow-y-auto">
                  {resumeFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        {file.mimeType.includes('image') ? <ImageIcon className="w-3 h-3 text-stone-400 dark:text-stone-500" /> : <FileIcon className="w-3 h-3 text-stone-400 dark:text-stone-500" />}
                        <span className="text-[10px] font-medium truncate">{file.file.name}</span>
                      </div>
                      <button 
                        onClick={() => setResumeFiles(prev => prev.filter((_, i) => i !== idx))}
                        className="p-1 hover:bg-white/10 dark:hover:bg-black/10 rounded-full transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wide">
                <Briefcase className="w-4 h-4" />
                Job Description
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="jd-upload"
                  className="hidden"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                  onChange={(e) => handleFileChange(e, 'jd')}
                />
                <label
                  htmlFor="jd-upload"
                  className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer transition-all shadow-sm"
                >
                  <Plus className="w-3 h-3" />
                  Upload PDF/Image
                </label>
              </div>
            </div>
            <div className="relative">
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the job description here..."
                className="w-full h-96 p-6 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm border border-white/20 dark:border-stone-800/50 rounded-2xl shadow-sm focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 focus:border-transparent transition-all resize-none font-sans text-stone-800 dark:text-stone-200 leading-relaxed"
              />
              {jdFile && (
                <div className="absolute bottom-4 left-4 right-4 p-3 bg-stone-900/95 dark:bg-stone-100/95 backdrop-blur text-white dark:text-stone-900 rounded-xl flex items-center justify-between shadow-lg border border-white/10 dark:border-black/10">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {jdFile.mimeType.includes('image') ? <ImageIcon className="w-4 h-4 text-stone-400 dark:text-stone-500" /> : <FileIcon className="w-4 h-4 text-stone-400 dark:text-stone-500" />}
                    <span className="text-xs font-medium truncate">{jdFile.file.name}</span>
                  </div>
                  <button onClick={() => setJdFile(null)} className="p-1 hover:bg-white/10 dark:hover:bg-black/10 rounded-full transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-24">
          <button
            onClick={handleAnalyze}
            disabled={loading || bulkLoading || ((resumeFiles.length === 0 && !resume.trim()) || (!jd.trim() && !jdFile))}
            className="group relative inline-flex items-center gap-3 px-16 py-5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-stone-900/20 dark:shadow-stone-100/10"
          >
            {loading || bulkLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                {bulkLoading ? `Ranking (${bulkProgress.current}/${bulkProgress.total})...` : 'Analyzing...'}
              </>
            ) : (
              <>
                {resumeFiles.length > 1 ? 'Bulk Rank Resumes' : 'Analyze Match'}
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div
              id="analysis-results"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 scroll-mt-24"
            >
              {/* Header with Actions */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100">Analysis Report</h2>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleCopyReport}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full text-sm font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all active:scale-95"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy Report'}
                  </button>
                  <button 
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-semibold hover:bg-stone-800 dark:hover:bg-stone-200 transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                  <button 
                    onClick={handleWhatsAppShare}
                    className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-full text-sm font-semibold hover:bg-[#20ba5a] transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </button>
                </div>
              </div>

              {/* Score Card */}
              <div className="bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl border border-white/20 dark:border-stone-800/50 rounded-3xl p-8 md:p-12 shadow-2xl shadow-stone-200/50 dark:shadow-none">
                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                  <div className="relative flex-shrink-0">
                    <svg className="w-48 h-48 transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-stone-100 dark:text-stone-800"
                      />
                      <motion.circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={552.92}
                        initial={{ strokeDashoffset: 552.92 }}
                        animate={{ strokeDashoffset: 552.92 - (552.92 * result.matchScore) / 100 }}
                        transition={{ duration: 2, ease: "circOut" }}
                        className={getScoreColor(result.matchScore)}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className={`text-6xl font-bold ${getScoreColor(result.matchScore)}`}
                      >
                        <CountUp end={result.matchScore} />
                      </motion.span>
                      <span className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Match Score</span>
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                      <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Overall Assessment</h3>
                      <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border flex items-center gap-2 ${getVerdictStyles(result.overallVerdict.status)}`}>
                        <div className={`w-2 h-2 rounded-full ${
                          result.overallVerdict.status.toLowerCase().includes('strong') ? 'bg-emerald-500' :
                          result.overallVerdict.status.toLowerCase().includes('moderate') ? 'bg-amber-500' :
                          result.overallVerdict.status.toLowerCase().includes('weak') ? 'bg-rose-500' :
                          'bg-stone-400'
                        }`} />
                        {result.overallVerdict.status}
                      </div>
                    </div>
                    <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed italic mb-6">
                      &quot;{result.summary}&quot;
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white/50 dark:bg-stone-800/30 backdrop-blur-sm rounded-xl border border-white/20 dark:border-stone-700/30">
                        <p className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-1">Verdict</p>
                        <p className="text-sm text-stone-600 dark:text-stone-400 font-medium leading-relaxed">
                          {result.overallVerdict.reason}
                        </p>
                      </div>
                      <div className="p-4 bg-white/50 dark:bg-stone-800/30 backdrop-blur-sm rounded-xl border border-white/20 dark:border-stone-700/30">
                        <p className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-1">Score Insight</p>
                        <p className="text-sm text-stone-600 dark:text-stone-400 font-medium leading-relaxed">
                          {result.matchScoreReason}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-8">
                      {!coverLetter && (
                        <button 
                          onClick={handleGenerateCoverLetter}
                          disabled={generatingCL}
                          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-bold transition-all active:scale-95 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                        >
                          {generatingCL ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                          Generate Cover Letter
                        </button>
                      )}
                      {!interviewPrep && (
                        <button 
                          onClick={handleGenerateInterviewPrep}
                          disabled={generatingPrep}
                          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm font-bold transition-all active:scale-95 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                        >
                          {generatingPrep ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                          Generate Interview Prep
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Format Checker Section */}
              <div className="bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl border border-white/20 dark:border-stone-800/50 rounded-3xl p-8 md:p-12 shadow-2xl shadow-stone-200/50 dark:shadow-none">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#E07B00]/10 rounded-2xl flex items-center justify-center">
                      <MonitorCheck className="w-8 h-8 text-[#E07B00]" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100">ATS Format Checker</h3>
                      <p className="text-stone-500 dark:text-stone-400">Deep layout and formatting analysis for ATS compatibility.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-3 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-100 dark:border-stone-800">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Layout Score</p>
                      <p className={`text-2xl font-bold ${getScoreColor(result.formatAnalysis.layoutScore)}`}>{result.formatAnalysis.layoutScore}/100</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${result.formatAnalysis.isAtsFriendly ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600'}`}>
                      {result.formatAnalysis.isAtsFriendly ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                      <LayoutGrid className="w-4 h-4 text-stone-400" />
                      Detected Issues
                    </h4>
                    <div className="space-y-3">
                      {result.formatAnalysis.issues.map((issue, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/30 rounded-xl">
                          <X className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">{issue}</p>
                        </div>
                      ))}
                      {result.formatAnalysis.issues.length === 0 && (
                        <div className="flex items-center gap-3 p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 rounded-xl">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <p className="text-sm text-stone-700 dark:text-stone-300">No major formatting issues detected. Your layout is highly ATS-friendly.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      Formatting Recommendations
                    </h4>
                    <div className="space-y-3">
                      {result.formatAnalysis.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/30 rounded-xl">
                          <ArrowRight className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-10 p-6 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center">
                      <Info className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium leading-relaxed max-w-xl">
                      <strong>Why this matters:</strong> Most ATS systems are text-based. Complex layouts, tables, and non-standard fonts can cause your resume to be parsed incorrectly, leading to automatic rejection.
                    </p>
                  </div>
                  <button 
                    onClick={() => setView('resume-templates')}
                    className="px-6 py-3 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-full text-sm font-bold hover:scale-105 transition-all flex-shrink-0"
                  >
                    View ATS-Friendly Templates
                  </button>
                </div>
              </div>

              {/* Cover Letter Section */}
              <AnimatePresence>
                {coverLetter && (
                  <motion.div
                    id="cover-letter-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl border border-white/20 dark:border-stone-800/50 rounded-3xl p-8 md:p-12 shadow-2xl shadow-stone-200/50 dark:shadow-none overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                      <FileEdit className="w-64 h-64 text-stone-900 dark:text-white" />
                    </div>

                    <div className="relative z-10">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                          <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-indigo-500" />
                            Personalized Cover Letter
                          </h3>
                          <p className="text-stone-500 dark:text-stone-400 mt-1">Tailored specifically for this role based on your experience.</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={handleCopyCL}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full text-sm font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-all active:scale-95"
                          >
                            {copiedCL ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            {copiedCL ? 'Copied!' : 'Copy Text'}
                          </button>
                          <button 
                            onClick={handleDownloadCLPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-semibold hover:bg-stone-800 dark:hover:bg-stone-200 transition-all active:scale-95 shadow-lg shadow-stone-500/10"
                          >
                            <Download className="w-4 h-4" />
                            Download PDF
                          </button>
                          <button 
                            onClick={handleGenerateCoverLetter}
                            disabled={generatingCL}
                            className="flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-full text-sm font-semibold hover:bg-stone-200 dark:hover:bg-stone-700 transition-all active:scale-95"
                          >
                            <RotateCcw className={`w-4 h-4 ${generatingCL ? 'animate-spin' : ''}`} />
                            Regenerate
                          </button>
                        </div>
                      </div>

                      <div className="bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 rounded-2xl p-6 md:p-10">
                        <div className="prose prose-stone dark:prose-invert max-w-none">
                          <pre className="whitespace-pre-wrap font-sans text-stone-700 dark:text-stone-300 leading-relaxed text-base md:text-lg">
                            {coverLetter}
                          </pre>
                        </div>
                      </div>

                      <div className="mt-8 flex items-center gap-4 p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                        <Info className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                        <p className="text-sm text-indigo-700 dark:text-indigo-400">
                          <strong>Pro Tip:</strong> Always review and adjust the placeholders (like [Hiring Manager Name]) before sending your application.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Interview Prep Section */}
              <AnimatePresence>
                {interviewPrep && (
                  <motion.div
                    id="interview-prep-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl border border-white/20 dark:border-stone-800/50 rounded-3xl p-8 md:p-12 shadow-2xl shadow-stone-200/50 dark:shadow-none overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                      <MessageSquare className="w-64 h-64 text-stone-900 dark:text-white" />
                    </div>

                    <div className="relative z-10">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                          <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                            <BrainCircuit className="w-6 h-6 text-emerald-500" />
                            Interview Preparation Guide
                          </h3>
                          <p className="text-stone-500 dark:text-stone-400 mt-1">Predicted questions and high-impact answers based on the job requirements.</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={handleCopyPrep}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full text-sm font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-all active:scale-95"
                          >
                            {copiedPrep ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            {copiedPrep ? 'Copied!' : 'Copy All'}
                          </button>
                          <button 
                            onClick={handleDownloadPrepPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-semibold hover:bg-stone-800 dark:hover:bg-stone-200 transition-all active:scale-95 shadow-lg shadow-stone-500/10"
                          >
                            <Download className="w-4 h-4" />
                            Download PDF
                          </button>
                          <button 
                            onClick={handleGenerateInterviewPrep}
                            disabled={generatingPrep}
                            className="flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-full text-sm font-semibold hover:bg-stone-200 dark:hover:bg-stone-700 transition-all active:scale-95"
                          >
                            <RotateCcw className={`w-4 h-4 ${generatingPrep ? 'animate-spin' : ''}`} />
                            Regenerate
                          </button>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {interviewPrep.map((item, i) => (
                          <div key={i} className="bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 rounded-2xl p-6 md:p-8">
                            <div className="flex gap-4">
                              <div className="w-8 h-8 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                {i + 1}
                              </div>
                              <div className="space-y-4">
                                <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100 leading-tight">
                                  {item.question}
                                </h4>
                                <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
                                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">Suggested Answer</p>
                                  <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                                    {item.answer}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                        <Info className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <p className="text-sm text-emerald-700 dark:text-emerald-400">
                          <strong>Interview Tip:</strong> Use the STAR method (Situation, Task, Action, Result) to structure your own experiences when answering these questions.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Keywords Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl border border-white/20 dark:border-stone-800/50 rounded-2xl p-8 shadow-sm">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-600 uppercase tracking-wider mb-6">
                    <CheckCircle2 className="w-4 h-4" />
                    Matched Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.matchedKeywords.map((kw, i) => (
                      <span key={i} className="px-3 py-1.5 bg-emerald-50/50 dark:bg-emerald-950/20 backdrop-blur-sm text-emerald-700 dark:text-emerald-400 rounded-lg text-sm font-medium border border-emerald-100/50 dark:border-emerald-900/30">
                        {kw}
                      </span>
                    ))}
                    {result.matchedKeywords.length === 0 && (
                      <span className="text-stone-400 dark:text-stone-500 text-sm italic">No significant keyword matches found.</span>
                    )}
                  </div>
                </div>

                <div className="bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl border border-white/20 dark:border-stone-800/50 rounded-2xl p-8 shadow-sm">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-rose-600 uppercase tracking-wider mb-6">
                    <AlertCircle className="w-4 h-4" />
                    Missing Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords.map((kw, i) => (
                      <span key={i} className="px-3 py-1.5 bg-rose-50/50 dark:bg-rose-950/20 backdrop-blur-sm text-rose-700 dark:text-rose-400 rounded-lg text-sm font-medium border border-rose-100/50 dark:border-rose-900/30">
                        {kw}
                      </span>
                    ))}
                    {result.missingKeywords.length === 0 && (
                      <span className="text-stone-400 dark:text-stone-500 text-sm italic">No critical missing keywords identified.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Strengths & Suggestions */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl border border-white/20 dark:border-stone-800/50 rounded-2xl p-8 shadow-sm">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider mb-6">
                    <TrendingUp className="w-4 h-4" />
                    Key Strengths
                  </h3>
                  <ul className="space-y-4">
                    {result.strengths.map((strength, i) => (
                      <li key={i} className="flex gap-3 text-stone-600 dark:text-stone-400">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl border border-white/20 dark:border-stone-800/50 rounded-2xl p-8 shadow-sm">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-amber-600 uppercase tracking-wider mb-6">
                    <Lightbulb className="w-4 h-4" />
                    Actionable Advice
                  </h3>
                  <ul className="space-y-4">
                    {result.improvementSuggestions.map((suggestion, i) => (
                      <li key={i} className="flex flex-col gap-2 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-800 group transition-all hover:shadow-md">
                        <div className="flex gap-3 text-stone-600 dark:text-stone-400">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                          <p className="text-sm leading-relaxed">{suggestion}</p>
                        </div>
                        <button
                          onClick={() => handleRewrite(suggestion)}
                          className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-stone-900 dark:text-stone-100 hover:opacity-70 transition-opacity uppercase tracking-wider"
                        >
                          <Sparkles className="w-3 h-3" />
                          Rewrite This Section
                        </button>
                      </li>
                    ))}
                  </ul>

                  {/* Rewritten Section Modal/Area */}
                  <AnimatePresence>
                    {(rewriting || rewrittenSection) && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-sm"
                      >
                        <motion.div 
                          className="w-full max-w-2xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-3xl shadow-2xl overflow-hidden"
                        >
                          <div className="p-6 border-b border-white/10 dark:border-black/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-amber-400 dark:text-amber-600" />
                              <h3 className="text-lg font-bold">AI Resume Rewriter</h3>
                            </div>
                            <button 
                              onClick={() => setRewrittenSection(null)}
                              className="p-2 hover:bg-white/10 dark:hover:bg-black/10 rounded-full transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="p-8">
                            {rewriting ? (
                              <div className="flex flex-col items-center justify-center py-12 gap-4">
                                <Loader2 className="w-8 h-8 animate-spin text-amber-400 dark:text-amber-600" />
                                <p className="text-sm font-medium opacity-70">Gemini is crafting a better version...</p>
                              </div>
                            ) : rewrittenSection && (
                              <div className="space-y-8">
                                <div>
                                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-3">Original Suggestion</div>
                                  <p className="text-sm italic opacity-70 leading-relaxed">{rewrittenSection.original}</p>
                                </div>
                                <div className="p-6 bg-white/10 dark:bg-black/5 rounded-2xl border border-white/10 dark:border-black/10">
                                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-3">Improved Version</div>
                                  <p className="text-base leading-relaxed font-medium">{rewrittenSection.improved}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(rewrittenSection.improved);
                                      setCopied(true);
                                      setTimeout(() => setCopied(false), 2000);
                                    }}
                                    className="flex-1 py-4 bg-white dark:bg-stone-900 text-stone-900 dark:text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                                  >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied to Clipboard!' : 'Copy Improved Version'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* ATS Compatibility Tips */}
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-8 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-6">
                  <Layout className="w-4 h-4" />
                  ATS Compatibility Tips
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {result.atsCompatibilityTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-800">
                      <div className="mt-1 w-1 h-1 rounded-full bg-stone-400 dark:bg-stone-600 flex-shrink-0" />
                      <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-24 pt-12 border-t border-stone-200 dark:border-stone-800 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-stone-900 dark:bg-stone-100 rounded flex items-center justify-center">
              <Search className="w-3.5 h-3.5 text-white dark:text-stone-900" />
            </div>
            <span className="font-bold text-stone-900 dark:text-stone-100">ATS Analyst</span>
          </div>
          <p className="text-stone-400 dark:text-stone-500 text-sm">© {new Date().getFullYear()} ATS Resume Analyzer. Built for career success.</p>
        </footer>
      </div>
    )}
  </div>
);
}

