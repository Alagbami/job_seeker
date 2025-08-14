// components/JobDetailsModal.tsx
import React, { useEffect, useRef, useState } from 'react';

interface JobDetailsModalProps {
  job: any;
  onClose: () => void;
}

const escapeHtml = (unsafe: string) =>
  unsafe
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const formatDescriptionToHtml = (text: string) => {
  if (!text) return '';
  // Normalize line breaks and create paragraphs for double newlines
  const escaped = escapeHtml(text);
  // Turn double line breaks into paragraphs
  return escaped
    .split(/\n\s*\n/)
    .map((p) => `<p class="mb-3 leading-relaxed text-gray-700 text-sm">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');
};

const IconClose = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconShare = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 6l-4-4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 2v14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconMapPin = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 1118 0z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="10" r="2.2" fill="currentColor" />
  </svg>
);

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, onClose }) => {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // focus the dialog for accessibility
    const el = dialogRef.current;
    el?.focus();

    // prevent background scroll while modal is open
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        // noop - avoid interfering, but possible place for shortcuts
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!job) return null;

  // Normalize fields (fall back to possible keys)
  const logo = job.employer_logo || job.company_logo || '';
  const company = job.employer_name || job.company_name || '';
  const website = job.employer_website || '';
  const linkedin = job.employer_linkedin || '';
  const title = job.job_title || job.job_job_title || job.title || '';
  const location = job.job_location || `${job.job_city || ''}${job.job_state ? ', ' + job.job_state : ''}` || '';
  const posted = job.job_posted_human_readable || job.job_posted_at || '';
  const employmentType = job.job_employment_type_text || job.job_employment_type || job.job_employment_types?.[0] || '';
  const isRemote = !!job.job_is_remote;
  const salary = job.job_salary || (job.job_min_salary || job.job_max_salary ? `${job.job_min_salary || ''} - ${job.job_max_salary || ''}` : '');
  const descriptionHtml = formatDescriptionToHtml(job.job_description || '');
  const benefits = job.job_benefits || job.job_benefit || job.job_benefits_text || '';
  const publisher = job.job_publisher || job.publisher || '';
  const applyLink = job.job_apply_link || job.job_google_link || job.job_apply_link_display || '';
  const googleLink = job.job_google_link || '';
  const lat = job.job_latitude;
  const lon = job.job_longitude;

  const highlights = job.job_highlights || {};
  const qualifications: string[] = Array.isArray(highlights.Qualifications) ? highlights.Qualifications : [];
  const responsibilities: string[] = Array.isArray(highlights.Responsibilities) ? highlights.Responsibilities : [];

  const applyOptions: any[] = Array.isArray(job.apply_options) ? job.apply_options : [];

  const handleCopy = async () => {
    const toCopy = applyLink || googleLink || window.location.href;
    try {
      await navigator.clipboard.writeText(toCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      alert('Could not copy link — please copy manually.');
    }
  };

  const openMaps = () => {
    if (lat && lon) {
      const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lon}`)}`;
      window.open(maps, '_blank', 'noopener');
    } else if (location) {
      const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
      window.open(maps, '_blank', 'noopener');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6 md:px-8 bg-black/60"
      onMouseDown={handleBackdropClick}
      aria-hidden={false}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${title} at ${company}`}
        ref={dialogRef}
        tabIndex={-1}
        className="bg-white rounded-2xl w-full max-w-5xl mx-auto shadow-2xl overflow-hidden"
        style={{ maxHeight: '90vh' }}
      >
        {/* Modal header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-gray-100 bg-gradient-to-b from-sky-50 to-white">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              {logo ? (
                <img src={logo} alt={`${company} logo`} className="h-14 w-14 rounded-md object-contain border border-gray-200" />
              ) : (
                <div className="h-14 w-14 rounded-md bg-gray-100 flex items-center justify-center text-sky-600 font-bold">Co</div>
              )}
            </div>

            <div className="min-w-0">
              <h2 className="text-sky-700 text-lg sm:text-xl font-semibold leading-tight truncate">{title}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span className="font-medium text-gray-800">{company}</span>
                {publisher && <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{publisher}</span>}
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <svg className="h-4 w-4 inline-block" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                  <span>{posted}</span>
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {location && (
                  <button
                    onClick={openMaps}
                    type="button"
                    className="inline-flex items-center gap-2 px-3 py-1 text-xs rounded-lg bg-sky-50 text-sky-700"
                    aria-label={`Open location in maps: ${location}`}
                  >
                    <IconMapPin />
                    <span className="truncate max-w-[14rem]">{location}</span>
                  </button>
                )}

                {employmentType && <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700">{employmentType}</span>}
                {isRemote && <span className="text-xs px-2 py-1 bg-purple-50 rounded-full text-purple-700">Remote</span>}
                {salary && <span className="text-xs px-2 py-1 bg-green-50 rounded-full text-green-700">{salary}</span>}
              </div>
            </div>
          </div>

          {/* Actions in header */}
          <div className="flex items-center gap-3">
            <a
              href={website || '#'}
              target={website ? '_blank' : undefined}
              rel={website ? 'noopener noreferrer' : undefined}
              onClick={(e) => website || e.preventDefault()}
              className="hidden sm:inline-block text-sm text-sky-600 underline"
            >
              View company
            </a>

            <button
              onClick={() => {
                setSaved((s) => !s);
              }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold ${
                saved ? 'bg-white text-sky-700 border border-sky-700 shadow-sm' : 'bg-sky-600 text-white'
              }`}
              aria-pressed={saved}
            >
              {saved ? 'Saved' : 'Save'}
            </button>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm border border-gray-200 bg-white"
              aria-label="Copy job link"
            >
              <IconShare />
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>

            <button onClick={onClose} aria-label="Close" className="ml-1 inline-flex items-center p-2 rounded-full text-gray-600 hover:bg-gray-50">
              <IconClose />
            </button>
          </div>
        </div>

        {/* Modal body */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left/Main column */}
            <div className="md:col-span-2">
              {/* About */}
              <section className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">About the role</h3>
                {descriptionHtml ? (
                  <div
                    className="prose prose-sm max-w-none"
                    // We created safe HTML from plain text (escaped + paragraphed) above
                    dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                  />
                ) : (
                  <p className="text-sm text-gray-600">No description available.</p>
                )}
              </section>

              {/* Responsibilities */}
              {responsibilities.length > 0 && (
                <section className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Responsibilities</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                    {responsibilities.map((r: string, i: number) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Qualifications */}
              {qualifications.length > 0 && (
                <section className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Qualifications</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                    {qualifications.map((q: string, i: number) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Benefits */}
              {benefits && (
                <section className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Benefits</h4>
                  <p className="text-sm text-gray-700">{benefits}</p>
                </section>
              )}
            </div>

            {/* Right column (company & apply) */}
            <aside className="md:col-span-1">
              <div className="sticky top-6 space-y-4">
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{company}</p>
                      <p className="text-xs text-gray-500 truncate">{job.job_naics_name || job.job_company_type || ''}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col gap-2">
                    {/* Primary apply button */}
                    <a
                      href={applyLink || googleLink || '#'}
                      onClick={(e) => {
                        if (!applyLink && !googleLink) e.preventDefault();
                      }}
                      target={applyLink || googleLink ? '_blank' : undefined}
                      rel={applyLink || googleLink ? 'noopener noreferrer' : undefined}
                      className="block text-center w-full px-4 py-2 bg-sky-600 text-white font-semibold rounded-md shadow-sm hover:bg-sky-700 transition"
                      aria-label="Apply to this job"
                    >
                      Apply / View Job
                    </a>

                    {/* Apply options (if any) */}
                    {applyOptions.length > 0 && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Apply options</div>
                        <ul className="space-y-2">
                          {applyOptions.map((opt: any, i: number) => {
                            // Try to display nice fields if present
                            const label = opt?.platform || opt?.provider || opt?.display || opt?.type || JSON.stringify(opt);
                            const link = opt?.url || opt?.link || opt?.apply_link || opt?.apply_url;
                            return (
                              <li key={i}>
                                {link ? (
                                  <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="truncate inline-flex items-center gap-2 text-xs px-3 py-1 rounded-md bg-white border border-gray-200 w-full"
                                  >
                                    {label}
                                  </a>
                                ) : (
                                  <div className="text-xs text-gray-600">{label}</div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {/* Links row */}
                    <div className="flex gap-2 mt-2">
                      {website && (
                        <a
                          href={website}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 text-center text-xs px-3 py-2 border border-gray-200 rounded-md"
                        >
                          Company site
                        </a>
                      )}
                      {linkedin && (
                        <a
                          href={linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 text-center text-xs px-3 py-2 border border-gray-200 rounded-md hidden sm:inline-flex items-center justify-center"
                        >
                          LinkedIn
                        </a>
                      )}
                    </div>

                    {/* Publisher / posted meta */}
                    <div className="mt-3 text-xs text-gray-500">
                      <div>Posted: <span className="text-gray-700 font-medium">{posted}</span></div>
                      {publisher && <div className="mt-1">Source: <span className="text-gray-700 font-medium">{publisher}</span></div>}
                    </div>
                  </div>
                </div>

                {/* Additional company info / quick facts */}
                <div className="p-4 rounded-lg border border-gray-100">
                  <h5 className="text-xs font-semibold text-gray-700 mb-2">Quick facts</h5>
                  <dl className="text-sm text-gray-700 space-y-2">
                    {employmentType && (
                      <div>
                        <dt className="text-xs text-gray-500">Employment</dt>
                        <dd>{employmentType}</dd>
                      </div>
                    )}
                    {isRemote && (
                      <div>
                        <dt className="text-xs text-gray-500">Remote</dt>
                        <dd>Available</dd>
                      </div>
                    )}
                    {salary && (
                      <div>
                        <dt className="text-xs text-gray-500">Salary</dt>
                        <dd>{salary}</dd>
                      </div>
                    )}
                    {job.job_onet_job_zone && (
                      <div>
                        <dt className="text-xs text-gray-500">Job zone</dt>
                        <dd className="capitalize">{String(job.job_onet_job_zone)}</dd>
                      </div>
                    )}
                    {job.job_occupational_categories && (
                      <div>
                        <dt className="text-xs text-gray-500">Categories</dt>
                        <dd className="truncate">{String(job.job_occupational_categories)}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Footer small area for mobile actions */}
        <div className="border-t border-gray-100 p-4 bg-white flex items-center justify-between gap-3">
          <div className="text-sm text-gray-600">Share or open the job externally</div>

          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-2 bg-white border border-gray-200 rounded-md text-sm"
            >
              {copied ? 'Copied' : 'Copy link'}
            </button>

            <a
              href={applyLink || googleLink || '#'}
              onClick={(e) => {
                if (!applyLink && !googleLink) e.preventDefault();
              }}
              target={applyLink || googleLink ? '_blank' : undefined}
              rel={applyLink || googleLink ? 'noopener noreferrer' : undefined}
              className="px-4 py-2 bg-sky-600 text-white rounded-md text-sm font-semibold"
            >
              Apply / View
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;
