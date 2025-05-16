import React from "react";

export default function ProjectList({
  projects,
  onSelect,
  onInvite,
  onDelete,
  currentUserId,
}) {
  return (
    <ul className="space-y-3">
      {projects.map((project) => (
        <li key={project._id} className="flex items-center gap-2">
          <button
            onClick={() => onSelect(project)}
            className="flex-1 text-left px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg hover:from-blue-200 hover:to-purple-200 shadow font-semibold text-blue-900 transition"
          >
            {project.title}
          </button>
          {onInvite && (
            <button
              onClick={() => onInvite(project)}
              className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs transition"
            >
              Invite
            </button>
          )}
          {onDelete && currentUserId === String(project.owner) && (
            <button
              onClick={() => onDelete(project._id)}
              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs transition"
            >
              Delete
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
