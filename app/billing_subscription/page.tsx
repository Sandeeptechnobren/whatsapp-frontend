"use client";

import React from "react";

export default function BillingSubscriptionPage() {
  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white rounded-xl shadow-md p-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">
        Billing & Subscription
      </h1>
      <p className="text-gray-700 mb-6">
        Here you will be able to manage your subscription plan, billing details, and payment history.
      </p>
      <div className="border border-gray-200 rounded-lg px-6 py-8 text-center bg-gray-50">
        <span className="text-lg text-gray-600">No subscription data yet.</span>
      </div>
    </div>
  );
}
