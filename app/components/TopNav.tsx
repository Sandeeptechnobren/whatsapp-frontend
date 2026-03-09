"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../AuthContext";
import { APP_NAME } from "../config";
import { LogOut, MessageSquareMore, ShieldCheck, Settings } from "lucide-react";

export default function TopNav() {
  const pathname = usePathname();
  const { logout, admin, isSuperAdmin } = useAuth();

  const navItems = [
    { href: "/dashboard",            label: "Dashboard" },
    { href: "/instances",            label: "Instances" },
    { href: "/billing_subscription", label: "Billing" },
    { href: "/settings",             label: "AI Settings" },
    { href: "/docs",                 label: "Docs" },
  ];

  const isActive = (href: string) =>
    pathname === href || (pathname.startsWith(href + "/") && href !== "/");

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
            <MessageSquareMore className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-green-700">{APP_NAME}</span>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-0.5 flex-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${
                isActive(item.href)
                  ? "bg-green-50 text-green-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </Link>
          ))}

          {isSuperAdmin && (
            <Link
              href="/superadmin"
              className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg font-medium transition ${
                isActive("/superadmin")
                  ? "bg-purple-50 text-purple-700"
                  : "text-purple-600 hover:bg-purple-50"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Super Admin
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/settings"
            title="AI Settings"
            className={`p-2 rounded-lg transition md:hidden ${
              isActive("/settings") ? "bg-violet-50 text-violet-700" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <Settings className="w-4 h-4" />
          </Link>
          {admin && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 rounded-lg">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                isSuperAdmin ? "bg-purple-600" : "bg-green-600"
              }`}>
                {(admin.username || "?").charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-700 font-medium">{admin.username}</span>
              {isSuperAdmin && (
                <span className="text-xs px-1 py-0.5 bg-purple-100 text-purple-700 rounded font-medium">SA</span>
              )}
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
