// components/JobPageComp/SearchForm.tsx
import React from 'react';

interface SearchFormProps {
  query: string;
  onQueryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  location: string;
  onLocationChange: (val: string) => void;
  jobType: string;
  onJobTypeChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;

  // optional helpers
  onClearAll?: () => void;
  onUseMyLocation?: () => void;
}

const SearchIcon = (props: { className?: string }) => (
  <svg className={props.className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const XIcon = (props: { className?: string }) => (
  <svg className={props.className} viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SearchForm: React.FC<SearchFormProps> = ({
  query,
  onQueryChange,
  location,
  onLocationChange,
  jobType,
  onJobTypeChange,
  onSubmit,
  onClearAll,
  onUseMyLocation,
}) => {
  // helpers to clear fields even if parent didn't pass dedicated handlers
  const handleClearQuery = () => {
    // synthesize a change event-like object for compatibility
    const fakeEvt = { target: { value: '' } } as unknown as React.ChangeEvent<HTMLInputElement>;
    onQueryChange(fakeEvt);
  };

  const handleClearLocation = () => onLocationChange('');

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-6xl mt-6 animate-fadeIn px-4 sm:px-6 md:px-8"
      aria-label="Job search form"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        {/* Search input: large, primary */}
        <div className="col-span-1 md:col-span-6 relative">
          <label htmlFor="search-query" className="block text-sm font-medium text-gray-700 mb-1">
            Job title or keywords
          </label>

          <div className="relative">
            <input
              id="search-query"
              name="query"
              type="text"
              value={query}
              onChange={onQueryChange}
              placeholder="e.g., Frontend Developer, React, Typescript"
              className="block w-full rounded-md border border-gray-200 shadow-sm px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-sky-200 text-sm"
              aria-label="Search job title or keywords"
            />

            {/* Search icon - left */}
            <div className="absolute left-3 top-3 pointer-events-none">
              <SearchIcon className="h-4 w-4 text-gray-400" />
            </div>

            {/* Clear query button */}
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={handleClearQuery}
                className="absolute right-2 top-2.5 h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          <p className="mt-2 text-xs text-gray-500">Try different keywords to broaden results.</p>
        </div>

        {/* Location input */}
        <div className="col-span-1 md:col-span-3 relative">
          <label htmlFor="search-location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>

          <div className="relative">
            <input
              id="search-location"
              name="location"
              type="text"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="e.g., New York, Remote"
              className="block w-full rounded-md border border-gray-200 shadow-sm px-3 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-sky-200 text-sm"
              aria-label="Job location"
            />

            {/* Clear location */}
            {location && (
              <button
                type="button"
                aria-label="Clear location"
                onClick={handleClearLocation}
                className="absolute right-2 top-2.5 h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2">
            {onUseMyLocation && (
              <button
                type="button"
                onClick={onUseMyLocation}
                className="text-xs inline-flex items-center gap-2 px-2 py-1 rounded-md bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
              >
                Use my location
              </button>
            )}
            <span className="text-xs text-gray-400">Leave blank to search anywhere</span>
          </div>
        </div>

        {/* Job type select */}
        <div className="col-span-1 md:col-span-2">
          <label htmlFor="job-type" className="block text-sm font-medium text-gray-700 mb-1">
            Job type
          </label>
          <select
            id="job-type"
            name="type"
            value={jobType}
            onChange={(e) => onJobTypeChange(e.target.value)}
            className="block w-full rounded-md border border-gray-200 shadow-sm px-3 py-3 focus:outline-none focus:ring-2 focus:ring-sky-200 text-sm"
            aria-label="Job type"
          >
            <option value="">Any</option>
            <option value="remote">Remote</option>
            <option value="fulltime">Full-time</option>
            <option value="parttime">Part-time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
          </select>
        </div>

        {/* Search + optional clear-all */}
        <div className="col-span-1 md:col-span-1 flex items-center gap-2">
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-md font-semibold text-sm shadow"
            aria-label="Search jobs"
          >
            <SearchIcon className="h-4 w-4 text-white" />
            Search
          </button>

          {onClearAll && (
            <button
              type="button"
              onClick={onClearAll}
              className="hidden md:inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              aria-label="Clear form"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default SearchForm;
