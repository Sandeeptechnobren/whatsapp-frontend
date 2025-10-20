"use client";
export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4 text-blue-600">About This Application</h1>
      <p className="mb-4 text-gray-700">
        This application is designed to provide users with a seamless experience in managing their instances and monitoring key statistics. Built with modern web technologies, it ensures responsiveness and ease of use across all devices.
      </p>
      <h2 className="text-2xl font-semibold mb-3 text-blue-600">Features</h2>
      <ul className="list-disc list-inside mb-4 text-gray-700">
        <li>Instance Creation: Easily create and manage your instances with customizable names.</li>
        <li>Real-time Statistics: Monitor active sessions, messages, and user activity through intuitive dashboards.</li>
        <li>API Integration: Seamlessly integrate with various APIs to enhance functionality and data management.</li>
        <li>Secure Access: Ensure your data is protected with robust authentication and authorization mechanisms.</li>
      </ul> 
        <h2 className="text-2xl font-semibold mb-3 text-blue-600">Technologies Used</h2>
        <ul className="list-disc list-inside mb-4 text-gray-700">
            <li>React and Next.js for building the user interface.</li>
            <li>TypeScript for type safety and improved developer experience.</li>
            <li>Tailwind CSS for rapid and responsive styling.</li>
            <li>Various third-party libraries for enhanced functionality (e.g., lucide-react for icons).</li>
        </ul>
      <h2 className="text-2xl font-semibold mb-3 text-blue-600">Contact</h2>
      </div>
      );
}