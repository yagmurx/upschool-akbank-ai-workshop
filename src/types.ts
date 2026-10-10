export type CandidateLevel = 'intern_student' | 'new_grad' | 'junior' | 'mid' | 'senior';

export interface InterviewerPersona {
  perspective: string;
  keyPriorities: string[];
  evaluationFocus: string;
  redFlags: string[];
}

export interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  whyInterviewerAsks: string;
  whatToHighlight: string[];
  sampleAnswer: string;
  difficultyLevel: string;
}

export interface StarBreakdown {
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface AnswerEvaluation {
  score: number;
  summary: string;
  starBreakdown: StarBreakdown;
  strengths: string[];
  improvementAreas: string[];
  coachTip: string;
  improvedVersion: string;
}

export interface InterviewResult {
  interviewerPersona: InterviewerPersona;
  questions: InterviewQuestion[];
}

export interface PortfolioProjectIdea {
  projectName: string;
  description: string;
  techStack: string[];
  interviewShowcaseValue: string;
}

export interface RecommendedTraining {
  id: string;
  title: string;
  priority: 'Kritik & Öncelikli' | 'Önemli Gelişim' | 'İleri Seviye Fark Yaratıcı' | string;
  estimatedDuration: string;
  reasonWhy: string;
  keySyllabusModules: string[];
  recommendedLearningSources: string[];
  portfolioProjectIdea: PortfolioProjectIdea;
}

export interface WeeklyRoadmapItem {
  weekRange: string;
  focus: string;
  milestoneGoal: string;
  checklist: string[];
}

export interface CurriculumAnalysisResult {
  currentSkillProfile: {
    masteredSkills: string[];
    emergingSkills: string[];
    overallAssessment: string;
  };
  gapAnalysis: {
    missingCriticalSkills: string[];
    industryExpectations: string[];
    blindSpotsSummary: string;
  };
  nextStepTrainings: RecommendedTraining[];
  weeklyRoadmap: WeeklyRoadmapItem[];
}
