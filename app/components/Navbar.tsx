import {Link} from "react-router";

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link to="/">
                <p className="text-2xl font-bold text-gradient">RESUMIND</p>
            </Link>
            <Link to="/jobs" className="primary-button w-fit">
                Find Jobs
            </Link>
            <Link to="/auth" className="primary-button w-fit">
                Sign In
            </Link>
            <Link to="/auth/logout" className="primary-button w-fit">
                Log Out as Employer
            </Link>
            <Link to="/upload" className="primary-button w-fit">
                Upload Resume
            </Link>
        </nav>
    )
}
export default Navbar
