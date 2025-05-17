import React, { useState } from "react";

export default function TaskForm({ onCreate, members, statuses }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(statuses[0] || "To Do");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onCreate({
      title,
      description,
      status,
      assignee: assignee || null,
      dueDate: dueDate || null,
    });
    setTitle("");
    setDescription("");
    setStatus(statuses[0] || "To Do");
    setAssignee("");
    setDueDate("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 flex flex-wrap gap-4 items-end justify-center"
    >
      <input
        className="border rounded px-3 py-2"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        className="border rounded px-3 py-2"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <select
        className="border rounded px-3 py-2"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        className="border rounded px-3 py-2"
        value={assignee}
        onChange={(e) => setAssignee(e.target.value)}
      >
        <option value="">Unassigned</option>
        {members.map((m) => (
          <option key={m._id} value={m._id}>
            {m.name || m.email}
          </option>
        ))}
      </select>
      <input
        className="border rounded px-3 py-2"
        type="datetime-local"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        placeholder="Due date (optional)"
        title="Due date (optional)"
      />
      <span className="text-xs text-gray-400 -ml-3 mb-2">
        Due date (optional)
      </span>
      <button
        type="submit"
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
      >
        Add Task
      </button>
    </form>
  );
}
