"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { APP_NAME } from "@/app/config";
import { loginAdmin } from "@/app/allapis";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const validate = () => {
    const newErrors: { username?: string; password?: string } = {};
    if (!username) newErrors.username = "Username is required";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setLoginError(null);
    try {
      const data = await loginAdmin({ username, password });
      localStorage.setItem("token", data.admin.token);
      localStorage.setItem("admin", JSON.stringify(data.admin));
      alert("Login successful!");
      window.location.href = "/dashboard";
    } catch (error: unknown) {
      if (error instanceof Error) {
        setLoginError(error.message || "Login failed!");
      } else {
        setLoginError("Login failed!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Animated background circles */}
      <motion.div
        className="absolute -top-32 -left-32 w-96 h-96 bg-white/20 rounded-full blur-3xl"
        animate={{ y: [0, 40, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] bg-pink-300/30 rounded-full blur-3xl"
        animate={{ y: [0, -40, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Glassmorphic login card */}
      <motion.form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-2xl shadow-2xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-extrabold mb-6 text-center text-white drop-shadow-lg">
          Welcome to {APP_NAME}
        </h1>

        {loginError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 text-center text-red-200 font-semibold"
          >
            {loginError}
          </motion.div>
        )}

        {/* Username input */}
        <label htmlFor="username" className="block mb-2 font-semibold text-white/90">
          Username
        </label>
        <input
          id="username"
          type="text"
          placeholder="Enter your username"
          className={`w-full p-3 mb-3 rounded-lg bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 ${
            errors.username ? "focus:ring-red-400" : "focus:ring-green-400"
          }`}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {errors.username && (
          <p className="text-red-300 text-sm mb-3">{errors.username}</p>
        )}

        {/* Password input */}
        <label htmlFor="password" className="block mb-2 font-semibold text-white/90">
          Password
        </label>
        <div className="relative mb-4">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className={`w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 ${
              errors.password ? "focus:ring-red-400" : "focus:ring-green-400"
            }`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
            tabIndex={-1}
          >
            {showPassword ? "🙈" : "👁"}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-300 text-sm mb-3">{errors.password}</p>
        )}

        {/* Submit button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          type="submit"
          disabled={loading}
          className={`w-full p-3 rounded-lg text-white font-semibold transition-all duration-300 shadow-lg ${
            loading
              ? "bg-green-400/60 cursor-not-allowed"
              : "bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </motion.button>

        {/* Footer */}
        <div className="text-center mt-5 text-white/80">
          Don&apos;t have an account?{" "}
          <a
            href="/auth/register"
            className="text-yellow-300 font-semibold hover:underline"
          >
            Click here...
          </a>
        </div>
      </motion.form>
    </div>
  );
}
