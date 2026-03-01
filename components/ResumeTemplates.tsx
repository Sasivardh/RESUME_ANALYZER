'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  User, 
  Briefcase, 
  GraduationCap, 
  Wrench, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft,
  Layout,
  Check,
  FileText,
  Eye,
  RotateCcw,
  Save,
  Trash,
  Loader2
} from 'lucide-react';
import { jsPDF } from 'jspdf';

interface Experience {
  id: string;
  company: string;
  role: string;
  dates: string;
  description: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  dates: string;
  description: string;
}

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
  };
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
}

const INITIAL_DATA: ResumeData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
  },
  summary: '',
  experience: [
    { id: '1', company: '', role: '', dates: '', description: '' }
  ],
  education: [
    { id: '1', school: '', degree: '', dates: '', description: '' }
  ],
  skills: [''],
};

type TemplateType = 'modern' | 'classic' | 'minimal' | 'creative' | 'technical' | 'executive';

interface Template {
  id: TemplateType;
  name: string;
  description: string;
  previewColor: string;
}

const TEMPLATES: Template[] = [
  { id: 'modern', name: 'Modern Sidebar', description: 'Contemporary two-column layout with a sleek sidebar.', previewColor: 'bg-stone-900' },
  { id: 'classic', name: 'Classic Centered', description: 'Traditional centered layout with elegant serif typography.', previewColor: 'bg-stone-100' },
  { id: 'minimal', name: 'Ultra Minimal', description: 'Clean, single-column design with high-contrast simplicity.', previewColor: 'bg-white' },
  { id: 'creative', name: 'Creative Banner', description: 'Bold purple header with an asymmetrical sidebar layout.', previewColor: 'bg-purple-600' },
  { id: 'technical', name: 'Dev Terminal', description: 'Monospace grid layout with a technical command-line aesthetic.', previewColor: 'bg-emerald-950' },
  { id: 'executive', name: 'Senior Executive', description: 'Wide margins and refined indigo accents for leadership.', previewColor: 'bg-indigo-900' },
];

interface ResumePreviewProps {
  data: ResumeData;
  template: TemplateType;
}

const SectionHeader = ({ title, template }: { title: string; template: TemplateType }) => {
  const isMinimal = template === 'minimal';
  const isCreative = template === 'creative';
  const isTechnical = template === 'technical';
  const isExecutive = template === 'executive';

  if (isMinimal) {
    return (
      <div className="mb-4">
        <h2 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{title}</h2>
      </div>
    );
  }
  if (isCreative) {
    return (
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 bg-purple-600 rounded-full" />
        <h2 className="text-[10px] font-bold text-stone-900 dark:text-stone-100 uppercase tracking-widest">{title}</h2>
      </div>
    );
  }
  if (isTechnical) {
    return (
      <div className="mb-4">
        <h2 className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-tighter">{`// ${title}`}</h2>
        <div className="h-px bg-stone-100 dark:bg-stone-800 w-full mt-1" />
      </div>
    );
  }
  return (
    <div className="mb-4">
      <h2 className={`text-[10px] font-bold ${isExecutive ? 'text-indigo-900 dark:text-indigo-400' : 'text-stone-900 dark:text-stone-100'} uppercase tracking-widest mb-1`}>{title}</h2>
      <div className={`h-px ${isExecutive ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-stone-100 dark:bg-stone-800'} w-full`} />
    </div>
  );
};

const ResumePreview = ({ data, template }: ResumePreviewProps) => {
  const isModern = template === 'modern';
  const isClassic = template === 'classic';
  const isMinimal = template === 'minimal';
  const isCreative = template === 'creative';
  const isTechnical = template === 'technical';
  const isExecutive = template === 'executive';

  if (isModern) {
    // Modern: Two-Column Layout (Sidebar Left)
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-stone-900 shadow-sm min-h-full flex font-sans">
        {/* Sidebar */}
        <div className="w-1/3 bg-stone-50 dark:bg-stone-800/50 p-6 border-r border-stone-100 dark:border-stone-800">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4 leading-tight">
              {data.personalInfo.fullName || 'Your Name'}
            </h1>
            <div className="space-y-3 text-[9px] text-stone-500 dark:text-stone-400">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-[7px] font-bold text-stone-600">@</div>
                <span className="truncate">{data.personalInfo.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-[7px] font-bold text-stone-600">#</div>
                <span>{data.personalInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-[7px] font-bold text-stone-600">L</div>
                <span>{data.personalInfo.location}</span>
              </div>
            </div>
          </div>

          <div>
            <SectionHeader title="Skills" template={template} />
            <div className="flex flex-wrap gap-1">
              {data.skills.filter(Boolean).map((skill, i) => (
                <span key={i} className="px-2 py-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-[8px] text-stone-600 dark:text-stone-400">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-2/3 p-8">
          {data.summary && (
            <div className="mb-8">
              <SectionHeader title="About Me" template={template} />
              <p className="text-[10px] text-stone-600 dark:text-stone-400 leading-relaxed italic">
                {data.summary}
              </p>
            </div>
          )}

          <div className="mb-8">
            <SectionHeader title="Experience" template={template} />
            <div className="space-y-6">
              {data.experience.map((exp) => (
                <div key={exp.id} className="relative pl-4 border-l border-stone-100 dark:border-stone-800">
                  <div className="absolute -left-[4.5px] top-1 w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-600" />
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-[10px] font-bold text-stone-900 dark:text-stone-100">{exp.role}</h3>
                    <span className="text-[8px] text-stone-400">{exp.dates}</span>
                  </div>
                  <p className="text-[9px] font-medium text-stone-500 mb-2">{exp.company}</p>
                  <p className="text-[9px] text-stone-600 dark:text-stone-400 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHeader title="Education" template={template} />
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <h3 className="text-[10px] font-bold text-stone-900 dark:text-stone-100">{edu.degree}</h3>
                  <div className="flex justify-between text-[9px] text-stone-500">
                    <span>{edu.school}</span>
                    <span>{edu.dates}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isClassic) {
    // Classic: Centered, Elegant Serif
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-stone-900 shadow-sm min-h-full p-12 font-serif text-center">
        <div className="mb-10 border-b-2 border-stone-900 dark:border-stone-100 pb-6">
          <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-100 mb-4 tracking-widest uppercase">
            {data.personalInfo.fullName || 'Your Name'}
          </h1>
          <div className="flex justify-center gap-4 text-[10px] text-stone-600 dark:text-stone-400 italic">
            <span>{data.personalInfo.email}</span>
            <span>•</span>
            <span>{data.personalInfo.phone}</span>
            <span>•</span>
            <span>{data.personalInfo.location}</span>
          </div>
        </div>

        <div className="text-left space-y-8">
          {data.summary && (
            <section>
              <SectionHeader title="Professional Profile" template={template} />
              <p className="text-[11px] leading-relaxed text-stone-700 dark:text-stone-300 text-justify">
                {data.summary}
              </p>
            </section>
          )}

          <section>
            <SectionHeader title="Career History" template={template} />
            <div className="space-y-6">
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between font-bold text-[11px] mb-1">
                    <span>{exp.role.toUpperCase()}</span>
                    <span>{exp.dates}</span>
                  </div>
                  <div className="text-[10px] italic text-stone-600 mb-2">{exp.company}</div>
                  <p className="text-[10px] leading-relaxed text-stone-700 dark:text-stone-300">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-2 gap-8">
            <section>
              <SectionHeader title="Academic Background" template={template} />
              {data.education.map((edu) => (
                <div key={edu.id} className="mb-4">
                  <div className="font-bold text-[10px]">{edu.degree}</div>
                  <div className="text-[9px] text-stone-600 italic">{edu.school}</div>
                  <div className="text-[8px] text-stone-400">{edu.dates}</div>
                </div>
              ))}
            </section>
            <section>
              <SectionHeader title="Expertise" template={template} />
              <div className="flex flex-wrap gap-2">
                {data.skills.filter(Boolean).map((skill, i) => (
                  <span key={i} className="text-[10px] text-stone-700 dark:text-stone-300">• {skill}</span>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  if (isTechnical) {
    // Technical: Terminal/Grid Style
    return (
      <div className="max-w-2xl mx-auto bg-stone-950 shadow-sm min-h-full p-8 font-mono text-emerald-500">
        <div className="mb-10 border-b border-emerald-900/30 pb-6">
          <div className="text-[10px] mb-2 opacity-50">{`// User Profile`}</div>
          <h1 className="text-2xl font-bold mb-4">
            {`> ${data.personalInfo.fullName || 'ROOT'}`}
          </h1>
          <div className="grid grid-cols-2 gap-2 text-[9px] opacity-80">
            <div>{`EMAIL: ${data.personalInfo.email}`}</div>
            <div>{`PHONE: ${data.personalInfo.phone}`}</div>
            <div>{`LOC:   ${data.personalInfo.location}`}</div>
            <div>{`LINK:  ${data.personalInfo.linkedin}`}</div>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <SectionHeader title="System.Summary" template={template} />
            <p className="text-[10px] leading-relaxed opacity-90 border-l-2 border-emerald-900/50 pl-4">
              {data.summary}
            </p>
          </section>

          <section>
            <SectionHeader title="Deployment.History" template={template} />
            <div className="space-y-6">
              {data.experience.map((exp) => (
                <div key={exp.id} className="bg-emerald-950/20 p-4 rounded border border-emerald-900/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-[11px]">{`[ ${exp.role} ]`}</span>
                    <span className="text-[9px] opacity-50">{exp.dates}</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 mb-2">{`@ ${exp.company}`}</div>
                  <p className="text-[9px] opacity-80 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section>
              <SectionHeader title="Skills.Stack" template={template} />
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {data.skills.filter(Boolean).map((skill, i) => (
                  <div key={i} className="text-[9px] flex items-center gap-2">
                    <span className="text-emerald-900">[*]</span> {skill}
                  </div>
                ))}
              </div>
            </section>
            <section>
              <SectionHeader title="Education.Log" template={template} />
              {data.education.map((edu) => (
                <div key={edu.id} className="mb-2 text-[9px]">
                  <div className="font-bold">{edu.degree}</div>
                  <div className="opacity-60">{edu.school}</div>
                </div>
              ))}
            </section>
          </div>
        </div>
      </div>
    );
  }

  if (isCreative) {
    // Creative: Sidebar Right + Bold Header
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-stone-900 shadow-sm min-h-full flex flex-col font-sans">
        <div className="bg-purple-600 p-10 text-white">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
            {data.personalInfo.fullName || 'Your Name'}
          </h1>
          <div className="flex gap-4 text-xs text-purple-100">
            <span>{data.personalInfo.email}</span>
            <span>{data.personalInfo.phone}</span>
          </div>
        </div>
        
        <div className="flex flex-1">
          <div className="flex-1 p-8">
            {data.summary && (
              <div className="mb-10">
                <SectionHeader title="The Story" template={template} />
                <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                  {data.summary}
                </p>
              </div>
            )}
            
            <div className="mb-10">
              <SectionHeader title="Experience" template={template} />
              <div className="space-y-8">
                {data.experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xs font-bold text-purple-600">{exp.role}</h3>
                      <span className="text-[9px] px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full font-bold">{exp.dates}</span>
                    </div>
                    <p className="text-[10px] font-bold text-stone-900 dark:text-stone-100 mb-2">{exp.company}</p>
                    <p className="text-[10px] text-stone-600 dark:text-stone-400 leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-1/4 bg-stone-50 dark:bg-stone-800/30 p-8 border-l border-stone-100 dark:border-stone-800">
            <div className="mb-10">
              <SectionHeader title="Skills" template={template} />
              <div className="space-y-2">
                {data.skills.filter(Boolean).map((skill, i) => (
                  <div key={i} className="text-[10px] text-stone-600 dark:text-stone-400 flex items-center gap-2">
                    <div className="w-1 h-1 bg-purple-400 rounded-full" />
                    {skill}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <SectionHeader title="Education" template={template} />
              {data.education.map((edu) => (
                <div key={edu.id} className="mb-4">
                  <div className="text-[10px] font-bold text-stone-900 dark:text-stone-100">{edu.degree}</div>
                  <div className="text-[9px] text-stone-500">{edu.school}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isExecutive) {
    // Executive: Wide Margins, Refined Indigo
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-stone-900 shadow-sm min-h-full p-16 font-sans">
        <div className="flex justify-between items-start mb-12 border-b-4 border-indigo-900 dark:border-indigo-500 pb-8">
          <div>
            <h1 className="text-4xl font-light text-indigo-900 dark:text-indigo-400 tracking-tight mb-2">
              {data.personalInfo.fullName || 'Your Name'}
            </h1>
            <p className="text-xs text-stone-500 uppercase tracking-widest font-medium">Strategic Business Leader</p>
          </div>
          <div className="text-right text-[10px] text-stone-500 space-y-1">
            <p>{data.personalInfo.email}</p>
            <p>{data.personalInfo.phone}</p>
            <p>{data.personalInfo.location}</p>
          </div>
        </div>

        <div className="space-y-12">
          {data.summary && (
            <section>
              <SectionHeader title="Executive Profile" template={template} />
              <p className="text-[11px] leading-relaxed text-stone-700 dark:text-stone-300 font-medium">
                {data.summary}
              </p>
            </section>
          )}

          <section>
            <SectionHeader title="Professional Experience" template={template} />
            <div className="space-y-10">
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-3">
                    <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-400 uppercase tracking-wide">{exp.role}</h3>
                    <span className="text-[10px] font-bold text-stone-400">{exp.dates}</span>
                  </div>
                  <p className="text-[11px] font-bold text-stone-900 dark:text-stone-100 mb-3">{exp.company}</p>
                  <p className="text-[11px] leading-relaxed text-stone-600 dark:text-stone-400">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-2 gap-12">
            <section>
              <SectionHeader title="Core Competencies" template={template} />
              <div className="grid grid-cols-1 gap-2">
                {data.skills.filter(Boolean).map((skill, i) => (
                  <div key={i} className="text-[10px] text-stone-700 dark:text-stone-300 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-indigo-900 dark:bg-indigo-500" />
                    {skill}
                  </div>
                ))}
              </div>
            </section>
            <section>
              <SectionHeader title="Education" template={template} />
              {data.education.map((edu) => (
                <div key={edu.id} className="mb-6">
                  <div className="text-[11px] font-bold text-indigo-900 dark:text-indigo-400">{edu.degree}</div>
                  <div className="text-[10px] text-stone-500">{edu.school}</div>
                  <div className="text-[9px] text-stone-400">{edu.dates}</div>
                </div>
              ))}
            </section>
          </div>
        </div>
      </div>
    );
  }

  // Minimal (Default)
  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-stone-900 shadow-sm min-h-full p-12 font-sans">
      <div className="mb-12">
        <h1 className="text-3xl font-light text-stone-900 dark:text-stone-100 mb-4 tracking-tight">
          {data.personalInfo.fullName || 'Your Name'}
        </h1>
        <div className="flex flex-wrap gap-6 text-[10px] text-stone-400">
          <span>{data.personalInfo.email}</span>
          <span>{data.personalInfo.phone}</span>
          <span>{data.personalInfo.location}</span>
        </div>
      </div>

      <div className="space-y-10">
        {data.summary && (
          <section>
            <SectionHeader title="Summary" template={template} />
            <p className="text-[11px] text-stone-500 leading-relaxed">
              {data.summary}
            </p>
          </section>
        )}

        <section>
          <SectionHeader title="Experience" template={template} />
          <div className="space-y-8">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-[11px] font-bold text-stone-800 dark:text-stone-200">{exp.role}</h3>
                  <span className="text-[10px] text-stone-400">{exp.dates}</span>
                </div>
                <p className="text-[10px] text-stone-400 mb-2">{exp.company}</p>
                <p className="text-[11px] text-stone-500 leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-12">
          <section>
            <SectionHeader title="Education" template={template} />
            {data.education.map((edu) => (
              <div key={edu.id} className="mb-4">
                <div className="text-[11px] font-bold text-stone-800 dark:text-stone-200">{edu.degree}</div>
                <div className="text-[10px] text-stone-400">{edu.school}</div>
              </div>
            ))}
          </section>
          <section>
            <SectionHeader title="Skills" template={template} />
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {data.skills.filter(Boolean).map((skill, i) => (
                <span key={i} className="text-[11px] text-stone-500">{skill}</span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default function ResumeTemplates({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<'select' | 'preview-template' | 'fill' | 'preview'>('select');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern');
  const [data, setData] = useState<ResumeData>(INITIAL_DATA);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [hasDraft, setHasDraft] = useState(false);

  // Load draft on mount
  React.useEffect(() => {
    const savedDraft = localStorage.getItem('resume_draft');
    if (savedDraft) {
      try {
        const { data: draftData, template } = JSON.parse(savedDraft);
        setData(draftData);
        setSelectedTemplate(template);
        setHasDraft(true);
      } catch (e) {
        console.error('Failed to load draft', e);
      }
    }
  }, []);

  const saveDraft = () => {
    setSaveStatus('saving');
    localStorage.setItem('resume_draft', JSON.stringify({ data, template: selectedTemplate }));
    setHasDraft(true);
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  const clearDraft = () => {
    if (confirm('Are you sure you want to clear your draft and start fresh?')) {
      localStorage.removeItem('resume_draft');
      setData(INITIAL_DATA);
      setHasDraft(false);
      setStep('select');
    }
  };

  const handleAddExperience = () => {
    setData(prev => ({
      ...prev,
      experience: [...prev.experience, { id: Date.now().toString(), company: '', role: '', dates: '', description: '' }]
    }));
  };

  const handleRemoveExperience = (id: string) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const handleAddEducation = () => {
    setData(prev => ({
      ...prev,
      education: [...prev.education, { id: Date.now().toString(), school: '', degree: '', dates: '', description: '' }]
    }));
  };

  const handleRemoveEducation = (id: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const handleAddSkill = () => {
    setData(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }));
  };

  const handleRemoveSkill = (index: number) => {
    setData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

    const handleDownloadPDF = async () => {
      setIsGenerating(true);
      const doc = new jsPDF({
        format: 'a4',
        unit: 'mm',
      });
  
      const margin = 20;
      let y = margin;
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - (margin * 2);
  
      // Helper for text wrapping
      const addWrappedText = (text: string, fontSize: number, style: 'normal' | 'bold' | 'italic' = 'normal', color: [number, number, number] = [0, 0, 0], align: 'left' | 'center' | 'right' = 'left', customX?: number, customWidth?: number) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', style);
        doc.setTextColor(color[0], color[1], color[2]);
        const targetWidth = customWidth || (align === 'center' ? contentWidth : (customX ? pageWidth - margin - customX : contentWidth));
        const lines = doc.splitTextToSize(text, targetWidth);
        const targetX = customX || margin;
        
        if (align === 'center') {
          doc.text(lines, pageWidth / 2, y, { align: 'center' });
        } else if (align === 'right') {
          doc.text(lines, pageWidth - margin, y, { align: 'right' });
        } else {
          doc.text(lines, targetX, y);
        }
        y += (lines.length * (fontSize * 0.4)) + 2;
      };
  
      const drawSectionHeader = (title: string, template: TemplateType, customX?: number) => {
        const targetX = customX || margin;
        if (template === 'minimal') {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(150, 150, 150);
          doc.text(title.toUpperCase(), targetX, y);
          y += 4;
          return;
        }
        
        if (template === 'creative') {
          doc.setFillColor(147, 51, 234); // Purple
          doc.rect(targetX, y - 5, 4, 6, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text(title.toUpperCase(), targetX + 6, y);
          y += 4;
          return;
        }

        if (template === 'technical') {
          doc.setFont('courier', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(16, 185, 129); // Emerald 500
          doc.text(`// ${title.toUpperCase()}`, targetX, y);
          y += 2;
          doc.setDrawColor(20, 83, 45); // Emerald 900
          doc.line(targetX, y, pageWidth - margin, y);
          y += 6;
          return;
        }

        if (template === 'modern') {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);
          doc.text(title.toUpperCase(), targetX, y);
          y += 2;
          doc.setDrawColor(230, 230, 230);
          doc.line(targetX, y, targetX + (customX ? pageWidth - margin - customX : contentWidth), y);
          y += 6;
          return;
        }
  
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(title.toUpperCase(), targetX, y);
        y += 2;
        doc.setLineWidth(0.5);
        doc.line(targetX, y, pageWidth - margin, y);
        y += 6;
      };
  
      // Template specific styling logic
      if (selectedTemplate === 'modern') {
        // Modern: Two-Column Layout
        const sidebarWidth = 60;
        const mainX = margin + sidebarWidth + 10;
        const mainWidth = pageWidth - margin - mainX;

        // Sidebar Background
        doc.setFillColor(245, 245, 245);
        doc.rect(0, 0, margin + sidebarWidth, doc.internal.pageSize.getHeight(), 'F');

        // Sidebar Content
        y = margin;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(0, 0, 0);
        const nameLines = doc.splitTextToSize(data.personalInfo.fullName.toUpperCase(), sidebarWidth);
        doc.text(nameLines, margin, y);
        y += (nameLines.length * 10) + 5;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        if (data.personalInfo.email) { doc.text(data.personalInfo.email, margin, y); y += 5; }
        if (data.personalInfo.phone) { doc.text(data.personalInfo.phone, margin, y); y += 5; }
        if (data.personalInfo.location) { doc.text(data.personalInfo.location, margin, y); y += 15; }

        drawSectionHeader('Skills', 'modern', margin);
        const skillsText = data.skills.filter(Boolean).join(', ');
        addWrappedText(skillsText, 9, 'normal', [100, 100, 100], 'left', margin, sidebarWidth);

        // Main Content
        y = margin;
        if (data.summary) {
          drawSectionHeader('About Me', 'modern', mainX);
          addWrappedText(data.summary, 10, 'italic', [80, 80, 80], 'left', mainX, mainWidth);
          y += 5;
        }

        drawSectionHeader('Experience', 'modern', mainX);
        data.experience.forEach(exp => {
          if (!exp.company && !exp.role) return;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.text(exp.role, mainX, y);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.text(exp.dates, pageWidth - margin, y, { align: 'right' });
          y += 5;
          doc.setFont('helvetica', 'bold');
          doc.text(exp.company, mainX, y);
          y += 5;
          addWrappedText(exp.description, 9, 'normal', [80, 80, 80], 'left', mainX, mainWidth);
          y += 5;
        });

        drawSectionHeader('Education', 'modern', mainX);
        data.education.forEach(edu => {
          if (!edu.school && !edu.degree) return;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text(edu.degree, mainX, y);
          y += 5;
          doc.setFont('helvetica', 'normal');
          doc.text(edu.school, mainX, y);
          doc.text(edu.dates, pageWidth - margin, y, { align: 'right' });
          y += 10;
        });

      } else if (selectedTemplate === 'classic') {
        // Classic: Centered Header, Times font
        doc.setFont('times', 'bold');
        doc.setFontSize(28);
        doc.text(data.personalInfo.fullName.toUpperCase(), pageWidth / 2, y, { align: 'center' });
        y += 10;
        
        doc.setFontSize(10);
        doc.setFont('times', 'normal');
        const contact = [data.personalInfo.email, data.personalInfo.phone, data.personalInfo.location].filter(Boolean).join('  •  ');
        doc.text(contact, pageWidth / 2, y, { align: 'center' });
        y += 5;
        const links = [data.personalInfo.linkedin, data.personalInfo.website].filter(Boolean).join('  •  ');
        if (links) {
          doc.text(links, pageWidth / 2, y, { align: 'center' });
          y += 10;
        } else {
          y += 5;
        }

        if (data.summary) {
          drawSectionHeader('Professional Profile', 'classic');
          addWrappedText(data.summary, 11, 'normal', [0, 0, 0], 'center');
          y += 5;
        }

        drawSectionHeader('Career History', 'classic');
        data.experience.forEach(exp => {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.text(exp.role.toUpperCase(), margin, y);
          doc.text(exp.dates, pageWidth - margin, y, { align: 'right' });
          y += 5;
          doc.setFont('helvetica', 'italic');
          doc.text(exp.company, margin, y);
          y += 5;
          addWrappedText(exp.description, 10, 'normal');
          y += 5;
        });

        drawSectionHeader('Academic Background', 'classic');
        data.education.forEach(edu => {
          doc.setFont('helvetica', 'bold');
          doc.text(edu.degree, margin, y);
          doc.text(edu.dates, pageWidth - margin, y, { align: 'right' });
          y += 5;
          doc.setFont('helvetica', 'italic');
          doc.text(edu.school, margin, y);
          y += 10;
        });

        drawSectionHeader('Expertise', 'classic');
        addWrappedText(data.skills.filter(Boolean).join('  •  '), 10, 'normal', [0, 0, 0], 'center');

      } else if (selectedTemplate === 'technical') {
        // Technical: Terminal Style
        doc.setFillColor(10, 10, 10);
        doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
        doc.setTextColor(16, 185, 129); // Emerald 500
        
        doc.setFont('courier', 'bold');
        doc.setFontSize(24);
        doc.text(`> ${data.personalInfo.fullName.toUpperCase()}`, margin, y);
        y += 10;
        doc.setFontSize(10);
        doc.text(`[ ${data.personalInfo.email} | ${data.personalInfo.phone} | ${data.personalInfo.location} ]`, margin, y);
        y += 15;

        if (data.summary) {
          drawSectionHeader('System.Summary', 'technical');
          addWrappedText(data.summary, 10, 'normal', [16, 185, 129]);
          y += 5;
        }

        drawSectionHeader('Deployment.History', 'technical');
        data.experience.forEach(exp => {
          doc.setFont('courier', 'bold');
          doc.text(`[ ${exp.role} ]`, margin, y);
          doc.text(exp.dates, pageWidth - margin, y, { align: 'right' });
          y += 5;
          doc.text(`@ ${exp.company}`, margin, y);
          y += 5;
          addWrappedText(exp.description, 9, 'normal', [16, 185, 129]);
          y += 5;
        });

        drawSectionHeader('Skills.Stack', 'technical');
        addWrappedText(data.skills.filter(Boolean).join(', '), 10, 'normal', [16, 185, 129]);
        y += 10;

        drawSectionHeader('Education.Log', 'technical');
        data.education.forEach(edu => {
          doc.setFont('courier', 'bold');
          doc.text(edu.degree, margin, y);
          y += 5;
          doc.setFont('courier', 'normal');
          doc.text(edu.school, margin, y);
          y += 10;
        });

      } else if (selectedTemplate === 'creative') {
        // Creative: Bold Banner + Sidebar Right
        const mainWidth = contentWidth * 0.7;
        const sidebarX = margin + mainWidth + 10;
        const sidebarWidth = pageWidth - margin - sidebarX;

        doc.setFillColor(147, 51, 234);
        doc.rect(0, 0, pageWidth, 45, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(36);
        doc.text(data.personalInfo.fullName.toUpperCase(), margin, 25);
        doc.setFontSize(12);
        doc.text(`${data.personalInfo.email}  |  ${data.personalInfo.phone}`, margin, 35);
        
        y = 60;
        doc.setTextColor(0, 0, 0);

        // Main Content
        if (data.summary) {
          drawSectionHeader('The Story', 'creative', margin);
          addWrappedText(data.summary, 11, 'normal', [50, 50, 50], 'left', margin, mainWidth);
          y += 10;
        }

        drawSectionHeader('Experience', 'creative', margin);
        data.experience.forEach(exp => {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(147, 51, 234);
          doc.text(exp.role, margin, y);
          doc.setFontSize(9);
          doc.text(exp.dates, margin + mainWidth, y, { align: 'right' });
          y += 5;
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'bold');
          doc.text(exp.company, margin, y);
          y += 5;
          addWrappedText(exp.description, 10, 'normal', [50, 50, 50], 'left', margin, mainWidth);
          y += 8;
        });

        // Sidebar
        let sidebarY = 60;
        const drawSidebarHeader = (title: string) => {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(147, 51, 234);
          doc.text(title.toUpperCase(), sidebarX, sidebarY);
          sidebarY += 5;
        };

        drawSidebarHeader('Skills');
        data.skills.filter(Boolean).forEach(skill => {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.text(`• ${skill}`, sidebarX, sidebarY);
          sidebarY += 5;
        });
        sidebarY += 10;

        drawSidebarHeader('Education');
        data.education.forEach(edu => {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
          doc.text(edu.degree, sidebarX, sidebarY);
          sidebarY += 4;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(edu.school, sidebarX, sidebarY);
          sidebarY += 8;
        });

      } else if (selectedTemplate === 'executive') {
        // Executive: Wide Margins, Refined
        const execMargin = 30;
        const execWidth = pageWidth - (execMargin * 2);
        y = execMargin;

        doc.setTextColor(49, 46, 129); // Indigo 900
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(32);
        doc.text(data.personalInfo.fullName.toUpperCase(), execMargin, y);
        y += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('STRATEGIC BUSINESS LEADER', execMargin, y);
        y += 10;
        doc.setDrawColor(49, 46, 129);
        doc.setLineWidth(1.5);
        doc.line(execMargin, y, pageWidth - execMargin, y);
        y += 10;

        doc.setFontSize(9);
        doc.text(`${data.personalInfo.email}  |  ${data.personalInfo.phone}  |  ${data.personalInfo.location}`, pageWidth - execMargin, y - 15, { align: 'right' });

        if (data.summary) {
          drawSectionHeader('Executive Profile', 'executive', execMargin);
          addWrappedText(data.summary, 11, 'bold', [50, 50, 50], 'left', execMargin, execWidth);
          y += 10;
        }

        drawSectionHeader('Professional Experience', 'executive', execMargin);
        data.experience.forEach(exp => {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(49, 46, 129);
          doc.text(exp.role.toUpperCase(), execMargin, y);
          doc.setTextColor(150, 150, 150);
          doc.text(exp.dates, pageWidth - execMargin, y, { align: 'right' });
          y += 5;
          doc.setTextColor(0, 0, 0);
          doc.text(exp.company, execMargin, y);
          y += 5;
          addWrappedText(exp.description, 11, 'normal', [80, 80, 80], 'left', execMargin, execWidth);
          y += 10;
        });

        drawSectionHeader('Core Competencies', 'executive', execMargin);
        addWrappedText(data.skills.filter(Boolean).join('  |  '), 10, 'normal', [50, 50, 50], 'left', execMargin, execWidth);

      } else {
        // Minimal (Default)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(32);
        doc.text(data.personalInfo.fullName, margin, y);
        y += 15;
        
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`${data.personalInfo.email}   ${data.personalInfo.phone}   ${data.personalInfo.location}`, margin, y);
        y += 20;
  
        if (data.summary) {
          drawSectionHeader('Summary', 'minimal');
          addWrappedText(data.summary, 11, 'normal', [100, 100, 100]);
          y += 10;
        }
  
        drawSectionHeader('Experience', 'minimal');
        data.experience.forEach(exp => {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(50, 50, 50);
          doc.text(exp.role, margin, y);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(150, 150, 150);
          doc.text(exp.dates, pageWidth - margin, y, { align: 'right' });
          y += 5;
          doc.text(exp.company, margin, y);
          y += 8;
          addWrappedText(exp.description, 11, 'normal', [100, 100, 100]);
          y += 10;
        });
  
        drawSectionHeader('Education', 'minimal');
        data.education.forEach(edu => {
          doc.setFont('helvetica', 'bold');
          doc.text(edu.degree, margin, y);
          y += 5;
          doc.setFont('helvetica', 'normal');
          doc.text(edu.school, margin, y);
          y += 10;
        });
  
        drawSectionHeader('Skills', 'minimal');
        addWrappedText(data.skills.filter(Boolean).join(', '), 11, 'normal', [100, 100, 100]);
      }
  
      doc.save(`${data.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`);
      setIsGenerating(false);
    };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-12 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors mb-4 group"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-bold uppercase tracking-wider">Back to Home</span>
          </button>
          <h2 className="text-4xl font-bold text-stone-900 dark:text-stone-100 mb-2">Resume Templates</h2>
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-stone-500 dark:text-stone-400">Choose a template, fill in your details, and download your ATS-friendly resume.</p>
            {hasDraft && step === 'select' && (
              <button
                onClick={clearDraft}
                className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all border border-rose-100 dark:border-rose-900/50"
              >
                <Trash className="w-3.5 h-3.5" /> Clear Draft
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[
            { id: 'select', label: '1. Select' },
            { id: 'preview-template', label: '2. Preview' },
            { id: 'fill', label: '3. Fill' },
            { id: 'preview', label: '4. Download' }
          ].map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${step === s.id ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900' : 'bg-stone-200 dark:bg-stone-800 text-stone-500'}`}>
                {s.label}
              </div>
              {i < 3 && <ChevronRight className="w-4 h-4 text-stone-300 mx-1 flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template.id);
                  setStep('preview-template');
                }}
                className={`group relative p-6 bg-white dark:bg-stone-900 border-2 rounded-3xl text-left transition-all hover:shadow-xl ${selectedTemplate === template.id ? 'border-stone-900 dark:border-stone-100' : 'border-stone-100 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'}`}
              >
                <div className={`w-full aspect-[3/4] rounded-xl mb-6 overflow-hidden ${template.previewColor} opacity-20 group-hover:opacity-30 transition-opacity flex items-center justify-center`}>
                  <FileText className="w-24 h-24 text-stone-900 dark:text-white opacity-20" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">{template.name}</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">{template.description}</p>
                <div className="flex items-center text-sm font-bold text-stone-900 dark:text-stone-100">
                  Preview Template <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </motion.div>
        )}

        {step === 'preview-template' && (
          <motion.div
            key="preview-template"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center"
          >
            <div className="w-full max-w-4xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 md:p-12 shadow-2xl mb-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${TEMPLATES.find(t => t.id === selectedTemplate)?.previewColor} flex items-center justify-center`}>
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100">{TEMPLATES.find(t => t.id === selectedTemplate)?.name}</h3>
                    <p className="text-stone-500 dark:text-stone-400">Previewing the layout with sample data.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep('select')}
                    className="px-6 py-3 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 font-bold transition-all"
                  >
                    Back to Selection
                  </button>
                  <button
                    onClick={() => setStep('fill')}
                    className="flex items-center gap-2 px-8 py-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full font-bold hover:opacity-90 transition-all shadow-xl shadow-stone-900/10"
                  >
                    Use this Template <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="aspect-[1/1.414] w-full bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-100 dark:border-stone-700 p-4 md:p-8 overflow-y-auto">
                <ResumePreview 
                  template={selectedTemplate}
                  data={{
                    personalInfo: {
                      fullName: 'ALEX RIVERA',
                      email: 'alex.rivera@example.com',
                      phone: '+1 (555) 123-4567',
                      location: 'San Francisco, CA',
                      linkedin: 'linkedin.com/in/alexrivera',
                      website: 'alexrivera.design'
                    },
                    summary: 'Innovative Product Designer with 8+ years of experience in creating user-centric digital experiences. Proven track record of leading design teams and delivering high-impact solutions for Fortune 500 companies.',
                    experience: [
                      {
                        id: '1',
                        role: 'Senior Product Designer',
                        company: 'TechCorp Solutions',
                        dates: '2020 - Present',
                        description: 'Led the redesign of the core SaaS platform, increasing user retention by 35%. Established a comprehensive design system used across 4 product lines.'
                      },
                      {
                        id: '2',
                        role: 'UX Designer',
                        company: 'Creative Pulse Agency',
                        dates: '2017 - 2020',
                        description: 'Developed interactive prototypes and conducted user research for diverse clients in the fintech and healthcare sectors.'
                      }
                    ],
                    education: [
                      {
                        id: '1',
                        degree: 'BFA in Graphic Design',
                        school: 'Rhode Island School of Design',
                        dates: '2013 - 2017',
                        description: 'Graduated with honors.'
                      }
                    ],
                    skills: ['Figma', 'Adobe Creative Suite', 'React', 'UI/UX Design', 'User Research', 'Design Systems', 'Prototyping']
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {step === 'fill' && (
          <motion.div
            key="fill"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12"
          >
            {/* Personal Info */}
            <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                  <User className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                </div>
                <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Personal Information</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { label: 'Full Name', key: 'fullName', placeholder: 'John Doe' },
                  { label: 'Email Address', key: 'email', placeholder: 'john@example.com' },
                  { label: 'Phone Number', key: 'phone', placeholder: '+1 (555) 000-0000' },
                  { label: 'Location', key: 'location', placeholder: 'New York, NY' },
                  { label: 'LinkedIn URL', key: 'linkedin', placeholder: 'linkedin.com/in/johndoe' },
                  { label: 'Portfolio/Website', key: 'website', placeholder: 'johndoe.com' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2">{field.label}</label>
                    <input
                      type="text"
                      value={(data.personalInfo as any)[field.key]}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, [field.key]: e.target.value }
                      }))}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 outline-none transition-all"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Summary */}
            <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                </div>
                <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Professional Summary</h3>
              </div>
              <textarea
                value={data.summary}
                onChange={(e) => setData(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Briefly describe your professional background and key achievements..."
                className="w-full h-32 px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 outline-none transition-all resize-none"
              />
            </section>

            {/* Experience */}
            <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Work Experience</h3>
                </div>
                <button
                  onClick={handleAddExperience}
                  className="flex items-center gap-2 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-bold hover:opacity-90 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Role
                </button>
              </div>
              <div className="space-y-8">
                {data.experience.map((exp, index) => (
                  <div key={exp.id} className="relative p-6 bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-700 rounded-2xl">
                    {data.experience.length > 1 && (
                      <button
                        onClick={() => handleRemoveExperience(exp.id)}
                        className="absolute top-4 right-4 p-2 text-stone-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2">Company Name</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const newExp = [...data.experience];
                            newExp[index].company = e.target.value;
                            setData(prev => ({ ...prev, experience: newExp }));
                          }}
                          placeholder="Google"
                          className="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2">Job Title</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => {
                            const newExp = [...data.experience];
                            newExp[index].role = e.target.value;
                            setData(prev => ({ ...prev, experience: newExp }));
                          }}
                          placeholder="Senior Product Designer"
                          className="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2">Dates</label>
                        <input
                          type="text"
                          value={exp.dates}
                          onChange={(e) => {
                            const newExp = [...data.experience];
                            newExp[index].dates = e.target.value;
                            setData(prev => ({ ...prev, experience: newExp }));
                          }}
                          placeholder="Jan 2020 - Present"
                          className="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2">Description / Achievements</label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => {
                          const newExp = [...data.experience];
                          newExp[index].description = e.target.value;
                          setData(prev => ({ ...prev, experience: newExp }));
                        }}
                        placeholder="Led the redesign of the core product, resulting in a 25% increase in user engagement..."
                        className="w-full h-32 px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Education */}
            <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Education</h3>
                </div>
                <button
                  onClick={handleAddEducation}
                  className="flex items-center gap-2 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-bold hover:opacity-90 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Education
                </button>
              </div>
              <div className="space-y-8">
                {data.education.map((edu, index) => (
                  <div key={edu.id} className="relative p-6 bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-700 rounded-2xl">
                    {data.education.length > 1 && (
                      <button
                        onClick={() => handleRemoveEducation(edu.id)}
                        className="absolute top-4 right-4 p-2 text-stone-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2">Institution</label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => {
                            const newEdu = [...data.education];
                            newEdu[index].school = e.target.value;
                            setData(prev => ({ ...prev, education: newEdu }));
                          }}
                          placeholder="Stanford University"
                          className="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2">Degree</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const newEdu = [...data.education];
                            newEdu[index].degree = e.target.value;
                            setData(prev => ({ ...prev, education: newEdu }));
                          }}
                          placeholder="B.S. in Computer Science"
                          className="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2">Dates</label>
                        <input
                          type="text"
                          value={edu.dates}
                          onChange={(e) => {
                            const newEdu = [...data.education];
                            newEdu[index].dates = e.target.value;
                            setData(prev => ({ ...prev, education: newEdu }));
                          }}
                          placeholder="2016 - 2020"
                          className="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2">Description / Honors</label>
                      <textarea
                        value={edu.description}
                        onChange={(e) => {
                          const newEdu = [...data.education];
                          newEdu[index].description = e.target.value;
                          setData(prev => ({ ...prev, education: newEdu }));
                        }}
                        placeholder="Graduated with honors, GPA 3.8/4.0..."
                        className="w-full h-24 px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Skills */}
            <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Skills</h3>
                </div>
                <button
                  onClick={handleAddSkill}
                  className="flex items-center gap-2 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-bold hover:opacity-90 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Skill
                </button>
              </div>
              <div className="flex flex-wrap gap-4">
                {data.skills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => {
                        const newSkills = [...data.skills];
                        newSkills[index] = e.target.value;
                        setData(prev => ({ ...prev, skills: newSkills }));
                      }}
                      placeholder="React"
                      className="bg-transparent outline-none text-sm font-medium text-stone-900 dark:text-stone-100 w-24"
                    />
                    <button
                      onClick={() => handleRemoveSkill(index)}
                      className="text-stone-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex items-center justify-between pt-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setStep('select')}
                  className="flex items-center gap-2 px-6 py-3 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 font-bold transition-all"
                >
                  <ChevronLeft className="w-5 h-5" /> Back to Templates
                </button>
                <button
                  onClick={saveDraft}
                  disabled={saveStatus === 'saving'}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all border ${saveStatus === 'saved' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-900 dark:hover:border-stone-100'}`}
                >
                  {saveStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : saveStatus === 'saved' ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Draft Saved' : 'Save to Draft'}
                </button>
              </div>
              <button
                onClick={() => setStep('preview')}
                className="flex items-center gap-2 px-8 py-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full font-bold hover:opacity-90 transition-all shadow-xl shadow-stone-900/10"
              >
                Preview & Download <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'preview' && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center"
          >
            <div className="w-full max-w-4xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-12 shadow-2xl mb-12">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
                    <Check className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Resume Ready!</h3>
                    <p className="text-stone-500 dark:text-stone-400">Your ATS-friendly resume is generated and ready for download.</p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50"
                >
                  {isGenerating ? <Layout className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                  Download PDF
                </button>
              </div>

              <div className="aspect-[1/1.414] w-full bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-100 dark:border-stone-700 p-8 overflow-y-auto">
                <ResumePreview 
                  template={selectedTemplate}
                  data={data}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setStep('fill')}
                className="flex items-center gap-2 px-6 py-3 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 font-bold transition-all"
              >
                <ChevronLeft className="w-5 h-5" /> Edit Details
              </button>
              <button
                onClick={saveDraft}
                className="flex items-center gap-2 px-6 py-3 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 font-bold transition-all"
              >
                <Save className="w-5 h-5" /> Save Draft
              </button>
              <button
                onClick={clearDraft}
                className="flex items-center gap-2 px-6 py-3 text-stone-400 hover:text-rose-500 font-bold transition-all"
              >
                <Trash className="w-5 h-5" /> Clear Draft
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
