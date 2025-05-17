import React, { useState } from "react";

export default function TaskBoard({
  tasks,
  statuses,
  onMoveTask,
  members = [],
  onDeleteTask,
  onAssignUser,
}) {
  const [showCommentsFor, setShowCommentsFor] = useState(null);
  const [assigningTaskId, setAssigningTaskId] = useState(null);
  const [selectedAssignee, setSelectedAssignee] = useState("");

  return (
    <div className="flex gap-6">
      {statuses.map((status) => (
        <div
          key={status}
          className="flex-1 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl p-4 shadow border border-blue-200"
        >
          <h4 className="font-bold mb-3 text-blue-700">{status}</h4>
          <ul className="space-y-3">
            {tasks
              .filter((t) => t.status === status)
              .map((task) => (
                <li
                  key={task._id}
                  className="bg-white rounded-lg shadow p-4 border border-blue-100"
                >
                  <div>
                    <strong className="block text-lg text-blue-900">
                      {task.title}
                    </strong>
                    <div className="text-gray-600 text-sm">
                      {task.description}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1 justify-center">
                      {task.assignee ? (
                        <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
                          Assigned to:{" "}
                          {task.assignee.name ||
                            task.assignee.email ||
                            task.assignee}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Unassigned
                        </span>
                      )}
                      {task.status === "Done" && task.updatedAt && (
                        <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                          Done at: {new Date(task.updatedAt).toLocaleString()}
                        </span>
                      )}
                      {task.status !== "Done" && task.dueDate && (
                        <span className="text-xs text-gray-500 bg-yellow-100 px-2 py-1 rounded">
                          Due: {new Date(task.dueDate).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {task.assignee == null && onAssignUser && (
                      <div className="mt-2">
                        {assigningTaskId === task._id ? (
                          <form
                            className="inline"
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (selectedAssignee) {
                                onAssignUser(task, selectedAssignee);
                                setAssigningTaskId(null);
                                setSelectedAssignee("");
                              }
                            }}
                          >
                            <select
                              value={selectedAssignee}
                              onChange={(e) =>
                                setSelectedAssignee(e.target.value)
                              }
                              className="border border-blue-300 rounded px-2 py-1 text-xs ml-1"
                              required
                            >
                              <option value="">Select user</option>
                              {members.map((m) => (
                                <option key={m._id} value={m._id}>
                                  {m.name || m.email}
                                </option>
                              ))}
                            </select>
                            <button
                              type="submit"
                              className="ml-1 px-2 py-1 bg-green-500 text-white rounded text-xs"
                            >
                              Assign
                            </button>
                            <button
                              type="button"
                              className="ml-1 px-2 py-1 bg-gray-300 rounded text-xs"
                              onClick={() => setAssigningTaskId(null)}
                            >
                              Cancel
                            </button>
                          </form>
                        ) : (
                          <button
                            className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
                            onClick={() => setAssigningTaskId(task._id)}
                          >
                            Assign
                          </button>
                        )}
                      </div>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {task.status !== 'Done' && (
                        <>
                          {statuses
                            .filter((s) => s !== status)
                            .map((s) => (
                              <button
                                key={s}
                                onClick={() => onMoveTask(task, s)}
                                className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs transition"
                              >
                                Move to {s}
                              </button>
                            ))}
                          {onDeleteTask && (
                            <button
                              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs transition"
                              onClick={() => onDeleteTask(task._id)}
                            >
                              Delete
                            </button>
                          )}
                        </>
                      )}
                      <button
                        className="px-3 py-1 bg-gray-200 rounded-lg text-xs hover:bg-gray-300 transition"
                        onClick={() => setShowCommentsFor(task._id)}
                      >
                        Comments
                      </button>
                    </div>
                    {showCommentsFor === task._id && (
                      <TaskCommentsModal
                        taskId={task._id}
                        onClose={() => setShowCommentsFor(null)}
                      />
                    )}
                  </div>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function TaskCommentsModal({ taskId, onClose }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  async function fetchComments() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/automations/task/${taskId}/comments`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      });
      const data = await res.json();
      setComments(data);
    } catch {
      setError("Failed to load comments");
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  async function handleAddComment(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`/api/automations/task/${taskId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        setText("");
        fetchComments();
      }
    } catch {
      setError("Failed to add comment");
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-500"
          onClick={onClose}
        >
          ✕
        </button>
        <h4 className="font-bold mb-2">Comments</h4>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <ul className="mb-3 max-h-40 overflow-y-auto">
            {comments.length === 0 && (
              <li className="text-gray-400">No comments yet.</li>
            )}
            {comments.map((c, i) => (
              <li key={i} className="mb-2 border-b pb-1">
                <span className="font-semibold">
                  {c.user?.name || c.user?.email || "User"}:
                </span>{" "}
                {c.text}
                <span className="text-xs text-gray-400 ml-2">
                  {c.createdAt && new Date(c.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            className="border rounded px-2 py-1 flex-1"
            required
          />
          <button
            type="submit"
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Post
          </button>
        </form>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>
    </div>
  );
}
