export interface Student {
  id: string;
  name: string;
  number?: string | number;
  gender?: 'M' | 'F' | 'other';
  notes?: string;
}

export interface DrawHistoryItem {
  id: string;
  student: Student;
  timestamp: number;
}

export type GroupTheme = 'numbers' | 'animals' | 'colors' | 'planets';

export interface Group {
  id: string;
  name: string;
  color: {
    bg: string;
    border: string;
    text: string;
    badge: string;
    headerBg: string;
  };
  icon?: string;
  members: Student[];
}

export type ActiveTab = 'picker' | 'grouper' | 'students';
