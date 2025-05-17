import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../api";

export default function ProfilePage({ user }) {
  const [badges, setBadges] = useState([]);
  const [ownedProjects, setOwnedProjects] = useState([]);
  const [memberProjects, setMemberProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      const res = await fetchWithAuth("/api/auth/me", user.jwt);
      setBadges(res.badges || []);
      setLoading(false);
    }
    fetchProfile();
  }, [user]);

  useEffect(() => {
    async function fetchProjects() {
      const projects = await fetchWithAuth("/api/projects", user.jwt);
      setOwnedProjects(projects.filter((p) => String(p.owner) === String(user._id)));
      setMemberProjects(projects.filter((p) => String(p.owner) !== String(user._id)));
    }
    fetchProjects();
  }, [user]);

  function handleProjectClick(project) {
    localStorage.setItem("selectedProject", JSON.stringify(project));
    navigate("/project");
  }

  if (loading) return <div className="text-gray-500">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-gradient-to-br from-blue-50 to-purple-100 rounded-xl shadow-lg text-center border border-blue-200 relative">
      <h2 className="text-3xl font-extrabold mb-4 text-blue-900">Profile</h2>
      <div className="mb-4">
        <span className="text-xl font-bold text-blue-800">{user.name}</span>
        <div className="text-gray-600">{user.email}</div>
      </div>
      <h3 className="text-lg font-semibold mb-2">Badges</h3>
      {badges.length === 0 ? (
        <div className="text-gray-400">No badges yet.</div>
      ) : (
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {badges.map((badge, i) => (
            <span
              key={i}
              className="inline-block bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full font-semibold text-sm shadow"
            >
              🏅 {badge}
            </span>
          ))}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2 mt-6">Projects You Own</h3>
      {ownedProjects.length === 0 ? (
        <div className="text-gray-400">You do not own any projects.</div>
      ) : (
        <ul className="space-y-3 mb-6">
          {ownedProjects.map((p) => (
            <li key={p._id} className="flex items-center gap-2">
              <button
                onClick={() => handleProjectClick(p)}
                className="flex-1 text-left px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg hover:from-blue-200 hover:to-purple-200 shadow font-semibold text-blue-900 transition"
              >
                {p.title}
              </button>
            </li>
          ))}
        </ul>
      )}
      <h3 className="text-lg font-semibold mb-2 mt-6">Projects You're a Member Of</h3>
      {memberProjects.length === 0 ? (
        <div className="text-gray-400">You are not a member of any projects.</div>
      ) : (
        <ul className="space-y-3">
          {memberProjects.map((p) => (
            <li key={p._id} className="flex items-center gap-2">
              <button
                onClick={() => handleProjectClick(p)}
                className="flex-1 text-left px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg hover:from-blue-200 hover:to-purple-200 shadow font-semibold text-purple-900 transition"
              >
                {p.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
