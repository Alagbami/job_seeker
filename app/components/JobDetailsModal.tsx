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
                    <p dangerouslySetInnerHTML={{ __html: job.description || 'No description available.' }} />
                    {job.qualifications && <p><strong>Qualifications:</strong> {job.qualifications}</p>}
                    {job.employment_type && <p><strong>Employment Type:</strong> {job.employment_type}</p>}
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