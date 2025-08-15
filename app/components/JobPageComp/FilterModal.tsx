import React, { useEffect, useRef, useState } from 'react';

type Setter = (v: string | null) => void;

interface FilterModalProps {
  open: boolean;
  onClose: () => void;

  // current values + setters
  datePosted: string | null;
  setDatePosted: Setter;
  experienceLevel: string | null;
  setExperienceLevel: Setter;
  commitment: string | null;
  setCommitment: Setter;
  salaryRange: string | null;
  setSalaryRange: Setter;
  companyFilter: string | null;
  setCompanyFilter: Setter;

  companyOptions: string[];

  // clear all helper (optional override)
  onClearAll?: () => void;
}

const datePostedOptions = ['Any time', 'Last 24 hours', 'Last 3 days', 'Last 7 days', 'Last 30 days'];
const experienceOptions = ['Any', 'Entry level', 'Mid level', 'Senior level'];
const commitmentOptions = ['Any', 'Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'];
const salaryOptions = ['Any', '$0 - $50k', '$50k - $100k', '$100k+'];

const FilterModal: React.FC<FilterModalProps> = ({
  open,
  onClose,
  datePosted,
  setDatePosted,
  experienceLevel,
  setExperienceLevel,
  commitment,
  setCommitment,
  salaryRange,
  setSalaryRange,
  companyFilter,
  setCompanyFilter,
  companyOptions,
  onClearAll,
}) => {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // local state (allow preview before applying)
  const [localDatePosted, setLocalDatePosted] = useState<string | null>(datePosted);
  const [localExperience, setLocalExperience] = useState<string | null>(experienceLevel);
  const [localCommitment, setLocalCommitment] = useState<string | null>(commitment);
  const [localSalary, setLocalSalary] = useState<string | null>(salaryRange);
  const [localCompany, setLocalCompany] = useState<string | null>(companyFilter);

  // sync when modal opens/closes or parent values change
  useEffect(() => {
    if (open) {
      setLocalDatePosted(datePosted);
      setLocalExperience(experienceLevel);
      setLocalCommitment(commitment);
      setLocalSalary(salaryRange);
      setLocalCompany(companyFilter);
      // focus when open
      setTimeout(() => {
        const first = dialogRef.current?.querySelector<HTMLElement>('button[data-autofocus], input, select, textarea');
        first?.focus();
      }, 0);
    }
  }, [open, datePosted, experienceLevel, commitment, salaryRange, companyFilter]);

  // close on Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // click outside to close
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!open) return;
      if (!dialogRef.current) return;
      if (!dialogRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, onClose]);

  if (!open) return null;

  const applyAndClose = () => {
    setDatePosted(localDatePosted);
    setExperienceLevel(localExperience);
    setCommitment(localCommitment);
    setSalaryRange(localSalary);
    setCompanyFilter(localCompany);
    onClose();
  };

  const clearAllLocal = () => {
    setLocalDatePosted(null);
    setLocalExperience(null);
    setLocalCommitment(null);
    setLocalSalary(null);
    setLocalCompany(null);
    if (onClearAll) onClearAll();
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4 sm:p-6"
      aria-modal="true"
      role="dialog"
      aria-label="Filter jobs"
    >
      <div
        ref={dialogRef}
        className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden transform transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <p className="text-xs text-gray-500">Refine job results</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearAllLocal}
              className="text-sm px-3 py-1 rounded-md bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100"
            >
              Clear
            </button>

            <button
              onClick={onClose}
              aria-label="Close filters"
              className="text-sm px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              onClick={applyAndClose}
              data-autofocus
              className="text-sm px-4 py-1 rounded-md bg-sky-600 text-white hover:bg-sky-700"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 max-h-[70vh] overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column: main filters */}
            <div className="space-y-6">
              <section>
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Date posted</h4>
                <div className="flex flex-col gap-2">
                  {datePostedOptions.map((opt) => (
                    <label key={opt} className="inline-flex items-center gap-3">
                      <input
                        type="radio"
                        name="datePosted"
                        checked={localDatePosted === opt}
                        onChange={() => setLocalDatePosted(opt === localDatePosted ? null : opt)}
                        className="form-radio"
                      />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section>
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Experience level</h4>
                <div className="flex flex-col gap-2">
                  {experienceOptions.map((opt) => (
                    <label key={opt} className="inline-flex items-center gap-3">
                      <input
                        type="radio"
                        name="experience"
                        checked={localExperience === opt}
                        onChange={() => setLocalExperience(opt === localExperience ? null : opt)}
                        className="form-radio"
                      />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section>
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Commitment</h4>
                <div className="flex flex-col gap-2">
                  {commitmentOptions.map((opt) => (
                    <label key={opt} className="inline-flex items-center gap-3">
                      <input
                        type="radio"
                        name="commitment"
                        checked={localCommitment === opt}
                        onChange={() => setLocalCommitment(opt === localCommitment ? null : opt)}
                        className="form-radio"
                      />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </section>
            </div>

            {/* Right column: salary & company */}
            <div className="space-y-6">
              <section>
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Salary</h4>
                <div className="flex flex-col gap-2">
                  {salaryOptions.map((opt) => (
                    <label key={opt} className="inline-flex items-center gap-3">
                      <input
                        type="radio"
                        name="salary"
                        checked={localSalary === opt}
                        onChange={() => setLocalSalary(opt === localSalary ? null : opt)}
                        className="form-radio"
                      />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section>
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Company</h4>
                <div className="border rounded-lg p-2 max-h-52 overflow-auto">
                  {/* searchable input */}
                  <input
                    type="text"
                    placeholder="Type to search companies..."
                    value={localCompany ?? ''}
                    onChange={(e) => setLocalCompany(e.target.value || null)}
                    className="w-full px-3 py-2 border rounded-md text-sm mb-3"
                  />

                  {/* list (click to choose) */}
                  <div className="space-y-1">
                    {companyOptions.length === 0 && <div className="text-sm text-gray-500">No companies</div>}
                    {companyOptions.map((c) => {
                      const matches = localCompany ? c.toLowerCase().includes(localCompany.toLowerCase()) : true;
                      if (!matches) return null;
                      const isSelected = localCompany === c;
                      return (
                        <button
                          key={c}
                          onClick={() => setLocalCompany(isSelected ? null : c)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm ${isSelected ? 'bg-sky-50 text-sky-700 font-semibold' : 'hover:bg-gray-50 text-gray-700'}`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Footer (mobile sticky) */}
        <div className="px-6 py-4 border-t flex items-center justify-between gap-4">
          <div className="text-sm text-gray-500">Showing detailed filter options</div>
          <div className="flex items-center gap-2">
            <button onClick={clearAllLocal} className="px-3 py-2 rounded-md bg-white border text-sm">Clear</button>
            <button onClick={onClose} className="px-3 py-2 rounded-md bg-white border text-sm">Cancel</button>
            <button onClick={applyAndClose} className="px-4 py-2 rounded-md bg-sky-600 text-white text-sm">Apply filters</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
