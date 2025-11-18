export interface StaticPromptCategory {
  code: string;
  name_kr: string;
  name_en: string;
}

export const DEFAULT_PROMPT_CATEGORIES: StaticPromptCategory[] = [
  { code: 'dev', name_kr: '개발', name_en: 'Development' },
  { code: 'marketing', name_kr: '마케팅', name_en: 'Marketing' },
  { code: 'design', name_kr: '디자인', name_en: 'Design' },
  { code: 'edu', name_kr: '교육/HR', name_en: 'Education' },
  { code: 'data', name_kr: '데이터', name_en: 'Data & Analytics' },
];
