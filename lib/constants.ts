import { Type } from "@google/genai";

export const ATS_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    matchScore: {
      type: Type.INTEGER,
      description: "Match score out of 100",
    },
    matchScoreReason: {
      type: Type.STRING,
      description: "A brief reason for the match score",
    },
    matchedKeywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Skills and keywords found in both resume and JD",
    },
    missingKeywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Important keywords from JD missing in the resume",
    },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Key strengths of the candidate for this role",
    },
    improvementSuggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Specific actionable advice to improve the resume match",
    },
    formatAnalysis: {
      type: Type.OBJECT,
      properties: {
        isAtsFriendly: { type: Type.BOOLEAN },
        layoutScore: { type: Type.INTEGER },
        issues: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Specific formatting issues like tables, complex columns, tiny fonts, special characters, or non-standard sections."
        },
        recommendations: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Actionable steps to fix formatting for ATS compatibility"
        }
      },
      required: ["isAtsFriendly", "layoutScore", "issues", "recommendations"],
      description: "Detailed analysis of the resume's physical format and layout compatibility with ATS systems."
    },
    atsCompatibilityTips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "General formatting or structure improvements for ATS compatibility",
    },
    overallVerdict: {
      type: Type.OBJECT,
      properties: {
        status: {
          type: Type.STRING,
          description: "Strong Fit, Moderate Fit, or Weak Fit",
        },
        reason: {
          type: Type.STRING,
          description: "One line reason for the verdict",
        }
      },
      required: ["status", "reason"],
    },
    summary: {
      type: Type.STRING,
      description: "A professional summary of the match",
    }
  },
  required: [
    "matchScore", 
    "matchScoreReason", 
    "matchedKeywords", 
    "missingKeywords", 
    "strengths", 
    "improvementSuggestions", 
    "formatAnalysis",
    "atsCompatibilityTips", 
    "overallVerdict", 
    "summary"
  ],
};

export const SYSTEM_INSTRUCTION = `You are an expert HR consultant and ATS (Applicant Tracking System) specialist. 
Your task is to analyze a RESUME against a JOB DESCRIPTION. 

CRITICAL: You must also perform a detailed FORMAT ANALYSIS. 
If the resume is provided as an image or PDF, look for:
1. Complex layouts (multiple columns, sidebars, or overlapping text that might be read incorrectly).
2. Tables (ATS often struggles with tables; recommend converting to simple text blocks).
3. Font sizes (too small or too large; recommend standard 10-12pt).
4. Special characters, non-standard bullet points, or icons that might break parsing.
5. Header/Footer usage (some ATS ignore these; recommend keeping contact info in the main body).
6. Non-standard section headings (use standard ones like 'Experience', 'Education').
7. Graphic elements or images (which can't be read by most ATS).

Be critical but constructive. Focus on hard skills, soft skills, certifications, and experience levels.
Provide a realistic match score and detailed feedback.
Keep the tone professional but encouraging.`;

export const COVER_LETTER_PROMPT = `You are a professional career coach. 
Based on the provided RESUME and JOB DESCRIPTION, generate a highly personalized, compelling cover letter.
The cover letter should:
1. Be professional, enthusiastic, and tailored to the specific role.
2. Highlight the candidate's most relevant achievements that match the JD requirements.
3. Address any potential gaps by focusing on transferable skills.
4. Use a modern, clean structure (Header, Salutation, Opening, Body Paragraphs, Call to Action, Closing).
5. Be approximately 300-400 words.
6. Use placeholders like [Hiring Manager Name] or [Company Name] if they are not clearly identifiable from the JD.

Return ONLY the text of the cover letter. Do not include any other commentary.`;
