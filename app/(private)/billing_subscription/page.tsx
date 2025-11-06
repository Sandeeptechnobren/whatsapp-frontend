"use client";

import React from "react";
import UnderDevelopment from "../components/UnderDevelopment"; // Adjust path as needed

export default function BillingSubscriptionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-black transition-colors duration-500 px-4 py-10">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8 transition-all duration-300">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Title */}
          <h1 className="text-3xl font-extrabold text-purple-700 dark:text-purple-400 tracking-tight">
            Billing & Subscriptions
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md">
            Manage your plans, view invoices, and update payment methods — coming soon!
          </p>

          {/* Under Development Notice */}
          <UnderDevelopment message="This section of Chatterly is under development. You’ll soon be able to manage your subscription plans, billing history, and upgrade options here!" />
        </div>

        {/* Decorative Divider */}
        <div className="mt-10 border-t border-gray-200 dark:border-gray-700" />

        {/* Footer */}
        <p className="mt-6 text-center text-gray-500 dark:text-gray-400 text-sm">
          💳 Secure and flexible billing powered by trusted payment providers.
        </p>
      </div>
    </div>
  );
}
