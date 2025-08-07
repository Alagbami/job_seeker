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
            className="cursor-pointer border border-gray-200 p-6 rounded-2xl bg-gradient-to-br from-yellow-100 to-yellow-300 shadow-lg hover:shadow-2xl transition duration-300 relative"
            onClick={onClick}
        >
            {/* Company Logo */}
            {job.company_logo && (
                <div className="absolute top-4 right-4">
                    <img src={job.company_logo} alt="logo" className="h-10 w-10 object-contain rounded-full border border-gray-300 shadow" />
                </div>
            )}

            {/* Job Title */}
            <h3 className="text-gray-900 text-xl font-bold mb-1">
                {highlightMatch(job.job_title, searchQuery)}
            </h3>

            {/* Company and Location */}
            <p className="text-gray-600 text-sm mb-2 font-medium">
                {job.company_name} <span className="mx-1">•</span> {job.location}
            </p>

            {/* Job Type, Employment Type, Days Ago */}
            <div className="flex flex-wrap gap-2 mt-2 text-xs">
                {job.job_type && (
                    <span className="px-2 py-0.5 bg-blue-600 rounded-full text-white font-semibold shadow">
                        {job.job_type}
                    </span>
                )}
                {job.employment_type && (
                    <span className="px-2 py-0.5 bg-green-600 rounded-full text-white font-semibold shadow">
                        {job.employment_type}
                    </span>
                )}
                {daysAgo !== null && (
                    <span className="text-gray-500 text-xs bg-gray-100 px-2 py-0.5 rounded-full">{daysAgo}d ago</span>
                )}
            </div>

            {/* Tech Stack */}
            {techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                    {techStack.slice(0, 5).map((tag: string, idx: number) => (
                        <span
                            key={idx}
                            className="bg-gray-800 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex justify-between items-center">
                <a
                    href={job.job_google_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm font-semibold"
                    onClick={e => e.stopPropagation()}
                >
                    View Job
                </a>

                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSave();
                        }}
                        className={`text-xs px-4 py-1 rounded-lg border font-semibold transition-colors duration-200 ${
                            saved
                                ? 'bg-white text-blue-700 border-blue-700 shadow'
                                : 'bg-blue-600 text-white border-blue-600 hover:bg-white hover:text-blue-700'
                        }`}
                    >
                        {saved ? 'Saved' : 'Save'}
                    </button>

                    <button
                        onClick={handleShare}
                        className="text-xs px-4 py-1 rounded-lg border border-yellow-500 text-yellow-700 bg-white hover:bg-yellow-500 hover:text-white font-semibold transition-colors duration-200 shadow"
                    >
                        Share
                    </button>
                </div>
            </div>
        </div>
    );
};
export default JobCard;