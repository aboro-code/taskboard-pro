import React, { useEffect, useState, useRef } from 'react';
import { fetchWithAuth } from '../api';
import TaskBoard from '../components/TaskBoard';
import TaskForm from '../components/TaskForm';
import { useNavigate } from 'react-router-dom';

export default function ProjectBoardPage({ user, project }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [automations, setAutomations] = useState([]);
  const [showAutoForm, setShowAutoForm] = useState(false);
  const [autoBadge, setAutoBadge] = useState('');
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
      .then(p => setMembers(p.members || []));
  }, [project, user]);

  useEffect(() => {
    if (!project || !project._id) return;
    fetchWithAuth(`/api/automations/project/${project._id}`, user.jwt)
      .then(setAutomations);
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
    await fetchWithAuth(`/api/tasks/project/${project._id}`, user.jwt, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    fetchWithAuth(`/api/tasks/project/${project._id}`, user.jwt).then(setTasks);
  }

  async function handleMoveTask(task, newStatus) {
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

  async function handleAddAutomation(e) {
    e.preventDefault();
    await fetchWithAuth(`/api/automations/project/${project._id}`, user.jwt, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trigger: 'status_change',
        condition: { to: 'Done' },
        action: { type: 'assign_badge', badge: autoBadge || 'Completed Task' }
      }),
    });
    setShowAutoForm(false);
    setAutoBadge('');
    fetchWithAuth(`/api/automations/project/${project._id}`, user.jwt).then(setAutomations);
  }

  if (error) return <div className="text-red-500">{error}</div>;
  if (loading) return <div className="text-gray-500">Loading tasks...</div>;

  return (
    <div>
      <button
        className="mb-4 px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
        onClick={() => navigate('/')}
      >
        ← Back to Projects
      </button>
      <h2 className="text-xl font-bold mb-4">{project.title} Board</h2>
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
      />
      <div className="mt-6 text-left">
        <h3 className="font-bold mb-2">Automations</h3>
        <ul className="mb-2">
          {automations.map(a => (
            <li key={a._id} className="text-sm">
              When task is moved to <b>Done</b>, assign badge: <b>{a.action.badge}</b>
            </li>
          ))}
        </ul>
        {project.owner === user._id && (
          <>
            <button
              className="mb-2 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
              onClick={() => setShowAutoForm(f => !f)}
            >
              {showAutoForm ? 'Cancel' : 'Add Automation'}
            </button>
            {showAutoForm && (
              <form onSubmit={handleAddAutomation} className="flex gap-2 items-end mt-2">
                <input
                  className="border rounded px-2 py-1"
                  placeholder="Badge name"
                  value={autoBadge}
                  onChange={e => setAutoBadge(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
