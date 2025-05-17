import React, { useEffect, useState, useRef } from 'react';
import { fetchWithAuth } from '../api';
import TaskBoard from '../components/TaskBoard';
import TaskForm from '../components/TaskForm';
import { useNavigate } from 'react-router-dom';

export default function ProjectBoardPage({ user, project }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [ownerName, setOwnerName] = useState("");
  const [error, setError] = useState('');
  const [, setToastTick] = useState(0);
  const navigate = useNavigate();
  const shownNotificationIds = useRef(new Set());

  useEffect(() => {
    if (!project || !project._id) {
      setError('No project selected or project data is invalid.');
      setTimeout(() => navigate('/'), 1500);
    }
  }, [project, navigate]);

  useEffect(() => {
    if (!project || !project._id) return;
    fetchWithAuth(`/api/tasks/project/${project._id}`, user.jwt)
      .then(setTasks)
      .finally(() => setLoading(false));
  }, [user, project]);

  useEffect(() => {
    if (!project || !project._id) return;
    fetchWithAuth(`/api/projects/${project._id}`, user.jwt)
      .then(p => {
        setMembers(p.members || []);
        // Find owner name from members or fallback to owner id
        const owner = (p.members || []).find(m => String(m._id) === String(p.owner));
        setOwnerName(owner ? (owner.name || owner.email) : p.owner);
      });
  }, [project, user]);

  useEffect(() => {
    if (!user || !user.jwt) return;
    let lastShownIds = shownNotificationIds.current;
    const poll = async () => {
      try {
        const res = await fetch('/api/automations/notifications', {
          headers: { Authorization: `Bearer ${user.jwt}` }
        });
        const notes = await res.json();
        if (Array.isArray(notes)) {
          notes
            .filter(n => !lastShownIds.has(n._id))
            .forEach(n => {
              console.log("ALERT:", n.message);
              alert(n.message);
              lastShownIds.add(n._id);
            });
          if (notes.length > 0) setToastTick(t => t + 1);
        }
      } catch (err) {
        console.error("Notification fetch error", err);
      }
    };
    poll(); 
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [user]);

  async function handleCreateTask(taskData) {
    // If assignee is set and status is "To Do", force status to "In Progress"
    let data = { ...taskData };
    if (data.assignee && (data.status === "To Do" || !data.status)) {
      data.status = "In Progress";
    }
    await fetchWithAuth(`/api/tasks/project/${project._id}`, user.jwt, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    fetchWithAuth(`/api/tasks/project/${project._id}`, user.jwt).then(setTasks);
  }

  async function handleMoveTask(task, newStatus) {
    // Prevent moving to In Progress without assignee
    if (
      task.status === "To Do" &&
      newStatus === "In Progress" &&
      (!task.assignee || !task.assignee._id)
    ) {
      alert("Assign a user before moving to In Progress.");
      return;
    }
    if (task.status === 'Done') {
      alert('Cannot move a task out of Done.');
      return;
    }
    await fetchWithAuth(`/api/tasks/${task._id}`, user.jwt, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchWithAuth(`/api/tasks/project/${project._id}`, user.jwt).then(setTasks);
  }

  async function handleDeleteTask(taskId) {
    const task = tasks.find(t => t._id === taskId);
    if (task && task.status === 'Done') {
      alert('Cannot delete a task that is Done.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    await fetchWithAuth(`/api/tasks/${taskId}`, user.jwt, { method: 'DELETE' });
    fetchWithAuth(`/api/tasks/project/${project._id}`, user.jwt).then(setTasks);
  }

  async function handleAssignUser(task, assigneeId) {
    await fetchWithAuth(`/api/tasks/${task._id}`, user.jwt, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignee: assigneeId }),
    });
    fetchWithAuth(`/api/tasks/project/${project._id}`, user.jwt).then(setTasks);
  }

  async function handleDeleteProject() {
    if (!window.confirm('Are you sure you want to delete this project? This cannot be undone.')) return;
    await fetchWithAuth(`/api/projects/${project._id}`, user.jwt, { method: 'DELETE' });
    navigate('/');
  }

  async function handleLeaveProject() {
    if (!window.confirm('Are you sure you want to leave this project?')) return;
    // Remove self from project members (handle both object and string id cases)
    const memberIds = members.map(m => (m && m._id ? m._id : m));
    const updatedMembers = memberIds.filter(id => String(id) !== String(user._id));
    await fetchWithAuth(`/api/projects/${project._id}`, user.jwt, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        members: updatedMembers
      }),
    });
    navigate('/');
  }

  if (error) return <div className="text-red-500">{error}</div>;
  if (loading) return <div className="text-gray-500">Loading tasks...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-gradient-to-br from-blue-50 to-purple-100 rounded-xl shadow-lg text-center border border-blue-200 relative">
      <div className="text-2xl font-bold text-blue-900 mb-2">
        Project Board : {project.title} 
      </div>
      <div className="text-md text-blue-700 mb-6">
        Owner: {ownerName}
      </div>
      <div className="flex justify-end mb-4" style={{ marginTop: "56px", marginRight: "160px" }}>
        {project.owner === user._id && (
          <button
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={handleDeleteProject}
          >
            Delete Project
          </button>
        )}
      </div>
      <TaskForm
        onCreate={handleCreateTask}
        members={members}
        statuses={project.statuses || ['To Do', 'In Progress', 'Done']}
      />
      <TaskBoard
        tasks={tasks}
        statuses={project.statuses || ['To Do', 'In Progress', 'Done']}
        onMoveTask={handleMoveTask}
        members={members}
        onDeleteTask={project.owner === user._id ? handleDeleteTask : undefined}
        onAssignUser={handleAssignUser}
      />
    </div>
  );
}
