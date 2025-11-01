"use client";
import UnderDevelopment from "../components/UnderDevelopment"; // Adjust path as needed

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white rounded-xl shadow-md p-8">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">
        About
      </h1>
      <UnderDevelopment message="This page in Chatterly is under development. You will be able to view guides, API docs, and more soon!" />
    </div>
  );
}