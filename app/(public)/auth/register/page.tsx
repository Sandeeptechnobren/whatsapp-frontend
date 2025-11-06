"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { signupAdmin } from "@/app/allapis";
import { APP_NAME } from "@/app/config";

type FormFields = {
  username: string;
  name: string;
  email: string;
  password: string;
  address: string;
  phone: string;
};

export default function RegisterPage() {
  const [form, setForm] = useState<FormFields>({
    username: "",
    name: "",
    email: "",
    password: "",
    address: "",
    phone: "",
  });

  const [errors, setErrors] = useState<Partial<FormFields>>({});
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
    const newErrors: Partial<FormFields> = {};
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

  // ✅ Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await signupAdmin(form);
      alert("Signup successful!");
      window.location.href = "/auth/login";
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message || "Signup failed!");
      } else {
        alert("Signup failed!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 overflow-hidden">
      {/* Floating background orbs */}
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

      {/* Glass card form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 sm:p-10 rounded-2xl shadow-2xl grid sm:grid-cols-2 gap-4"
      >
        <h1 className="text-3xl font-extrabold text-center text-white sm:col-span-2 mb-4 drop-shadow-lg">
          Register on {APP_NAME}
        </h1>

        {/* Form Fields */}
        {[
          { id: "username", label: "Username", type: "text" },
          { id: "name", label: "Full Name", type: "text" },
          { id: "email", label: "Email", type: "email" },
          { id: "phone", label: "Phone", type: "tel" },
        ].map((field) => (
          <div key={field.id} className="relative flex flex-col">
            <input
              id={field.id}
              name={field.id}
              type={field.type}
              placeholder=" "
              value={form[field.id as keyof FormFields]}
              onChange={handleChange}
              className={`peer w-full px-3 pt-5 pb-2 rounded-lg bg-white/20 text-white placeholder-transparent focus:outline-none focus:ring-2 ${
                errors[field.id as keyof FormFields]
                  ? "focus:ring-red-400 border-red-400"
                  : "focus:ring-green-400 border-white/20"
              } border`}
            />
            <label
              htmlFor={field.id}
              className="absolute left-3 top-2 text-white/70 text-xs transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-white/60 peer-focus:top-2 peer-focus:text-xs peer-focus:text-white"
            >
              {field.label}
            </label>
            {errors[field.id as keyof FormFields] && (
              <p className="text-red-300 text-xs mt-1">
                {errors[field.id as keyof FormFields]}
              </p>
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
  className={`peer w-full px-3 pt-5 pb-2 rounded-lg bg-black/30 text-white placeholder-transparent focus:outline-none focus:ring-2 ${
    errors.password ? "focus:ring-red-400 border-red-400" : "focus:ring-indigo-400 border-white/20"
  } border transition-all duration-300`}
/>
<label
  htmlFor="password"
  className="absolute left-3 top-2 text-white/80 text-xs transition-all 
    peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm 
    peer-placeholder-shown:text-white/60 
    peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-300"
>
  Password
</label>
<button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-300 hover:text-white text-sm"
>
  {showPassword ? "🙈" : "👁"}
</button>

        </div>

        {/* Address */}
        <div className="relative flex flex-col sm:col-span-2">
          <textarea
            id="address"
            name="address"
            placeholder=" "
            rows={2}
            value={form.address}
            onChange={handleChange}
            className={`peer w-full px-3 pt-5 pb-2 rounded-lg bg-white/20 text-white placeholder-transparent focus:outline-none focus:ring-2 resize-none ${
              errors.address ? "focus:ring-red-400 border-red-400" : "focus:ring-green-400 border-white/20"
            } border`}
          />
          <label
            htmlFor="address"
            className="absolute left-3 top-2 text-white/70 text-xs transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-white/60 peer-focus:top-2 peer-focus:text-xs peer-focus:text-white"
          >
            Address
          </label>
          {errors.address && <p className="text-red-300 text-xs mt-1">{errors.address}</p>}
        </div>

        {/* Submit button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="submit"
          disabled={loading}
          className={`sm:col-span-2 w-full py-3 rounded-lg font-semibold text-white shadow-lg transition-all duration-300 ${
            loading
              ? "bg-green-400/50 cursor-not-allowed"
              : "bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600"
          }`}
        >
          {loading ? "Registering..." : "Register"}
        </motion.button>

        {/* Footer */}
        <div className="text-center sm:col-span-2 text-white/80 mt-2">
          Already have an account?{" "}
          <a href="/auth/login" className="text-yellow-300 font-semibold hover:underline">
            Login here
          </a>
        </div>
      </motion.form>
    </div>
  );
}
