// components/Pagination.tsx
import React from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPrev, onNext }) => {
  return (
    <div className="flex gap-4 mt-10 animate-fadeIn items-center justify-center">
      <button className="back-button" onClick={onPrev} disabled={page === 1}>Prev</button>
      <span className="text-dark-200 font-semibold">Page {page} of {totalPages}</span>
      <button className="back-button" onClick={onNext} disabled={page >= totalPages}>Next</button>
    </div>
  );
};

export default Pagination;
