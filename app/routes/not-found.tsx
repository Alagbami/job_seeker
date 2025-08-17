import React from "react";

export default function NotFound() {
    return (
        <div style={{ textAlign: "center", marginTop: "5rem" }}>
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
            <a href="/" style={{ color: "#0070f3", textDecoration: "underline" }}>
                Go back home
            </a>
        </div>
    );
}