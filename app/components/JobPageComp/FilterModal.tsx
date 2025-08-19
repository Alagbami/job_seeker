// components/FilterModal.tsx
import React, { useEffect, useRef, useState } from 'react';

type Setter = (v: string | null) => void;

interface FilterModalProps {
  open: boolean;
  onClose: () => void;

  // current values + setters (we keep the same setter type for compat)
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

/**
 * NOTE:
 * - This modal supports MULTI-SELECT for each group.
 * - On "Apply" we call setters with either `null` (no selections) or a comma-separated string
 *   (e.g. "Entry level,Mid level"). Update your parent filtering logic to split on `,`
 *   and treat multiple entries as an OR-set when filtering.
 */

const datePostedOptions = ['Any time', 'Last 24 hours', 'Last 3 days', 'Last 7 days', 'Last 30 days'];
const experienceOptions = ['Any', 'Entry level', 'Mid level', 'Senior level'];
const commitmentOptions = ['Any', 'Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'];
const salaryOptions = ['Any', '$0 - $50k', '$50k - $100k', '$100k+'];

/**
 * Changed here: reduced width of checkbox parent by using max-w-xs instead of w-full.
 * max-w-xs == 20rem (320px). Adjust if you want it narrower/wider (e.g. max-w-sm).
 */
const checkboxBaseClass = 'inline-flex items-center gap-3 max-w-xs cursor-pointer rounded-md px-2 py-2 hover:bg-gray-50';

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

  // Local multi-select arrays
  const parseToArray = (v: string | null) =>
    v && v.trim() ? v.split(',').map((s) => s.trim()).filter(Boolean) : [];

  const [localDatePosted, setLocalDatePosted] = useState<string[]>(parseToArray(datePosted));
  const [localExperience, setLocalExperience] = useState<string[]>(parseToArray(experienceLevel));
  const [localCommitment, setLocalCommitment] = useState<string[]>(parseToArray(commitment));
  const [localSalary, setLocalSalary] = useState<string[]>(parseToArray(salaryRange));
  const [localCompanies, setLocalCompanies] = useState<string[]>(parseToArray(companyFilter));

  // company search text (for filtering long lists)
  const [companySearch, setCompanySearch] = useState<string>('');

  // sync when modal opens or parent values change
  useEffect(() => {
    if (open) {
      setLocalDatePosted(parseToArray(datePosted));
      setLocalExperience(parseToArray(experienceLevel));
      setLocalCommitment(parseToArray(commitment));
      setLocalSalary(parseToArray(salaryRange));
      setLocalCompanies(parseToArray(companyFilter));
      setCompanySearch('');
      // focus first control
      setTimeout(() => {
        const first = dialogRef.current?.querySelector<HTMLElement>('input[type="checkbox"], input[type="text"], button[data-autofocus]');
        first?.focus();
      }, 50);
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

  // helpers to toggle a value into an array (and handle "Any" semantics)
  const toggleValue = (arr: string[], setter: (v: string[]) => void, val: string) => {
    // if clicking "Any": select only Any (clear others)
    if (val === 'Any' || val === 'Any time') {
      if (arr.length === 1 && arr[0] === val) {
        setter([]);
      } else {
        setter([val]);
      }
      return;
    }

    // If "Any" currently selected, remove it and add val
    if (arr.includes('Any') || arr.includes('Any time')) {
      setter([val]);
      return;
    }

    const idx = arr.indexOf(val);
    if (idx === -1) setter([...arr, val]);
    else {
      const copy = arr.slice();
      copy.splice(idx, 1);
      setter(copy);
    }
  };

  const applyAndClose = () => {
    // Convert arrays to comma-separated strings (or null)
    setDatePosted(localDatePosted.length ? localDatePosted.join(',') : null);
    setExperienceLevel(localExperience.length ? localExperience.join(',') : null);
    setCommitment(localCommitment.length ? localCommitment.join(',') : null);
    setSalaryRange(localSalary.length ? localSalary.join(',') : null);
    setCompanyFilter(localCompanies.length ? localCompanies.join(',') : null);
    onClose();
  };

  const clearAllLocal = () => {
    setLocalDatePosted([]);
    setLocalExperience([]);
    setLocalCommitment([]);
    setLocalSalary([]);
    setLocalCompanies([]);
    setCompanySearch('');
    if (onClearAll) onClearAll();
  };

  // filtered company list by search
  const filteredCompanies = companyOptions.filter((c) =>
    c.toLowerCase().includes(companySearch.trim().toLowerCase())
  );

  const companyToggle = (name: string) => {
    const idx = localCompanies.indexOf(name);
    if (idx === -1) setLocalCompanies([...localCompanies, name]);
    else {
      const copy = localCompanies.slice();
      copy.splice(idx, 1);
      setLocalCompanies(copy);
    }
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
            <p className="text-xs text-gray-500">Refine job results — select one or more options</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearAllLocal}
              className="text-sm px-3 py-1 rounded-md bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100"
              type="button"
            >
              Clear
            </button>

            <button
              onClick={onClose}
              aria-label="Close filters"
              className="text-sm px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              type="button"
            >
              Cancel
            </button>

            <button
              onClick={applyAndClose}
              data-autofocus
              className="text-sm px-4 py-1 rounded-md bg-sky-600 text-white hover:bg-sky-700"
              type="button"
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
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Date posted</h4>
                <div className="grid gap-2">
                  {datePostedOptions.map((opt) => {
                    const checked = localDatePosted.includes(opt);
                    return (
                      <label key={opt} className={checkboxBaseClass}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleValue(localDatePosted, setLocalDatePosted, opt)}
                          className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                          aria-checked={checked}
                        />
                        <span className="text-sm text-gray-700">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </section>

              <section>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Experience level</h4>
                <div className="grid gap-2">
                  {experienceOptions.map((opt) => {
                    const checked = localExperience.includes(opt);
                    return (
                      <label key={opt} className={checkboxBaseClass}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleValue(localExperience, setLocalExperience, opt)}
                          className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                          aria-checked={checked}
                        />
                        <span className="text-sm text-gray-700">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </section>

              <section>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Commitment</h4>
                <div className="grid gap-2">
                  {commitmentOptions.map((opt) => {
                    const checked = localCommitment.includes(opt);
                    return (
                      <label key={opt} className={checkboxBaseClass}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleValue(localCommitment, setLocalCommitment, opt)}
                          className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                          aria-checked={checked}
                        />
                        <span className="text-sm text-gray-700">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Right column: salary & company */}
            <div className="space-y-6">
              <section>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Salary</h4>
                <div className="grid gap-2">
                  {salaryOptions.map((opt) => {
                    const checked = localSalary.includes(opt);
                    return (
                      <label key={opt} className={checkboxBaseClass}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleValue(localSalary, setLocalSalary, opt)}
                          className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                          aria-checked={checked}
                        />
                        <span className="text-sm text-gray-700">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </section>

              <section>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Company</h4>
                <div className="border rounded-lg p-2 max-h-52 overflow-auto">
                  {/* searchable input */}
                  <input
                    type="text"
                    placeholder="Type to search companies..."
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm mb-3 focus:outline-none focus:ring-1 focus:ring-sky-200"
                  />

                  {/* list (checkboxes) */}
                  <div className="space-y-1">
                    {filteredCompanies.length === 0 && (
                      <div className="text-sm text-gray-500">No companies</div>
                    )}
                    {filteredCompanies.map((c) => {
                      const isSelected = localCompanies.includes(c);
                      return (
                        <label key={c} className={checkboxBaseClass}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => companyToggle(c)}
                            className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                            aria-checked={isSelected}
                          />
                          <span className={`text-sm ${isSelected ? 'text-sky-700 font-semibold' : 'text-gray-700'}`}>{c}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Footer (sticky) */}
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
