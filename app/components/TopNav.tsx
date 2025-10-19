"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../AuthContext";
import { APP_NAME } from "../config";

export default function TopNav() {
  const pathname = usePathname();
  const { logout, admin } = useAuth();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/instances", label: "Instances" },
    { href: "/docs", label: "Docs" },
    { href: "/about", label: "About" },
    { href: "/billing", label: "Billing" },
    { href: "/subscriptions", label: "Subscriptions" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b shadow-sm px-6 py-3 flex items-center justify-between">
      {/* Left side - Logo + Links */}
      <div className="flex items-center space-x-8">
        {/* App Name */}
        <h1 className="text-xl font-bold text-green-600 tracking-wide">
          {APP_NAME}
        </h1>

        {/* Navigation Links */}
        <div className="flex space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium border-b-2 transition ${
                pathname === item.href
                  ? "text-green-600 border-green-600"
                  : "text-gray-600 border-transparent hover:text-green-500 hover:border-green-500"
              } pb-1`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Right side - User + Logout */}
      <div className="flex items-center space-x-4">
        {admin && (
          <span className="text-sm text-gray-700">
            Hi, <strong>{admin.username}</strong> 👋
          </span>
        )}
        <button
          onClick={logout}
          className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg shadow-sm hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
