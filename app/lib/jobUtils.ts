// ~/lib/jobUtils.ts
export type Job = any;

export const HOURS_PER_YEAR = 2080;

/**
 * Convert various posted fields to a unix timestamp (seconds)
 */
export const getPostedUnix = (job: Job): number | null => {
  if (typeof job?.job_posted_at_timestamp === 'number') return job.job_posted_at_timestamp;
  if (typeof job?.job_posted_at_datetime_utc === 'string') {
    const ms = Date.parse(job.job_posted_at_datetime_utc);
    return Number.isFinite(ms) ? Math.floor(ms / 1000) : null;
  }
  const human = (job?.job_posted_human_readable || '').toString().toLowerCase();
  if (!human) return null;
  if (human.includes('just')) return Math.floor(Date.now() / 1000);
  const hoursMatch = human.match(/(\d+)\s*hour/);
  if (hoursMatch) {
    const h = parseInt(hoursMatch[1], 10);
    return Math.floor(Date.now() / 1000) - h * 3600;
  }
  const daysMatch = human.match(/(\d+)\s*day/);
  if (daysMatch) {
    const d = parseInt(daysMatch[1], 10);
    return Math.floor(Date.now() / 1000) - d * 86400;
  }
  const weeksMatch = human.match(/(\d+)\s*week/);
  if (weeksMatch) {
    const w = parseInt(weeksMatch[1], 10);
    return Math.floor(Date.now() / 1000) - w * 7 * 86400;
  }
  const monthsMatch = human.match(/(\d+)\s*month/);
  if (monthsMatch) {
    const m = parseInt(monthsMatch[1], 10);
    return Math.floor(Date.now() / 1000) - m * 30 * 86400;
  }
  return null;
};

export const withinLast = (job: Job, days: number): boolean => {
  const posted = getPostedUnix(job);
  if (!posted) return false;
  const now = Math.floor(Date.now() / 1000);
  return now - posted <= days * 86400;
};

/**
 * Salary parsing & annualization helpers
 */
export interface ParsedSalary {
  min?: number;
  max?: number;
}

export const parseSalaryText = (txt: string): ParsedSalary => {
  const out: ParsedSalary = {};
  if (!txt) return out;

  const s = txt.replace(/\u00A0/g, ' ').toLowerCase();
  const isHourly = /\/ ?h|hour/.test(s);

  const numMatches = s.match(/(\d[\d,\.]*)\s*(k)?/g);
  if (!numMatches) return out;

  const toNumber = (piece: string) => {
    const m = piece.match(/(\d[\d,\.]*)\s*(k)?/);
    if (!m) return undefined;
    const raw = parseFloat(m[1].replace(/,/g, ''));
    const val = m[2] ? raw * 1000 : raw;
    return Number.isFinite(val) ? val : undefined;
  };

  const nums = numMatches.map(toNumber).filter((n): n is number => typeof n === 'number');

  if (nums.length === 0) return out;

  const annualize = (n: number) => (isHourly ? n * HOURS_PER_YEAR : n);

  if (nums.length === 1) {
    const v = annualize(nums[0]);
    out.min = v;
    out.max = v;
  } else {
    const a = annualize(Math.min(nums[0], nums[1]));
    const b = annualize(Math.max(nums[0], nums[1]));
    out.min = a;
    out.max = b;
  }
  return out;
};

export const getAnnualSalaryRange = (job: Job): ParsedSalary => {
  if (Number.isFinite(job?.job_min_salary) || Number.isFinite(job?.job_max_salary)) {
    const min = Number.isFinite(job?.job_min_salary) ? Number(job.job_min_salary) : undefined;
    const max = Number.isFinite(job?.job_max_salary) ? Number(job.job_max_salary) : undefined;
    return { min, max };
  }
  if (typeof job?.job_salary === 'string' && job.job_salary.trim()) {
    return parseSalaryText(job.job_salary);
  }
  return {};
};

export const rangeOverlaps = (min?: number, max?: number, rmin?: number, rmax?: number) => {
  if (min == null && max == null) return false;
  const a1 = min ?? max!;
  const a2 = max ?? min!;
  const b1 = rmin ?? rmax!;
  const b2 = rmax ?? rmin!;
  return a1 <= b2 && a2 >= b1;
};

/**
 * Experience inference
 */
export type ExpBucket = 'entry' | 'mid' | 'senior';

export const inferExperience = (job: Job): ExpBucket | null => {
  const r = job?.job_required_experience || {};
  const title = ((job?.job_title || job?.job_job_title || '') as string).toLowerCase();
  if (r.no_experience_required === true) return 'entry';
  const months = Number.isFinite(r.required_experience_in_months) ? Number(r.required_experience_in_months) : null;
  if (months != null) {
    if (months < 24) return 'entry';
    if (months < 84) return 'mid';
    return 'senior';
  }
  if (/\b(intern|junior|jr|entry)\b/.test(title)) return 'entry';
  if (/\b(principal|staff|lead|sr|senior)\b/.test(title)) return 'senior';
  if (title) return 'mid';
  return null;
};

/**
 * Employment type normalization
 */
export const normalizeEmployment = (job: Job): string => {
  const t = (job?.job_employment_type_text || job?.job_employment_type || '')?.toString().toLowerCase();
  if (t.includes('full')) return 'full-time';
  if (t.includes('part')) return 'part-time';
  if (t.includes('contract')) return 'contract';
  if (t.includes('intern')) return 'internship';
  if (t.includes('temporary') || t.includes('temp')) return 'temporary';
  if (Array.isArray(job?.job_employment_types)) {
    const arr = job.job_employment_types.map((s: string) => s?.toLowerCase?.() || '');
    if (arr.some((s: string) => s.includes('full'))) return 'full-time';
    if (arr.some((s: string) => s.includes('part'))) return 'part-time';
    if (arr.some((s: string) => s.includes('contract'))) return 'contract';
    if (arr.some((s: string) => s.includes('intern'))) return 'internship';
  }
  return '';
};

export const getCompanyName = (j: Job): string =>
  (j?.employer_name || j?.company_name || j?.job_publisher || j?.publisher || '').toString();
