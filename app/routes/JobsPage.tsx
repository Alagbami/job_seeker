// pages/JobsPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import JobDetailsModal from '../components/JobDetailsModal';
import SearchForm from '~/components/JobPageComp/SearchForm';
import FiltersBar from '~/components/JobPageComp/FiltersBar';
import JobsGrid from '~/components/JobPageComp/JobsGrid';
import Pagination from '~/components/JobPageComp/Pagination';
import {
  withinLast,
  inferExperience,
  normalizeEmployment,
  getAnnualSalaryRange,
  rangeOverlaps,
  getCompanyName,
} from '~/lib/jobUtils';

type Job = any;

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

  // Filters
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
    const timer = setTimeout(() => { setPage(1); fetchJobs(); }, 500);
    setDebounceTimer(timer);
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs((prev) => (prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]));
  };

  const companyOptions = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      const name = (j?.employer_name || j?.company_name || j?.publisher || '')?.toString();
      if (name) set.add(name);
    });
    return Array.from(set).sort().slice(0, 50);
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      // date posted
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

      // experience
      if (experienceLevel && experienceLevel !== 'Any') {
        const inferred = inferExperience(j);
        if (experienceLevel === 'Entry level' && inferred && inferred !== 'entry') return false;
        if (experienceLevel === 'Mid level' && inferred && inferred !== 'mid') return false;
        if (experienceLevel === 'Senior level' && inferred && inferred !== 'senior') return false;
      }

      // commitment
      if (commitment && commitment !== 'Any') {
        const emp = normalizeEmployment(j);
        const wanted = commitment.toLowerCase();
        if (!emp || emp !== wanted.toLowerCase()) return false;
      }

      // salary
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

      // company
      if (companyFilter && companyFilter !== 'No companies') {
        const cname = getCompanyName(j).toLowerCase();
        if (!cname.includes((companyFilter || '').toLowerCase())) return false;
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

      <SearchForm
        query={query}
        onQueryChange={handleQueryChange}
        location={location}
        onLocationChange={setLocation}
        jobType={jobType}
        onJobTypeChange={setJobType}
        onSubmit={handleSearch}
      />

      <FiltersBar
        datePosted={datePosted}
        setDatePosted={setDatePosted}
        experienceLevel={experienceLevel}
        setExperienceLevel={setExperienceLevel}
        commitment={commitment}
        setCommitment={setCommitment}
        salaryRange={salaryRange}
        setSalaryRange={setSalaryRange}
        companyFilter={companyFilter}
        setCompanyFilter={setCompanyFilter}
        companyOptions={companyOptions}
        onClearAll={() => { setDatePosted(null); setExperienceLevel(null); setCommitment(null); setSalaryRange(null); setCompanyFilter(null); }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        <JobsGrid jobs={filteredJobs} loading={loading} onOpenJob={setSelectedJob} onToggleSave={toggleSaveJob} savedJobs={savedJobs} />

        <Pagination
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(p - 1, 1))}
          onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
        />
      </div>

      {selectedJob && <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </main>
  );
};

export default JobsPage;
