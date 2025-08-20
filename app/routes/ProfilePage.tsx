import React, { useEffect, useState } from "react";
import { usePuterStore } from "../lib/puter"; // adjust path if needed
import Navbar from "~/components/commonComp/Navbar";

const ProfilePage: React.FC = () => {
  const { auth, init, isLoading } = usePuterStore();
  const user = auth.user;

  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (user) {
      // Load stored bio from KV store if available later
      setBio(`Hello, I’m ${user.username}.`);
    }
  }, [user]);

  if (isLoading && !user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">
          No user signed in. Please log in to view your profile.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[url('/images/bg-main.svg')] bg-cover flex flex-col items-center justify-center py-10">
      <Navbar />
      <section className="rounded-2xl shadow-xl w-full max-w-2xl p-8 flex flex-col items-center">
        {/* Avatar & Name */}
        <img
          src={`https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`} 
          alt={user.username}
          className="h-28 w-28 rounded-full border-4 border-blue-200 object-cover shadow mb-4"
        />
        <h1 className="text-2xl font-bold text-blue-900">
          {user.username}
        </h1>
        <p className="text-gray-500 text-sm">UUID: {user.uuid}</p>

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

        {/* Resume Placeholder */}
        <div className="w-full mt-6 flex justify-center">
          <a
            href={`/resume/${user.uuid}`}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition"
          >
            View Resume
          </a>
        </div>
      </section>
    </main>
  );
};

export default ProfilePage;
