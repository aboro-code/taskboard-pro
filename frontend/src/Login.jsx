import { useState } from "react";
import { auth, provider } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import { loginWithGoogle, signupWithEmail, signinWithEmail } from "./api";

export default function Login({ onLogin }) {
  const [error, setError] = useState(null);
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  async function handleGoogleAuth() {
    setError(null);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();
      const { token, user: userInfo } = await loginWithGoogle(idToken);
      const userWithJwt = { ...userInfo, jwt: token };
      localStorage.setItem("jwt", token);
      localStorage.setItem("user", JSON.stringify(userWithJwt));
      onLogin(userWithJwt);
    } catch (err) {
      setError("Sign in/up failed");
    }
  }

  async function handleEmailAuth(e) {
    e.preventDefault();
    setError(null);
    try {
      let data;
      if (isSignup) {
        data = await signupWithEmail(email, password, name);
      } else {
        data = await signinWithEmail(email, password);
      }
      if (data.token && data.user) {
        localStorage.setItem("jwt", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onLogin({ ...data.user, jwt: data.token });
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch (err) {
      setError(err?.message || "Authentication failed");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-blue-200">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-900 drop-shadow">
          {isSignup ? "Sign Up" : "Sign In"} to{" "}
          <span className="text-purple-700">TaskBoard Pro</span>
        </h2>
        <form onSubmit={handleEmailAuth} className="space-y-4 mb-4">
          {isSignup && (
            <input
              type="text"
              placeholder="Name"
              className="w-full border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-blue-50"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-blue-50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-blue-50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full py-2 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold shadow hover:from-green-600 hover:to-green-700 transition"
          >
            {isSignup ? "Sign Up" : "Sign In"}
          </button>
        </form>
        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-blue-200"></div>
          <span className="mx-3 text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-blue-200"></div>
        </div>
        <button
          onClick={handleGoogleAuth}
          className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-bold shadow hover:from-blue-600 hover:to-purple-600 transition mb-2 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <g>
              <path
                fill="#4285F4"
                d="M44.5 20H24v8.5h11.7C34.3 33.1 29.7 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.3 5.1 29.4 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.5-7.6 21-17.5H24v-8.5h20.5z"
              />
            </g>
          </svg>
          Continue with Google
        </button>
        <div className="text-center mt-2">
          <button
            type="button"
            className="text-blue-600 underline font-semibold hover:text-purple-700 transition"
            onClick={() => setIsSignup((s) => !s)}
          >
            {isSignup
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </button>
        </div>
        {error && (
          <div className="text-red-500 mt-4 text-center font-semibold">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
