
export enum LessonId {
  Intro = 'intro',
  Variables = 'variables',
  Conditionals = 'conditionals',
  ForLoops = 'for-loops',
  WhileLoops = 'while-loops',
  ListsTuples = 'lists-tuples',
  FunctionsMath = 'functions-math',
  ListMethods = 'list-methods',
  StdLib = 'std-lib',
  Project = 'project'
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  questions: Question[];
}

export interface Lesson {
  id: LessonId;
  title: string;
  content: string;
  examples: string[]; // تم التغيير من defaultCode إلى مصفوفة أمثلة
  quiz?: Quiz;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  text: string;
}

export interface User {
  email: string;
  name: string;
  password?: string;
  scores: Record<string, number>; // LessonId -> Score Percentage
}
