import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../api';
import ProjectList from '../components/ProjectList';

export default function ProjectsPage({ user, onSelectProject }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [selectedForInvite, setSelectedForInvite] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchWithAuth('/api/projects', user.jwt)
      .then(res => {
        if (res.error) {
          setError(res.error);
          setProjects([]);
        } else {
          setProjects(res);
        }
      })
      .catch(() => {
        setError('Failed to load projects');
        setProjects([]);
      })
      .finally(() => setLoading(false));
  }, [user]);

  async function handleCreateProject(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetchWithAuth('/api/projects', user.jwt, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      if (res.error) {
        setError(res.error);
      } else {
        setProjects(prev => [...prev, res]);
        setShowForm(false);
        setTitle('');
        setDescription('');
      }
    } catch (err) {
      setError('Failed to create project');
    }
  }

  async function handleInvite(e) {
    e.preventDefault();
    setInviteError('');
    setInviteSuccess('');
    if (!selectedForInvite) return;
    try {
      const res = await fetchWithAuth(`/api/projects/${selectedForInvite._id}/invite`, user.jwt, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });
      if (res.error) setInviteError(res.error);
      else setInviteSuccess('User invited!');
    } catch {
      setInviteError('Failed to invite user');
    }
  }

  async function handleDeleteProject(projectId) {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await fetchWithAuth(`/api/projects/${projectId}`, user.jwt, { method: 'DELETE' });
      setProjects(prev => prev.filter(p => p._id !== projectId));
    } catch {
      setError('Failed to delete project');
    }
  }

  if (loading) return <div className="text-gray-500">Loading projects...</div>;

  return (
    <div>
      <h2 className="text-2xl font-extrabold mb-6 text-blue-800">Your Projects</h2>
      {error && <div className="text-red-500 mb-2">Error: {error}</div>}
      <button
        className="mb-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow hover:from-blue-600 hover:to-purple-600 transition font-semibold"
        onClick={() => setShowForm(f => !f)}
      >
        {showForm ? 'Cancel' : 'Create Project'}
      </button>
      {showForm && (
        <form onSubmit={handleCreateProject} className="mb-4 flex flex-col gap-3 items-center bg-white p-4 rounded-lg shadow border border-blue-100">
          <input
            className="border border-blue-300 rounded px-3 py-2 w-72 focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Project Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <input
            className="border border-blue-300 rounded px-3 py-2 w-72 focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <button
            type="submit"
            className="px-6 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition font-semibold"
          >
            Create
          </button>
          {error && <div className="text-red-500">{error}</div>}
        </form>
      )}
      {projects.length === 0 && (
        <div className="text-gray-400 mb-4">No projects found. Create one!</div>
      )}
      <ProjectList
        projects={projects}
        onSelect={onSelectProject}
        onInvite={project => setSelectedForInvite(project)}
        onDelete={handleDeleteProject}
        currentUserId={user._id}
      />
      {selectedForInvite && (
        <form onSubmit={handleInvite} className="mt-4 flex flex-col items-center gap-2 bg-white p-4 rounded-lg shadow border border-blue-100">
          <div>Invite user to <b>{selectedForInvite.title}</b>:</div>
          <input
            className="border border-blue-300 rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="User email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            required
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition" type="submit">
            Invite
          </button>
          {inviteError && <div className="text-red-500">{inviteError}</div>}
          {inviteSuccess && <div className="text-green-600">{inviteSuccess}</div>}
          <button type="button" className="text-sm text-gray-500" onClick={() => setSelectedForInvite(null)}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}
