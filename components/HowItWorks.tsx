'use client';

import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Upload, 
  Clipboard, 
  Zap, 
  BarChart3, 
  RefreshCw,
  ShieldCheck,
  Target,
  HelpCircle,
  Heart
} from 'lucide-react';

interface HowItWorksProps {
  onBackToAnalyzer: () => void;
}

export default function HowItWorks({ onBackToAnalyzer }: HowItWorksProps) {
  const steps = [
    {
      title: "Step 1 — Upload Your Resume",
      description: "Paste your resume text directly, upload a PDF, or even upload an image of your resume. Our AI can read and understand all formats instantly using Google Gemini's multimodal capabilities.",
      icon: <Upload className="w-6 h-6" />
    },
    {
      title: "Step 2 — Paste the Job Description",
      description: "Copy the job description from any job portal — LinkedIn, Indeed, Naukri, or company websites. Paste it into the job description field on our analyzer.",
      icon: <Clipboard className="w-6 h-6" />
    },
    {
      title: "Step 3 — Analyze Instantly",
      description: "Click the \"Analyze\" button and let our AI do the work. Google Gemini AI reads both documents deeply, understands context, and performs an intelligent comparison — not just simple keyword matching.",
      icon: <Zap className="w-6 h-6" />
    },
    {
      title: "Step 4 — Get Your Results",
      description: "Within seconds you receive a detailed report including your ATS Match Score, matched and missing keywords, key strengths, actionable improvement advice, and ATS compatibility tips.",
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      title: "Step 5 — Improve & Reapply",
      description: "Use the feedback to update your resume, add missing keywords, and fix ATS formatting issues. Re-analyze as many times as you want until you're confident.",
      icon: <RefreshCw className="w-6 h-6" />
    }
  ];

  const faqs = [
    {
      q: "Is my resume data safe?",
      a: "Absolutely. We do not store your resume or any personal data. Your information is sent directly to Google Gemini API for analysis and is never saved on our servers."
    },
    {
      q: "How accurate is the match score?",
      a: "Our analyzer uses Google Gemini AI which goes beyond simple keyword matching. It understands context, synonyms, and skill relationships — achieving over 90% accuracy in scoring."
    },
    {
      q: "Can I upload a PDF or image of my resume?",
      a: "Yes! You can paste text, upload a PDF, or upload an image of your resume. Gemini's multimodal AI reads all formats accurately."
    },
    {
      q: "How many times can I analyze my resume?",
      a: "As many times as you want! We recommend analyzing after every update you make to your resume to track your improvement."
    },
    {
      q: "Does it work for all industries?",
      a: "Yes. Our AI understands job descriptions from all industries including IT, Telecom, Finance, Healthcare, Marketing, and more."
    },
    {
      q: "Is this tool free to use?",
      a: "Yes, the tool is completely free to use."
    }
  ];

  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <button 
          onClick={onBackToAnalyzer}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors group"
        >
          <ArrowRight className="w-4 h-4 rotate-180 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-bold uppercase tracking-wider">Back to Home</span>
        </button>
      </div>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-sm font-bold text-[#E07B00] uppercase tracking-widest mb-4">How It Works</h2>
          <h1 className="text-5xl md:text-6xl font-bold text-stone-900 dark:text-stone-100 mb-6 tracking-tight">
            Stop guessing. <span className="text-[#E07B00]">Start getting hired.</span>
          </h1>
          <p className="text-xl text-stone-500 dark:text-stone-400 leading-relaxed max-w-2xl mx-auto">
            Our AI-powered ATS Resume Analyzer uses Google Gemini AI to instantly compare your resume against any job description — giving you real, actionable feedback in seconds.
          </p>
        </motion.div>
      </section>

      {/* Step by Step Section */}
      <section className="py-20 px-4 bg-white dark:bg-stone-900">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex flex-col md:flex-row gap-8 items-start"
              >
                <div className="w-12 h-12 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-stone-900/20 dark:shadow-stone-100/10">
                  {step.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">{step.title}</h3>
                  <p className="text-stone-500 dark:text-stone-400 text-lg leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why ATS Matters Section */}
      <section className="py-24 px-4 bg-stone-900 dark:bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Target className="w-12 h-12 text-[#E07B00] mx-auto mb-8" />
          <h2 className="text-4xl font-bold mb-8 tracking-tight">Why ATS Optimization Matters</h2>
          <div className="space-y-6 text-lg text-stone-300 dark:text-stone-400 leading-relaxed">
            <p>
              Over 75% of resumes are rejected by Applicant Tracking Systems before a human ever reads them. Companies like Google, Amazon, Microsoft, and most modern employers use ATS software to automatically filter candidates based on keyword matching and resume formatting.
            </p>
            <p>
              A great resume that isn&apos;t ATS-optimized will never reach the hiring manager. Our tool bridges that gap — giving you the same insights that recruiters and ATS systems use to evaluate your profile.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-white dark:bg-stone-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-12 text-center">What Our Analyzer Does</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "ATS Match Score", desc: "Get a score out of 100 showing how well your resume matches the job description" },
              { title: "ATS Format Checker", desc: "Deep analysis of your resume's layout, fonts, tables, and special characters for ATS compatibility" },
              { title: "Matched Keywords", desc: "See exactly which skills and keywords from the JD are already in your resume" },
              { title: "Missing Keywords", desc: "Discover critical keywords you need to add to pass ATS filters" },
              { title: "Key Strengths", desc: "Understand what makes your profile stand out for this specific role" },
              { title: "Actionable Advice", desc: "Get specific, practical suggestions to improve your resume for the role" },
              { title: "ATS Compatibility Tips", desc: "Fix formatting issues that could cause ATS systems to misread your resume" },
              { title: "Overall Verdict", desc: "Get a clear Strong Fit / Moderate Fit / Weak Fit judgment instantly" }
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 p-6 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-100 dark:border-stone-800">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-stone-900 dark:text-stone-100 mb-1">{feature.title}</h4>
                  <p className="text-stone-500 dark:text-stone-400 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 bg-[#F5F4EF] dark:bg-stone-950">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 justify-center mb-12">
            <HelpCircle className="w-8 h-8 text-[#E07B00]" />
            <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100">Frequently Asked Questions</h2>
          </div>
          <div className="grid gap-6">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-stone-900 p-8 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
                <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-3">Q: {faq.q}</h4>
                <p className="text-stone-500 dark:text-stone-400 leading-relaxed">A: {faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA Section */}
      <section className="py-24 px-4 bg-white dark:bg-stone-900 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-stone-900 dark:text-stone-100 mb-6 tracking-tight">Ready to Land Your Dream Job?</h2>
          <p className="text-xl text-stone-500 dark:text-stone-400 mb-10 leading-relaxed">
            Stop sending resumes into the void. Analyze your resume now and find out exactly what&apos;s holding you back.
          </p>
          <button
            onClick={onBackToAnalyzer}
            className="group inline-flex items-center gap-3 px-10 py-5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-stone-900/20 dark:shadow-stone-100/10"
          >
            Analyze My Resume Now
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      <footer className="py-12 border-t border-stone-200 dark:border-stone-800 text-center bg-white dark:bg-stone-900">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          <span className="text-stone-400 dark:text-stone-500 text-sm">Built with ❤️ using Google Gemini AI</span>
        </div>
        <p className="text-stone-900 dark:text-stone-100 font-semibold mb-2">Designed by Sasi Vardhan</p>
        <p className="text-stone-400 dark:text-stone-500 text-xs">© {new Date().getFullYear()} ATS Resume Analyzer. Built for career success.</p>
      </footer>
    </div>
  );
}
