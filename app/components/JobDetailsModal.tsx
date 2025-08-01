// components/JobDetailsModal.tsx
import React from 'react';

interface JobDetailsModalProps {
    job: any;
    onClose: () => void;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 relative shadow-xl overflow-y-auto max-h-[80vh]">
                <button onClick={onClose} className="absolute top-4 right-4 text-dark-200 back-button">
                    Close
                </button>
                <h2 className="text-3xl font-semibold">{job.job_title}</h2>
                <p className="text-dark-200 text-lg mb-2">{job.company_name} – {job.location}</p>
                <p className="text-dark-200 mb-4 text-sm">{job.job_type}</p>
                <div className="text-dark-200 space-y-4">
                    <p dangerouslySetInnerHTML={{ __html: job.job_description || 'No description available.' }} />
                    {job.job_qualifications && <p><strong>Qualifications:</strong> {job.job_qualifications}</p>}
                    {job.job_employment_type && <p><strong>Employment Type:</strong> {job.job_employment_type}</p>}
                    {job.job_salary && <p><strong>Salary:</strong> {job.job_salary}</p>}
                    {job.job_benefits && <p><strong>Benefits:</strong> {job.job_benefits}</p>}
                    {job.job_posted_at && <p><strong>Posted:</strong> {new Date(job.job_posted_at).toLocaleDateString()}</p>}
                    {job.job_apply_link && <p><strong>Apply Link:</strong> <a   href={job.job_apply_link} target="_blank" rel="noopener noreferrer">{job.job_apply_link}</a></p>}
                    {job.job_google_link && <p><strong>Google Link:</strong> <a href={job.job_google_link} target="_blank" rel="noopener noreferrer">{job.job_google_link}</a></p>}
                    {job.job_apply_link && <p><strong>Apply Link:</strong> <a href={job.job_apply_link} target="_blank" rel="noopener noreferrer">{job.job_apply_link}</a></p>}
                    {job.job_apply_link && <p><strong>Apply Link:</strong> <a href={job.job_apply_link} target="_blank" rel="noopener noreferrer">{job.job_apply_link}</a></p>}
                    {job.job_apply_link && <p><strong>Apply Link:</strong> <a href={job.job_apply_link} target="_blank" rel="noopener noreferrer">{job.job_apply_link}</a></p>}
                </div>
                <a
                    href={job.job_google_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="primary-button mt-6 block text-center"
                >
                    View on Google
                </a>
            </div>
        </div>
    );
};

export default JobDetailsModal;