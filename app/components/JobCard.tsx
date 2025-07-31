import React from 'react';

interface JobCardProps {
    job: any;
    onClick: () => void;
    onSave: () => void;
    saved: boolean;
    searchQuery?: string;
}

const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-yellow-300 text-black">
                {part}
            </mark>
        ) : (
            part
        )
    );
};

const JobCard: React.FC<JobCardProps> = ({ job, onClick, onSave, saved, searchQuery = '' }) => {
    const daysAgo = job.posted_date
        ? Math.floor((new Date().getTime() - new Date(job.posted_date).getTime()) / (1000 * 60 * 60 * 24))
        : null;

    const techStack = job.skills || job.tags || [];

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(job.job_google_link);
        alert('Job link copied to clipboard!');
    };

    return (
        <div
            className="cursor-pointer border border-gray-700 p-4 rounded-lg bg-[#1c1c1f] shadow hover:shadow-lg transition duration-300"
            onClick={onClick}
        >
            {job.company_logo && (
                <img src={job.company_logo} alt="logo" className="h-8 w-8 object-contain mb-2" />
            )}

            <h3 className="text-white text-lg font-semibold mb-1">
                {highlightMatch(job.job_title, searchQuery)}
            </h3>

            <p className="text-gray-400 text-sm mb-2">
                {job.company_name} • {job.location}
            </p>

            <div className="flex flex-wrap gap-2 mt-2 text-xs">
                {job.job_type && (
                    <span className="px-2 py-0.5 bg-blue-600 rounded-full text-white">
            {job.job_type}
          </span>
                )}
                {job.employment_type && (
                    <span className="px-2 py-0.5 bg-green-600 rounded-full text-white">
            {job.employment_type}
          </span>
                )}
                {daysAgo !== null && (
                    <span className="text-gray-400 text-xs">{daysAgo}d ago</span>
                )}
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
                {techStack.slice(0, 5).map((tag: string, idx: number) => (
                    <span
                        key={idx}
                        className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full"
                    >
            {tag}
          </span>
                ))}
            </div>

            <div className="mt-4 flex justify-between items-center">
                <a
                    href={job.job_google_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline text-sm"
                >
                    View Job
                </a>

                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSave();
                        }}
                        className={`text-xs px-3 py-1 rounded-md border ${
                            saved
                                ? 'bg-white text-black font-semibold'
                                : 'border-white text-white hover:bg-white hover:text-black transition-colors'
                        }`}
                    >
                        {saved ? 'Saved' : 'Save'}
                    </button>

                    <button
                        onClick={handleShare}
                        className="text-xs px-3 py-1 border border-white text-white hover:bg-white hover:text-black rounded-md"
                    >
                        Share
                    </button>
                </div>
            </div>
        </div>
    );
};
export default JobCard;