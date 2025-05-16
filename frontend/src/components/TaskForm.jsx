import React, { useState } from "react";

export default function TaskForm({
  onCreate,
  members = [],
  statuses = ["To Do", "In Progress", "Done"],
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignee, setAssignee] = useState("");
  const [status, setStatus] = useState(statuses[0] || "To Do");

  function handleSubmit(e) {
    e.preventDefault();
    if (!title) return;
    onCreate({
      title,
      description,
      dueDate,
      assignee: assignee || undefined,
      status,
    });
    setTitle("");
    setDescription("");
    setDueDate("");
    setAssignee("");
    setStatus(statuses[0] || "To Do");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 mb-4 items-end flex-wrap bg-white p-3 rounded-lg shadow border border-blue-100"
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        required
        className="border border-blue-300 rounded px-2 py-1 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="border border-blue-300 rounded px-2 py-1 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        value={assignee}
        onChange={(e) => setAssignee(e.target.value)}
        className="border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        <option value="">Unassigned</option>
        {members.map((m) => (
          <option key={m._id} value={m._id}>
            {m.name || m.email}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="px-4 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
      >
        Add Task
      </button>
    </form>
  );
}
