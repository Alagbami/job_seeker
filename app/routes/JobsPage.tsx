// pages/JobsPage.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import JobDetailsModal from '../components/JobDetailsModal';
import JobCard from '~/components/JobCard';
import Navbar from '~/components/Navbar';

type Job = any;

/* =========================================================
   Utilities: parsing & matching against API job properties
   (unchanged from your working implementation)
   ========================================================= */

// Convert various posted fields to a unix timestamp (seconds)
const getPostedUnix = (job: Job): number | null => {
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

const withinLast = (job: Job, days: number): boolean => {
  const posted = getPostedUnix(job);
  if (!posted) return false;
  const now = Math.floor(Date.now() / 1000);
  return now - posted <= days * 86400;
};

interface ParsedSalary {
  min?: number; // annualized USD
  max?: number; // annualized USD
}
const HOURS_PER_YEAR = 2080;

const parseSalaryText = (txt: string): ParsedSalary => {
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

const getAnnualSalaryRange = (job: Job): ParsedSalary => {
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

const rangeOverlaps = (min?: number, max?: number, rmin?: number, rmax?: number) => {
  if (min == null && max == null) return false;
  const a1 = min ?? max!;
  const a2 = max ?? min!;
  const b1 = rmin ?? rmax!;
  const b2 = rmax ?? rmin!;
  return a1 <= b2 && a2 >= b1;
};

type ExpBucket = 'entry' | 'mid' | 'senior';

const inferExperience = (job: Job): ExpBucket | null => {
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

const normalizeEmployment = (job: Job): string => {
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

const getCompanyName = (j: Job): string =>
  (j?.employer_name || j?.company_name || j?.job_publisher || j?.publisher || '').toString();

/* =========================================================
   Improved FilterDropdown - robust & accessible
   ========================================================= */

interface FilterDropdownProps {
  label: string;
  options: string[];
  value?: string | null;
  onChange: (val: string | null) => void;
  placeholder?: string;
}

const Chevron = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, options, value, onChange, placeholder }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // Display label + selected (like Figma pills)
  const display = value ?? placeholder ?? '';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-3 px-4 py-2 rounded-lg shadow-sm bg-sky-50 text-sky-800 text-sm font-medium border border-transparent hover:border-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-200"
      >
        <span className="whitespace-nowrap">{label}</span>
        <span className="text-xs text-sky-600 truncate max-w-[7.5rem]">{display}</span>
        <span className="ml-1">
          <Chevron />
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label={`${label} options`}
          className="absolute z-50 mt-2 w-56 bg-white rounded-lg border border-gray-100 shadow-lg py-2"
        >
          <button
            className="block w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-50"
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
          >
            Clear
          </button>

          <div className="border-t border-gray-100 my-1" />

          <div className="max-h-64 overflow-auto">
            {options.map((opt) => (
              <button
                key={opt}
                className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                  opt === value ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-gray-700'
                }`}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   Page
   ========================================================= */

const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('developer');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Figma filters
  const [datePosted, setDatePosted] = useState<string | null>(null);
  const [experienceLevel, setExperienceLevel] = useState<string | null>(null);
  const [commitment, setCommitment] = useState<string | null>(null);
  const [salaryRange, setSalaryRange] = useState<string | null>(null);
  const [companyFilter, setCompanyFilter] = useState<string | null>(null);

  const rapidBaseUrl = import.meta.env.VITE_RAPIDAPI_KEY;

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams({
        query: `${query} ${location} ${jobType}`.trim(),
        page: page.toString(),
        num_pages: '2',
      });

      const response = await fetch(`https://jsearch.p.rapidapi.com/search?${searchParams}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': rapidBaseUrl as string,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch jobs');
      }
      setJobs(data.data || []);
      setTotalPages(data?.metadata?.total_pages || 1);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => {
      setPage(1);
      fetchJobs();
    }, 500);
    setDebounceTimer(timer);
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs((prev) => (prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]));
  };

  /* --------------------------------
     Filter option lists (UI labels)
     -------------------------------- */
  const datePostedOptions = ['Any time', 'Last 24 hours', 'Last 3 days', 'Last 7 days', 'Last 30 days'];
  const experienceOptions = ['Any', 'Entry level', 'Mid level', 'Senior level'];
  const commitmentOptions = ['Any', 'Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'];
  const salaryOptions = ['Any', '$0 - $50k', '$50k - $100k', '$100k+'];

  // Build dynamic company options from data
  const companyOptions = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      const name = getCompanyName(j);
      if (name) set.add(name);
    });
    return Array.from(set).sort().slice(0, 50);
  }, [jobs]);

  /* --------------------------------
     Core filtering mapped to props
     -------------------------------- */
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      // 1) Date posted
      switch (datePosted) {
        case 'Last 24 hours':
          if (!withinLast(j, 1)) return false;
          break;
        case 'Last 3 days':
          if (!withinLast(j, 3)) return false;
          break;
        case 'Last 7 days':
          if (!withinLast(j, 7)) return false;
          break;
        case 'Last 30 days':
          if (!withinLast(j, 30)) return false;
          break;
        default:
          break;
      }

      // 2) Experience level
      if (experienceLevel && experienceLevel !== 'Any') {
        const inferred = inferExperience(j);
        if (experienceLevel === 'Entry level' && inferred && inferred !== 'entry') return false;
        if (experienceLevel === 'Mid level' && inferred && inferred !== 'mid') return false;
        if (experienceLevel === 'Senior level' && inferred && inferred !== 'senior') return false;
      }

      // 3) Commitment
      if (commitment && commitment !== 'Any') {
        const emp = normalizeEmployment(j);
        const wanted = commitment.toLowerCase();
        if (!emp || emp !== wanted.toLowerCase()) return false;
      }

      // 4) Salary
      if (salaryRange && salaryRange !== 'Any') {
        const { min, max } = getAnnualSalaryRange(j);
        if (min == null && max == null) return false;
        if (salaryRange === '$0 - $50k') {
          if (!rangeOverlaps(min, max, 0, 50000)) return false;
        } else if (salaryRange === '$50k - $100k') {
          if (!rangeOverlaps(min, max, 50000, 100000)) return false;
        } else if (salaryRange === '$100k+') {
          if (!(min != null && min >= 100000) && !(max != null && max >= 100000)) return false;
        }
      }

      // 5) Company
      if (companyFilter && companyFilter !== 'No companies') {
        const cname = getCompanyName(j).toLowerCase();
        if (!cname.includes(companyFilter.toLowerCase())) return false;
      }

      return true;
    });
  }, [jobs, datePosted, experienceLevel, commitment, salaryRange, companyFilter]);

  return (
    <main className="main-section">
      <Navbar />

      <section className="page-heading animate-fadeIn px-4 sm:px-6 md:px-8 pt-6">
        <h1 className="text-3xl font-bold">Find Your Dream Job</h1>
        <h2 className="text-xl text-gray-600">Browse listings curated just for you</h2>
      </section>

      {/* Search form */}
      <form
        onSubmit={handleSearch}
        className="w-full max-w-6xl gap-6 mt-6 animate-fadeIn grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 px-4 sm:px-6 md:px-8"
      >
        <div className="form-div">
          <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1">
            Search Job Title
          </label>
          <input
            id="query"
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="e.g., frontend developer"
            className="input-style block w-full rounded-md border border-gray-200 shadow-sm px-3 py-2 focus:ring-2 focus:ring-sky-200"
          />
        </div>

        <div className="form-div">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., New York"
            className="input-style block w-full rounded-md border border-gray-200 shadow-sm px-3 py-2 focus:ring-2 focus:ring-sky-200"
          />
        </div>

        <div className="form-div">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Job Type
          </label>
          <select
            id="type"
            className="input-style block w-full rounded-md border border-gray-200 shadow-sm px-3 py-2 focus:ring-2 focus:ring-sky-200"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
          >
            <option value="">Any</option>
            <option value="remote">Remote</option>
            <option value="fulltime">Full-time</option>
            <option value="internship">Internship</option>
          </select>
        </div>

        <button
          type="submit"
          className="auth-button col-span-full mt-2 w-full md:col-auto px-4 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700"
        >
          Search
        </button>
      </form>

      {/* Figma filter bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <div className="flex-shrink-0">
            <FilterDropdown
              label="Date posted"
              options={datePostedOptions}
              value={datePosted || undefined}
              onChange={(v) => setDatePosted(v)}
              placeholder="Any time"
            />
          </div>

          <div className="flex-shrink-0">
            <FilterDropdown
              label="Experience level"
              options={experienceOptions}
              value={experienceLevel || undefined}
              onChange={(v) => setExperienceLevel(v)}
              placeholder="Any"
            />
          </div>

          <div className="flex-shrink-0">
            <FilterDropdown
              label="Commitment"
              options={commitmentOptions}
              value={commitment || undefined}
              onChange={(v) => setCommitment(v)}
              placeholder="Any"
            />
          </div>

          <div className="flex-shrink-0">
            <FilterDropdown
              label="Salary"
              options={salaryOptions}
              value={salaryRange || undefined}
              onChange={(v) => setSalaryRange(v)}
              placeholder="Any"
            />
          </div>

          <div className="flex-shrink-0">
            <FilterDropdown
              label="Company"
              options={companyOptions.length ? companyOptions : ['No companies']}
              value={companyFilter || undefined}
              onChange={(v) => setCompanyFilter(v)}
              placeholder="All"
            />
          </div>

          <div className="flex-shrink-0 ml-auto">
            <button
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => {
                setDatePosted(null);
                setExperienceLevel(null);
                setCommitment(null);
                setSalaryRange(null);
                setCompanyFilter(null);
              }}
            >
              Clear filters
            </button>
          </div>
        </div>
      </div>

      {/* Jobs grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        {loading ? (
          <div className="text-dark-200 text-xl animate-pulse mt-8">Loading jobs...</div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job, index) => (
                <JobCard
                  key={index}
                  job={job}
                  onClick={() => setSelectedJob(job)}
                  onSave={() => toggleSaveJob(job.job_google_link || job.job_apply_link || String(index))}
                  saved={savedJobs.includes(job.job_google_link || job.job_apply_link || String(index))}
                />
              ))
            ) : (
              <p className="text-dark-200 mt-10">No jobs found. Try different filters.</p>
            )}
          </section>
        )}

        {/* Pagination */}
        <div className="flex gap-4 mt-10 animate-fadeIn items-center justify-center">
          <button className="back-button" onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
            Prev
          </button>
          <span className="text-dark-200 font-semibold">
            Page {page} of {totalPages}
          </span>
          <button className="back-button" onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} disabled={page >= totalPages}>
            Next
          </button>
        </div>
      </div>

      {selectedJob && <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </main>
  );
};

export default JobsPage;
