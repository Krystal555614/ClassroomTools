import { Student } from '../types';

export const DEFAULT_STUDENTS: Student[] = [
  { id: '1', number: '1', name: '陳冠宇' },
  { id: '2', number: '2', name: '林子晴' },
  { id: '3', number: '3', name: '張家豪' },
  { id: '4', number: '4', name: '黃品妍' },
  { id: '5', number: '5', name: '李承翰' },
  { id: '6', number: '6', name: '王羽彤' },
  { id: '7', number: '7', name: '吳睿恩' },
  { id: '8', number: '8', name: '劉雅婷' },
  { id: '9', number: '9', name: '蔡宇翔' },
  { id: '10', number: '10', name: '楊詩涵' },
  { id: '11', number: '11', name: '許哲瑋' },
  { id: '12', number: '12', name: '鄭筑云' },
  { id: '13', number: '13', name: '謝廷恩' },
  { id: '14', number: '14', name: '洪翊軒' },
  { id: '15', number: '15', name: '邱依婷' },
  { id: '16', number: '16', name: '曾子軒' },
  { id: '17', number: '17', name: '廖若晴' },
  { id: '18', number: '18', name: '賴柏霖' },
  { id: '19', number: '19', name: '徐安琪' },
  { id: '20', number: '20', name: '周宏恩' },
  { id: '21', number: '21', name: '葉芷萱' },
  { id: '22', number: '22', name: '蘇俊傑' },
  { id: '23', number: '23', name: '莊凱婷' },
  { id: '24', number: '24', name: '呂柏叡' },
];

export const PRESET_CLASSES = [
  {
    name: '國小三年二班 (24人標準)',
    description: '標準無重複名單，適合快速體驗正常課堂點名與分組',
    students: DEFAULT_STUDENTS,
  },
  {
    name: '模擬測試名單 (26人 · 含重複姓名)',
    description: '特別設計含有 2 位重複姓名（陳冠宇、林子晴），方便測試名單標記與一鍵去重功能',
    students: [
      { id: 'sim-1', number: '1', name: '陳冠宇' },
      { id: 'sim-2', number: '2', name: '林子晴' },
      { id: 'sim-3', number: '3', name: '張家豪' },
      { id: 'sim-4', number: '4', name: '黃品妍' },
      { id: 'sim-5', number: '5', name: '李承翰' },
      { id: 'sim-6', number: '6', name: '陳冠宇' }, // 故意重複
      { id: 'sim-7', number: '7', name: '王羽彤' },
      { id: 'sim-8', number: '8', name: '吳睿恩' },
      { id: 'sim-9', number: '9', name: '劉雅婷' },
      { id: 'sim-10', number: '10', name: '蔡宇翔' },
      { id: 'sim-11', number: '11', name: '林子晴' }, // 故意重複
      { id: 'sim-12', number: '12', name: '楊詩涵' },
      { id: 'sim-13', number: '13', name: '許哲瑋' },
      { id: 'sim-14', number: '14', name: '鄭筑云' },
      { id: 'sim-15', number: '15', name: '謝廷恩' },
      { id: 'sim-16', number: '16', name: '洪翊軒' },
      { id: 'sim-17', number: '17', name: '邱依婷' },
      { id: 'sim-18', number: '18', name: '曾子軒' },
      { id: 'sim-19', number: '19', name: '廖若晴' },
      { id: 'sim-20', number: '20', name: '賴柏霖' },
      { id: 'sim-21', number: '21', name: '徐安琪' },
      { id: 'sim-22', number: '22', name: '周宏恩' },
      { id: 'sim-23', number: '23', name: '葉芷萱' },
      { id: 'sim-24', number: '24', name: '蘇俊傑' },
      { id: 'sim-25', number: '25', name: '莊凱婷' },
      { id: 'sim-26', number: '26', name: '呂柏叡' },
    ],
  },
  {
    name: '科學實驗小組 (15人)',
    description: '適合小組專案、跑關活動與迷你競賽',
    students: [
      { id: 's1', number: '1', name: '林柏叡' },
      { id: 's2', number: '2', name: '陳欣妤' },
      { id: 's3', number: '3', name: '張宇安' },
      { id: 's4', number: '4', name: '王心柔' },
      { id: 's5', number: '5', name: '李奕德' },
      { id: 's6', number: '6', name: '黃湘晴' },
      { id: 's7', number: '7', name: '周柏翰' },
      { id: 's8', number: '8', name: '蔡宜靜' },
      { id: 's9', number: '9', name: '楊政軒' },
      { id: 's10', number: '10', name: '鄭郁婷' },
      { id: 's11', number: '11', name: '許家瑋' },
      { id: 's12', number: '12', name: '謝舒涵' },
      { id: 's13', number: '13', name: '劉子豪' },
      { id: 's14', number: '14', name: '洪嘉惠' },
      { id: 's15', number: '15', name: '吳廷軒' },
    ],
  },
  {
    name: '英語對話班 (10人)',
    description: '包含英文姓名格式示範',
    students: [
      { id: 'e1', number: '1', name: 'Emma Watson' },
      { id: 'e2', number: '2', name: 'Lucas Chen' },
      { id: 'e3', number: '3', name: 'Sophie Lin' },
      { id: 'e4', number: '4', name: 'Ethan Wang' },
      { id: 'e5', number: '5', name: 'Chloe Chang' },
      { id: 'e6', number: '6', name: 'Daniel Huang' },
      { id: 'e7', number: '7', name: 'Mia Wu' },
      { id: 'e8', number: '8', name: 'Oliver Lee' },
      { id: 'e9', number: '9', name: 'Grace Hsu' },
      { id: 'e10', number: '10', name: 'Ryan Liu' },
    ],
  },
];

/**
 * Returns a Set of student names that appear more than once (case-insensitive & trimmed)
 */
export function findDuplicateNames(students: Student[]): Set<string> {
  const counts = new Map<string, number>();
  students.forEach((s) => {
    const key = (s.name || '').trim().toLowerCase();
    if (key) {
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  });

  const duplicates = new Set<string>();
  counts.forEach((count, nameKey) => {
    if (count > 1) {
      duplicates.add(nameKey);
    }
  });

  return duplicates;
}

/**
 * Removes duplicate students, preserving the first occurrence of each unique name
 */
export function removeDuplicateStudents(students: Student[]): {
  uniqueStudents: Student[];
  removedCount: number;
  duplicateNames: string[];
} {
  const seen = new Set<string>();
  const uniqueStudents: Student[] = [];
  const duplicateNames: string[] = [];

  students.forEach((s) => {
    const key = (s.name || '').trim().toLowerCase();
    if (!key) return;

    if (seen.has(key)) {
      if (!duplicateNames.includes(s.name)) {
        duplicateNames.push(s.name);
      }
    } else {
      seen.add(key);
      uniqueStudents.push(s);
    }
  });

  return {
    uniqueStudents,
    removedCount: students.length - uniqueStudents.length,
    duplicateNames,
  };
}

/**
 * Parses raw text pasted by the teacher
 * Supports formats like:
 * 1. 王小明
 * 01 張三
 * 1, 李四
 * 1 \t 王小明
 * 王小明, 李四, 張三
 */
export function parsePastedNames(text: string): Student[] {
  if (!text || !text.trim()) return [];

  // If text contains commas without many newlines, split by comma
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let candidateTokens: string[] = [];

  // Check if it's a single line with comma/separator
  if (lines.length === 1 && (text.includes(',') || text.includes('，') || text.includes('、'))) {
    candidateTokens = text
      .split(/[,，、]/)
      .map((t) => t.trim())
      .filter(Boolean);
  } else {
    candidateTokens = lines;
  }

  const results: Student[] = [];

  candidateTokens.forEach((token, index) => {
    // Check if token has tab or comma separation like "1, 王小明" or "1 \t 王小明"
    let seatNumber: string | number = index + 1;
    let name = token;

    // Pattern 1: Tab separated
    if (token.includes('\t')) {
      const parts = token.split('\t').map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        // If first part is a number
        if (/^\d+$/.test(parts[0])) {
          seatNumber = parts[0];
          name = parts[1];
        } else if (/^\d+$/.test(parts[1])) {
          name = parts[0];
          seatNumber = parts[1];
        } else {
          name = parts[0];
        }
      }
    } else if (token.includes(',') || token.includes('，')) {
      const parts = token.split(/[,，]/).map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 2 && /^\d+$/.test(parts[0])) {
        seatNumber = parts[0];
        name = parts[1];
      }
    } else {
      // Pattern 2: "1. 王小明" or "01 王小明" or "01號 王小明" or "1、王小明"
      const match = token.match(/^(\d+)[.\s、號\-_/]*(.+)$/);
      if (match) {
        seatNumber = match[1];
        name = match[2].trim();
      }
    }

    // Clean quotes or extra spaces
    name = name.replace(/^["']|["']$/g, '').trim();

    if (name) {
      results.push({
        id: `parsed-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
        number: seatNumber,
        name: name,
      });
    }
  });

  return results;
}

/**
 * Parses CSV string (from file upload)
 */
export function parseCSVContent(csvText: string): Student[] {
  if (!csvText || !csvText.trim()) return [];

  const rawLines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (rawLines.length === 0) return [];

  // Parse lines into CSV tokens respecting quotes
  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if ((char === ',' || char === '\t') && !inQuotes) {
        result.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^["']|["']$/g, ''));
    return result;
  };

  const rows = rawLines.map(parseRow);
  if (rows.length === 0) return [];

  // Check if first row is a header
  const firstRow = rows[0];
  let nameIndex = -1;
  let numberIndex = -1;

  firstRow.forEach((col, idx) => {
    const lower = col.toLowerCase();
    if (
      col.includes('姓名') ||
      col.includes('名字') ||
      lower === 'name' ||
      lower === 'student_name' ||
      lower === 'student'
    ) {
      nameIndex = idx;
    }
    if (
      col.includes('座號') ||
      col.includes('號碼') ||
      col.includes('學號') ||
      lower === 'number' ||
      lower === 'no' ||
      lower === 'seat' ||
      lower === 'id'
    ) {
      numberIndex = idx;
    }
  });

  const students: Student[] = [];
  const startRow = (nameIndex !== -1 || numberIndex !== -1) ? 1 : 0;

  for (let r = startRow; r < rows.length; r++) {
    const row = rows[r];
    if (row.length === 0) continue;

    let name = '';
    let number: string | number = r + (startRow === 1 ? 0 : 1);

    if (nameIndex !== -1 && row[nameIndex]) {
      name = row[nameIndex];
      if (numberIndex !== -1 && row[numberIndex]) {
        number = row[numberIndex];
      }
    } else if (row.length === 1) {
      // Single column
      const parsed = parsePastedNames(row[0]);
      if (parsed.length > 0) {
        students.push(...parsed);
        continue;
      }
    } else {
      // Find which column looks like a number and which like a name
      if (/^\d+$/.test(row[0]) && row[1]) {
        number = row[0];
        name = row[1];
      } else if (row[0] && /^\d+$/.test(row[1])) {
        name = row[0];
        number = row[1];
      } else {
        name = row[0];
      }
    }

    name = name.replace(/^["']|["']$/g, '').trim();
    if (name && !name.includes('姓名') && !name.includes('Name')) {
      students.push({
        id: `csv-${r}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        number,
        name,
      });
    }
  }

  return students;
}
