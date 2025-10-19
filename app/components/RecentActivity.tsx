"use client";

export default function RecentActivity() {
  const activities = [
    { text: "New session connected", time: "2 mins ago" },
    { text: "Message sent to +1 234 567 890", time: "10 mins ago" },
    { text: "User joined: John Doe", time: "1 hr ago" },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
      <ul className="divide-y divide-gray-200 text-sm">
        {activities.map((a, i) => (
          <li key={i} className="py-2 flex justify-between">
            <span className="text-gray-700">{a.text}</span>
            <span className="text-gray-500">{a.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
