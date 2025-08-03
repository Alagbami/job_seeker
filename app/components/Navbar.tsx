import { Link } from "react-router";
import { useState, useEffect, useRef } from "react";
import { usePuterStore } from "~/lib/puter";

// Auth hook using usePuterStore for sign in/out and status
const useAuth = () => {
  const { auth } = usePuterStore();
  const isAuthenticated = !!auth?.isAuthenticated;
  const signIn = auth?.signIn || (() => {});
  const signOut = auth?.signOut || (() => {});
  return { isAuthenticated, signIn, signOut };
};

const Navbar = () => {
  const { isAuthenticated, signIn, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on navigation
  const handleNavClick = () => setMenuOpen(false);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <nav className="mx-auto sm:max-w-[40%] lg:w-1/2 flex justify-between items-center m-4 p-4 bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <Link to="/" onClick={handleNavClick}>
        <p className="text-2xl font-bold text-gradient">RESUMIND</p>
      </Link>

      {/* Hamburger for mobile */}
      <button
        className="md:hidden flex flex-col justify-center items-center w-8 h-8"
        aria-label="Toggle menu"
        onClick={() => setMenuOpen(prev => !prev)}
      >
        <span
          className={`block h-1 w-6 bg-gray-800 mb-1 rounded transition-all ${
            menuOpen ? "rotate-45 translate-y-2" : ""
          }`}
        />
        <span
          className={`block h-1 w-6 bg-gray-800 mb-1 rounded transition-all ${
            menuOpen ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block h-1 w-6 bg-gray-800 rounded transition-all ${
            menuOpen ? "-rotate-45 -translate-y-2" : ""
          }`}
        />
      </button>

      {/* Desktop menu */}
      <div className="hidden md:flex gap-4 items-center">
        <Link to="/jobs" className="primary-button w-fit" onClick={handleNavClick}>
          Find Jobs
        </Link>
        <Link to="/upload" className="primary-button w-fit" onClick={handleNavClick}>
          Upload Resume
        </Link>
        {isAuthenticated ? (
          <button
            className="primary-button w-fit"
            onClick={() => {
              signOut();
              handleNavClick();
            }}
          >
            Sign Out
          </button>
        ) : (
          <button
            className="primary-button w-fit"
            onClick={() => {
              signIn();
              handleNavClick();
            }}
          >
            Sign In
          </button>
        )}
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute top-full left-0 w-full bg-white shadow-md flex flex-col items-center gap-4 py-4 md:hidden z-50 transition-all duration-300 ease-in-out animate-fadeIn"
        >
          <Link to="/jobs" className="primary-button w-fit" onClick={handleNavClick}>
            Find Jobs
          </Link>
          <Link to="/upload" className="primary-button w-fit" onClick={handleNavClick}>
            Upload Resume
          </Link>
          {isAuthenticated ? (
            <button
              className="primary-button w-fit"
              onClick={() => {
                signOut();
                handleNavClick();
              }}
            >
              Sign Out
            </button>
          ) : (
            <button
              className="primary-button w-fit"
              onClick={() => {
                signIn();
                handleNavClick();
              }}
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
