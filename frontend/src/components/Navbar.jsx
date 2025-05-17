import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Navbar({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-gradient-to-r from-blue-50 to-purple-100 border-b border-blue-200 shadow relative">
      <div
        className="flex items-center gap-2 cursor-pointer select-none"
        onClick={() => navigate("/")}
        title="Go to Home"
        style={{ userSelect: "none" }}
      >
        <img
          src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4cb.svg"
          alt="logo"
          style={{ width: 36, height: 36 }}
        />
        <span
          style={{
            fontWeight: 800,
            fontSize: 24,
            color: "#1e3a8a",
            letterSpacing: "0.01em",
            lineHeight: 1,
          }}
        >
          TaskBoard Pro
        </span>
      </div>
      <div className="flex items-center gap-4">
        {user && location.pathname !== "/profile" && (
          <button
            onClick={() => navigate("/profile")}
            className="px-4 py-2 bg-blue-100 text-blue-900 rounded-md font-semibold shadow-md hover:bg-blue-200 transition"
          >
            {user.name}
          </button>
        )}
        {user && (
          <button
            onClick={onLogout}
            className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-md font-semibold shadow-md hover:from-red-600 hover:to-pink-600 transition"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
