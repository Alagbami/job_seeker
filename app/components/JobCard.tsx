import React from 'react';

interface JobCardProps {
  job: any;
  onClick: () => void;
  onSave: () => void;
  saved: boolean;
  searchQuery?: string;
  /**
   * When `selected` is true the card shows the highlighted/active style
   * (blue border + gradient header + full width CTA button) — matches the Figma screenshot.
   */
  selected?: boolean;
}

const HighlightMark: React.FC<{ text?: string; query?: string }> = ({ text = '', query = '' }) => {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-300 text-black px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
};

/**
 * Small inline SVG icons so the card looks exactly like the Figma (clock, pin, money).
 * Using inline SVG keeps the component self-contained and pixel-consistent across platforms.
 */
const IconClock = () => (
  <svg className="h-4 w-4 inline-block mr-1" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const IconPin = () => (
  <svg className="h-4 w-4 inline-block mr-1" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 1118 0z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx="12" cy="10" r="2.2" fill="currentColor" />
  </svg>
);

const IconMoney = () => (
  <svg className="h-4 w-4 inline-block mr-1" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="2.5" y="6.5" width="19" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" />
    <path d="M8 12h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="12" cy="11.2" r="0.8" fill="currentColor" />
  </svg>
);

/**
 * NOTE:
 * - This component relies on TailwindCSS utilities including the `line-clamp` helper.
 *   Add `@tailwindcss/line-clamp` plugin to your tailwind config for the `.line-clamp-3` utility to work.
 * - The design in the attached Figma uses a subtle card border, mild shadow, rounded corners,
 *   blue accent for title and selected state, small pills for tags and salary, and a compact layout.
 *
 * The `selected` prop toggles the highlighted card state (blue border + gradient top + CTA).
 */
const JobCard: React.FC<JobCardProps> = ({
  job,
  onClick,
  onSave,
  saved,
  searchQuery = '',
  selected = false,
}) => {
  // Fallbacks and normalized fields
  const logo = job?.employer_logo || job?.company_logo || '';
  const company = job?.employer_name || job?.company_name || '';
  const location = job?.job_location || job?.job_city || job?.location || '';
  const posted = job?.job_posted_human_readable || job?.posted_date || '';
  const employmentType = job?.job_employment_type_text || job?.job_employment_type || job?.employment_type || '';
  const jobTitle = job?.job_title || job?.job_job_title || '';
  const jobDescription = typeof job?.job_description === 'string' ? job.job_description : String(job?.job_description || '');
  const jobBenefits = job?.job_benefits || '';
  const jobHighlights = job?.job_highlights;
  const applyLink = job?.job_apply_link || job?.job_google_link || '';
  const publisher = job?.job_publisher || job?.publisher || '';
  const isRemote = job?.job_is_remote;
  const salary = job?.job_salary || '';
  const website = job?.employer_website || '';
  const linkedin = job?.employer_linkedin || '';

  // Tech stack / tags as array
  const techStack: string[] = Array.isArray(job?.skills)
    ? job.skills
    : Array.isArray(job?.tags)
    ? job.tags
    : typeof job?.skills === 'string'
    ? job.skills.split(',').map((s: string) => s.trim())
    : [];

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!applyLink) {
      alert('No job link available to copy.');
      return;
    }
    navigator.clipboard
      .writeText(applyLink)
      .then(() => alert('Job link copied to clipboard!'))
      .catch(() => alert('Could not copy link.'));
  };

  return (
    <article
      role="button"
      onClick={onClick}
      className={`relative block w-full bg-white rounded-xl transition-shadow duration-200 overflow-hidden
        border ${selected ? 'border-sky-500' : 'border-gray-300'} shadow-sm hover:shadow-md`}
      style={{ minHeight: 320 }}
    >
      {/* Top strip / header (shows gradient when selected to match Figma) */}
      <div
        className={`px-6 pt-4 pb-3 flex items-start justify-between ${
          selected ? 'bg-gradient-to-b from-sky-50 to-white' : 'bg-white'
        }`}
      >
        {/* Left: brand mark / logo */}
        <div className="flex items-start gap-3">
          {/* small brand mark similar to the 'W' with arc in the Figma */}
          {logo ? (
            <img
              src={logo}
              alt={`${company || 'company'} logo`}
              className="h-9 w-9 object-contain rounded-full border border-gray-200 shadow-sm"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center border border-gray-200"
              aria-hidden
            >
              {/* simple placeholder "W" mark */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M3 7c0-3 6-5 9-5s9 2 9 5" stroke="#F6A623" strokeWidth="1.4" strokeLinecap="round" />
                <text x="6" y="16" fontSize="10" fontWeight="700" fill="#0B74DE">W</text>
              </svg>
            </div>
          )}
        </div>

        {/* Right: posted time */}
        <div className="text-gray-500 text-xs flex items-center gap-1 select-none pr-1">
          <IconClock />
          <span>{posted || 'Just now'}</span>
        </div>
      </div>

      {/* Body content */}
      <div className="px-6 pb-6 pt-2">
        {/* Title */}
        <h3 className="text-sky-600 text-lg font-semibold leading-snug mb-1">
          <HighlightMark text={jobTitle || ''} query={searchQuery} />
        </h3>

        {/* Company + links + location + remote pill */}
        <div className="flex flex-wrap items-center gap-2 mb-3 text-sm">
          <span className="text-gray-700 font-medium">{company}</span>

          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-sky-500 underline text-xs"
            >
              Website
            </a>
          )}

          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-sky-500 underline text-xs"
            >
              LinkedIn
            </a>
          )}

          <span className="mx-1 text-gray-300">•</span>

          {/* location pill */}
          {location && (
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1 bg-sky-50 text-sky-700 rounded-lg">
              <IconPin />
              <span className="truncate max-w-[10rem]">{location}</span>
            </span>
          )}

          {/* remote / employment type pills */}
          {isRemote && (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">remote</span>
          )}
          {employmentType && <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">{employmentType}</span>}
        </div>

        {/* Salary / publisher badges row */}
        <div className="flex flex-wrap gap-2 mb-3">
          {salary && (
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1 bg-sky-50 text-sky-700 rounded-lg">
              <IconMoney />
              <span className="font-medium text-xs">{salary}</span>
            </span>
          )}

          {publisher && <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">via {publisher}</span>}
        </div>

        {/* About the role heading + truncated description */}
        <div className="mt-1">
          <div className="text-gray-500 text-xs mb-1">About the role</div>

          {/* Multiline clamp (3 lines). Requires @tailwindcss/line-clamp plugin or fallback CSS */}
          <p
            className="text-gray-700 text-sm leading-relaxed line-clamp-3"
            title={jobDescription}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {jobDescription}
          </p>
        </div>

        {/* optional highlights (qualifications / responsibilities) - small, unobtrusive */}
        {jobHighlights && (
          <div className="mt-3 text-xs text-gray-600">
            {jobHighlights.Qualifications && Array.isArray(jobHighlights.Qualifications) && (
              <div className="mb-1">
                <strong className="text-gray-700">Qualifications:</strong>
                <ul className="list-disc list-inside ml-3 mt-1 max-h-20 overflow-hidden text-xs">
                  {jobHighlights.Qualifications.slice(0, 3).map((q: string, i: number) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* CTA area: either compact actions (Apply / Save / Share) or full-width View Job when selected */}
        <div className="mt-4">
          {selected ? (
            // Selected card shows a full-width primary button like the Figma screenshot
            <div className="pt-3">
              <a
                href={applyLink || '#'}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!applyLink) e.preventDefault();
                }}
                target={applyLink ? '_blank' : undefined}
                rel={applyLink ? 'noopener noreferrer' : undefined}
                className="block w-full text-center text-white font-semibold rounded-md py-3 bg-sky-600 hover:bg-sky-700 transition"
                aria-label="View Job"
              >
                View Job
              </a>
            </div>
          ) : (
            // Compact action row for non-selected cards (matches left two cards in the screenshot)
            <div className="flex items-center justify-between gap-3">
              <a
                href={applyLink || '#'}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!applyLink) e.preventDefault();
                }}
                target={applyLink ? '_blank' : undefined}
                rel={applyLink ? 'noopener noreferrer' : undefined}
                className="text-sky-600 hover:underline text-sm font-semibold"
              >
                Apply / View Job
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSave();
                  }}
                  className={`text-xs px-3 py-1 rounded-lg border font-semibold transition-colors duration-200 ${
                    saved ? 'bg-white text-sky-700 border-sky-700 shadow' : 'bg-sky-600 text-white border-sky-600 hover:bg-white hover:text-sky-700'
                  }`}
                  aria-pressed={saved}
                >
                  {saved ? 'Saved' : 'Save'}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare(e);
                  }}
                  className="text-xs px-3 py-1 rounded-lg border border-sky-200 text-sky-700 bg-white hover:bg-sky-50 font-semibold transition"
                  aria-label="Share job"
                >
                  Share
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default JobCard;
