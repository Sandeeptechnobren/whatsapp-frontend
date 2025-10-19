"use client";

import { signupAdmin } from "@/app/allapis";
import { APP_NAME } from "@/app/config";
import { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    address: "",
    phone: "",
  });

  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Handle input changes with live validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    let message = "";
    if (name === "username" && value.trim().length < 3) message = "Username too short";
    if (name === "password" && value.length < 6) message = "Password too short";
    if (name === "email" && value && !/\S+@\S+\.\S+/.test(value)) message = "Invalid email";
    if (name === "phone" && value && !/^\+?[\d\s\-()]{7,15}$/.test(value))
      message = "Invalid phone number";

    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  // ✅ Validation before submitting
  const validate = () => {
    const newErrors: Partial<typeof form> = {};
    if (!form.username.trim()) newErrors.username = "Username is required";
    else if (form.username.length < 3) newErrors.username = "Username must be at least 3 characters";
    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email is invalid";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\+?[\d\s\-()]{7,15}$/.test(form.phone)) newErrors.phone = "Phone number is invalid";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Fixed handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await signupAdmin(form); 
      alert("Signup successful!");
      window.location.href = "/auth/login";
    } catch (error: any) {
      alert(error.message || "Signup failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-green-400 to-blue-500 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white sm:p-8 rounded-xl shadow-xl w-full max-w-2xl grid sm:grid-cols-2 gap-2 transition-transform duration-300 hover:scale-[1.006]"
        noValidate
      >
        <h1 className="text-xl sm:text-2xl font-bold col-span-2 text-center text-gray-800 mb-4">
          Register on {APP_NAME}
        </h1>

        {[
          { id: "username", label: "Username", type: "text", placeholder: "Username" },
          { id: "name", label: "Full Name", type: "text", placeholder: "Full Name" },
          { id: "email", label: "Email", type: "email", placeholder: "Email" },
          { id: "phone", label: "Phone", type: "tel", placeholder: "+1 234 567 8900" },
        ].map((field) => (
          <div key={field.id} className="relative flex flex-col">
            <input
              id={field.id}
              name={field.id}
              type={field.type}
              placeholder=" "
              value={(form as any)[field.id]}
              onChange={handleChange}
              className={`peer w-full px-3 pt-5 pb-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 text-sm sm:text-base transition text-black ${
                (errors as any)[field.id]
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300"
              }`}
            />
            <label
              htmlFor={field.id}
              className={`absolute left-3 top-2 text-gray-400 text-xs transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-gray-600 peer-focus:text-xs`}
            >
              {field.label}
            </label>
            {(errors as any)[field.id] && (
              <p className="text-red-500 text-xs mt-1">{(errors as any)[field.id]}</p>
            )}
          </div>
        ))}

        {/* Password */}
        <div className="relative flex flex-col">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder=" "
            value={form.password}
            onChange={handleChange}
            className={`peer w-full px-3 pt-5 pb-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 text-sm sm:text-base transition text-black ${
              errors.password ? "border-red-500 focus:ring-red-400" : "border-gray-300"
            }`}
          />
          <label
            htmlFor="password"
            className="absolute left-3 top-2 text-gray-400 text-xs transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-gray-600 peer-focus:text-xs"
          >
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm sm:text-base focus:outline-none"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        {/* Address */}
        <div className="flex flex-col sm:col-span-2 relative">
          <textarea
            id="address"
            name="address"
            placeholder=" "
            value={form.address}
            onChange={handleChange}
            rows={2}
            className={`peer w-full px-3 pt-5 pb-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 text-sm sm:text-base resize-none transition text-black ${
              errors.address ? "border-red-500 focus:ring-red-400" : "border-gray-300"
            }`}
          />
          <label
            htmlFor="address"
            className="absolute left-3 top-2 text-gray-400 text-xs transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-gray-600 peer-focus:text-xs"
          >
            Address
          </label>
          {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className={`sm:col-span-2 w-full py-2 rounded-md text-white font-semibold transition-all flex justify-center items-center ${
            loading ? "bg-green-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading && (
            <svg
              className="animate-spin h-4 w-4 mr-2 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          )}
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
