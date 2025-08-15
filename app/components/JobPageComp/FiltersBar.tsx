import React, { useState } from 'react';
import FilterModal from './FilterModal';

interface FiltersBarProps {
  datePosted: string | null;
  setDatePosted: (v: string | null) => void;
  experienceLevel: string | null;
  setExperienceLevel: (v: string | null) => void;
  commitment: string | null;
  setCommitment: (v: string | null) => void;
  salaryRange: string | null;
  setSalaryRange: (v: string | null) => void;
  companyFilter: string | null;
  setCompanyFilter: (v: string | null) => void;
  companyOptions: string[];
  onClearAll: () => void;
}

const FiltersBar: React.FC<FiltersBarProps> = ({
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
  const [openModal, setOpenModal] = useState(false);

  // display chips for active filters
  const chips: { label: string; onRemove: () => void }[] = [];

  if (datePosted && datePosted !== 'Any time') {
    chips.push({ label: `Date: ${datePosted}`, onRemove: () => setDatePosted(null) });
  }
  if (experienceLevel && experienceLevel !== 'Any') {
    chips.push({ label: `Exp: ${experienceLevel}`, onRemove: () => setExperienceLevel(null) });
  }
  if (commitment && commitment !== 'Any') {
    chips.push({ label: `Commitment: ${commitment}`, onRemove: () => setCommitment(null) });
  }
  if (salaryRange && salaryRange !== 'Any') {
    chips.push({ label: `Salary: ${salaryRange}`, onRemove: () => setSalaryRange(null) });
  }
  if (companyFilter && companyFilter !== 'No companies') {
    chips.push({ label: `Company: ${companyFilter}`, onRemove: () => setCompanyFilter(null) });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        <button
          onClick={() => setOpenModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm bg-sky-50 text-sky-800 text-sm font-medium border border-transparent hover:border-sky-100 focus:outline-none"
        >
          Filters
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M3 5h18M7 12h10M10 19h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Active filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {chips.map((c, idx) => (
            <div key={idx} className="inline-flex items-center gap-2 bg-white border px-3 py-1 rounded-full text-sm">
              <span className="text-gray-700">{c.label}</span>
              <button onClick={c.onRemove} aria-label={`Remove ${c.label}`} className="text-xs text-gray-500 px-1 hover:text-gray-700">✕</button>
            </div>
          ))}
        </div>

        <div className="ml-auto">
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
            onClick={onClearAll}
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* Modal */}
      <FilterModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        datePosted={datePosted}
        setDatePosted={setDatePosted}
        experienceLevel={experienceLevel}
        setExperienceLevel={setExperienceLevel}
        commitment={commitment}
        setCommitment={setCommitment}
        salaryRange={salaryRange}
        setSalaryRange={setSalaryRange}
        companyFilter={companyFilter}
        setCompanyFilter={setCompanyFilter}
        companyOptions={companyOptions}
        onClearAll={() => {
          setDatePosted(null);
          setExperienceLevel(null);
          setCommitment(null);
          setSalaryRange(null);
          setCompanyFilter(null);
          onClearAll();
        }}
      />
    </div>
  );
};

export default FiltersBar;
