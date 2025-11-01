"use client";
import { APP_NAME } from "@/app/config";
import { useState } from "react";
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
    <div className="flex h-screen items-center justify-center bg-gradient-to-r from-green-400 to-blue-500 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md"
        noValidate
      >
        <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-800">
          Welcome to {APP_NAME}
        </h1>

        {loginError && (
          <div className="mb-4 text-center text-red-700 font-semibold">{loginError}</div>
        )}

        {/* Username input */}
        <label htmlFor="username" className="block mb-1 font-semibold text-gray-700">
          Username
        </label>
        <input
          id="username"
          type="text"
          placeholder="Enter your username"
          className={`w-full p-3 mb-2 border rounded-md text-black focus:outline-none focus:ring-2 transition ${
            errors.username
              ? "border-red-500 focus:ring-red-400"
              : "border-gray-300 focus:ring-green-400"
          }`}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {errors.username && (
          <p className="text-red-600 text-sm mb-3">{errors.username}</p>
        )}

        {/* Password input */}
        <label htmlFor="password" className="block mb-1 font-semibold text-gray-700">
          Password
        </label>
        <div className="relative mb-4">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className={`w-full p-3 border rounded-md text-black focus:outline-none focus:ring-2 transition ${
              errors.password
                ? "border-red-500 focus:ring-red-400"
                : "border-gray-300 focus:ring-green-400"
            }`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            tabIndex={-1}
          >
            {showPassword ? "🙈" : "👁"}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-600 text-sm mb-3">{errors.password}</p>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full p-3 rounded-md text-white font-semibold transition ${
            loading
              ? "bg-green-300 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
