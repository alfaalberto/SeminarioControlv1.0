export interface Student {
  id: string;
  name: string;
  matricula: string;
}

export interface Professor {
  id: string; // Corresponds to Firebase Auth UID
  name: string;
  email: string;
  role: 'admin' | 'professor';
}

export interface Criterion {
  id: string;
  name: string;
  weight: number; // e.g., 20 for 20%
  description: string;
}

export interface SemesterCriteria {
  [key: string]: Criterion[];
}

export interface EvaluationScore {
  criterionId: string;
  score: number;
}

export interface Evaluation {
  id:string;
  studentId: string;
  professorId: string;
  semester: string;
  date: string; // ISO String format
  scores: EvaluationScore[];
  finalScore: number;
}

export interface Database {
  students: Student[];
  professors: Professor[];
  evaluations: Evaluation[];
}