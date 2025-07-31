import React, { useEffect, useState } from 'react';
import JobDetailsModal from '../components/JobDetailsModal';
import JobCard from '~/components/JobCard';
import Navbar from '~/components/Navbar';

interface Job {
    job_title: string;
    company_name: string;
    location: string;
    job_google_link: string;
    description: string;
    job_type?: string;
    qualifications?: string;
    employment_type?: string;
}

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

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const searchParams = new URLSearchParams({
                query: `${query} ${location} ${jobType}`.trim(),
                page: page.toString(),
                num_pages: '1',
            });

            const response = await fetch(`https://jsearch.p.rapidapi.com/search?${searchParams}`, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': '0f7daefc28msh6559303adadcd2dp1658d3jsn8c2f5808ad9a',
                    'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
                },
            });

            const data = await response.json();
            setJobs(data.data || []);
            setTotalPages(data?.metadata?.total_pages || 1);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
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
        setSavedJobs((prev) =>
            prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
        );
    };

    return (
        <main className="main-section">
            <Navbar />
            
            <section className="page-heading animate-fadeIn">
                <h1 className="text-3xl font-bold">Find Your Dream Job</h1>
                <h2 className="text-xl text-gray-600">Browse listings curated just for you</h2>
            </section>

            <form onSubmit={handleSearch} className="w-full max-w-4xl gap-6 mt-6 animate-fadeIn grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
                <div className="form-div">
                    <label htmlFor="query">Search Job Title</label>
                    <input
                        id="query"
                        type="text"
                        value={query}
                        onChange={handleQueryChange}
                        placeholder="e.g., frontend developer"
                        className="input-style"
                    />
                </div>

                <div className="form-div">
                    <label htmlFor="location">Location</label>
                    <input
                        id="location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g., New York"
                        className="input-style"
                    />
                </div>

                <div className="form-div">
                    <label htmlFor="type">Job Type</label>
                    <select
                        id="type"
                        className="input-style"
                        value={jobType}
                        onChange={(e) => setJobType(e.target.value)}
                    >
                        <option value="">Any</option>
                        <option value="remote">Remote</option>
                        <option value="fulltime">Full-time</option>
                        <option value="internship">Internship</option>
                    </select>
                </div>

                <button type="submit" className="auth-button col-span-full animate-fadeIn">Search</button>
            </form>

            {loading ? (
                <div className="text-dark-200 text-xl animate-pulse mt-8">Loading jobs...</div>
            ) : (
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 animate-fadeIn">
                    {jobs.length > 0 ? (
                        jobs.map((job, index) => (
                            <JobCard
                                key={index}
                                job={job}
                                onClick={() => setSelectedJob(job)}
                                onSave={() => toggleSaveJob(job.job_google_link)}
                                saved={savedJobs.includes(job.job_google_link)}
                            />
                        ))
                    ) : (
                        <p className="text-dark-200 mt-10">No jobs found. Try different filters.</p>
                    )}
                </section>
            )}

            <div className="flex gap-4 mt-10 animate-fadeIn items-center justify-center">
                <button
                    className="back-button"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                >
                    Prev
                </button>
                <span className="text-dark-200 font-semibold">
                    Page {page} of {totalPages}
                </span>
                <button
                    className="back-button"
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page >= totalPages}
                >
                    Next
                </button>
            </div>

            {selectedJob && (
                <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
            )}
        </main>
    );
};

export default JobsPage;