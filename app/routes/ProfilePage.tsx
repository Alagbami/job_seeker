import React, { useState } from "react";

const mockUser = {
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  name: "Alex Johnson",
  email: "alex.johnson@email.com",
  headline: "Full Stack Developer",
  location: "San Francisco, CA",
  bio: "Passionate about building scalable web apps and delightful user experiences. Always learning, always growing.",
  skills: ["React", "Node.js", "TypeScript", "GraphQL", "TailwindCSS"],
  resumeUrl: "/resume/alex-johnson.pdf",
  linkedin: "https://linkedin.com/in/alexjohnson",
  github: "https://github.com/alexjohnson",
};

const ProfilePage: React.FC = () => {
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(mockUser.bio);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center py-10 px-4">
      <section className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 flex flex-col items-center">
        {/* Avatar & Name */}
        <img
          src={mockUser.avatar}
          alt={mockUser.name}
          className="h-28 w-28 rounded-full border-4 border-blue-200 object-cover shadow mb-4"
        />
        <h1 className="text-2xl font-bold text-blue-900">{mockUser.name}</h1>
        <p className="text-blue-700 font-medium">{mockUser.headline}</p>
        <p className="text-gray-500 text-sm">{mockUser.location}</p>

        {/* Contact & Links */}
        <div className="flex gap-4 mt-4">
          <a
            href={`mailto:${mockUser.email}`}
            className="text-gray-700 hover:text-blue-700 underline text-sm"
          >
            {mockUser.email}
          </a>
          <a
            href={mockUser.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 hover:text-blue-900 underline text-sm"
          >
            LinkedIn
          </a>
          <a
            href={mockUser.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-blue-900 underline text-sm"
          >
            GitHub
          </a>
        </div>

        {/* Bio */}
        <div className="w-full mt-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">About Me</h2>
          {editing ? (
            <textarea
              className="w-full border border-blue-200 rounded-lg p-2 text-gray-700"
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={4}
            />
          ) : (
            <p className="text-gray-700">{bio}</p>
          )}
          <button
            className="mt-2 px-4 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            onClick={() => setEditing(!editing)}
          >
            {editing ? "Save" : "Edit Bio"}
          </button>
        </div>

        {/* Skills */}
        <div className="w-full mt-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {mockUser.skills.map(skill => (
              <span
                key={skill}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium shadow"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Resume Download */}
        <div className="w-full mt-6 flex justify-center">
          <a
            href={mockUser.resumeUrl}
            download
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition"
          >
            Download Resume
          </a>
        </div>
      </section>
    </main>
  );
};

export default ProfilePage;