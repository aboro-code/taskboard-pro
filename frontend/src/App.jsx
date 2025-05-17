import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectBoardPage from "./pages/ProjectBoardPage";
import ProfilePage from "./pages/ProfilePage";
import { fetchWithAuth } from "./api";
import Navbar from "./components/Navbar";

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    const jwt = localStorage.getItem("jwt");
    if (savedUser && jwt) {
      const parsedUser = JSON.parse(savedUser);
      return { ...parsedUser, jwt };
    }
    return null;
  });

  const [selectedProject, setSelectedProject] = useState(() => {
    const saved = localStorage.getItem("selectedProject");
    return saved ? JSON.parse(saved) : null;
  });

  const navigate = useNavigate();
  const location = useLocation();
  const [projectLoading, setProjectLoading] = useState(false);
  const [fullProject, setFullProject] = useState(selectedProject);

  useEffect(() => {
    async function fetchProject() {
      if (
        selectedProject &&
        selectedProject._id &&
        (!selectedProject.statuses || !selectedProject.members)
      ) {
        setProjectLoading(true);
        const res = await fetchWithAuth(
          `/api/projects/${selectedProject._id}`,
          user?.jwt
        );
        setFullProject(res && !res.error ? res : null);
        setProjectLoading(false);
      } else {
        setFullProject(selectedProject);
      }
    }
    fetchProject();
  }, [selectedProject, user]);

  useEffect(() => {
    if (
      location.pathname === "/project" &&
      (!selectedProject || !selectedProject._id)
    ) {
      navigate("/");
    }
  }, [location.pathname, selectedProject]);

  function handleLogin(userInfo) {
    setUser({ ...userInfo, jwt: userInfo.jwt });
    localStorage.setItem(
      "user",
      JSON.stringify({ ...userInfo, jwt: userInfo.jwt })
    );
    if (userInfo.jwt) localStorage.setItem("jwt", userInfo.jwt);
  }

  function handleLogout() {
    setUser(null);
    setSelectedProject(null);
    localStorage.removeItem("user");
    localStorage.removeItem("jwt");
    localStorage.removeItem("selectedProject");
    window.location.href = "/";
  }

  function handleSetSelectedProject(project) {
    setSelectedProject(project);
    localStorage.setItem("selectedProject", JSON.stringify(project));
  }

  if (!user) return <LoginPage onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} onLogout={handleLogout} />
      <div className="max-w-4xl mx-auto mt-10 p-8 bg-gradient-to-br from-blue-50 to-purple-100 rounded-xl shadow-lg text-center border border-blue-200 relative">
        <Routes>
          <Route
            path="/"
            element={
              <ProjectsPage
                user={user}
                onSelectProject={(project) => {
                  handleSetSelectedProject(project);
                  navigate("/project");
                }}
              />
            }
          />
          <Route
            path="/project"
            element={
              fullProject && fullProject._id ? (
                projectLoading ? (
                  <div className="text-blue-700 text-lg">Loading project...</div>
                ) : (
                  <ProjectBoardPage user={user} project={fullProject} />
                )
              ) : (
                <div className="text-red-600">
                  Select a project from the home page.
                </div>
              )
            }
          />
          <Route
            path="/profile"
            element={<ProfilePage user={user} />}
          />
        </Routes>
      </div>
    </div>
  );
}
