
export enum LessonId {
  Intro = 'intro',
  Variables = 'variables',
  ForLoops = 'for-loops',
  WhileLoops = 'while-loops',
  ListsTuples = 'lists-tuples',
  FunctionsMath = 'functions-math',
  ListMethods = 'list-methods',
  StdLib = 'std-lib',
  Project = 'project'
}

export interface Lesson {
  id: LessonId;
  title: string;
  content: string;
  defaultCode: string;
  concepts: string[];
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  text: string;
}
