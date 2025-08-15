// components/JobsGrid.tsx
import React from 'react';
import JobCard from '../JobCard';

interface JobsGridProps {
  jobs: any[];
  loading: boolean;
  onOpenJob: (job: any) => void;
  onToggleSave: (id: string) => void;
  savedJobs: string[];
}

const JobsGrid: React.FC<JobsGridProps> = ({ jobs, loading, onOpenJob, onToggleSave, savedJobs }) => {
  if (loading) {
    return <div className="text-dark-200 text-xl animate-pulse mt-8">Loading jobs...</div>;
  }

  if (!jobs || jobs.length === 0) {
    return <p className="text-dark-200 mt-10">No jobs found. Try different filters.</p>;
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {jobs.map((job, index) => (
        <JobCard
          key={job.job_id || job.job_google_link || index}
          job={job}
          onClick={() => onOpenJob(job)}
          onSave={() => onToggleSave(job.job_google_link || job.job_apply_link || String(index))}
          saved={savedJobs.includes(job.job_google_link || job.job_apply_link || String(index))}
        />
      ))}
    </section>
  );
};

export default JobsGrid;
