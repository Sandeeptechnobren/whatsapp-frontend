// "use client";

// import { LucideIcon } from "lucide-react";

// interface StatCardProps {
//   title: string;
//   value: string | number;
//   Icon: LucideIcon;
//   iconColor: string;
// }

// export default function StatCard({ title, value, Icon, iconColor }: StatCardProps) {
//   return (
//     <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
//       <div className="flex items-center justify-between">
//         <h2 className="text-sm font-medium text-gray-600">{title}</h2>
//         <Icon className={`w-5 h-5 ${iconColor}`} />
//       </div>
//       <p className="text-2xl font-bold mt-2">{value}</p>
//     </div>
//   );
// }
"use client";

import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  Icon: LucideIcon;
  iconColor: string;
}

export default function StatCard({ title, value, Icon, iconColor }: StatCardProps) {
  return (
    <div
      className="
        bg-gray-50 p-5 rounded-2xl 
        shadow-sm hover:shadow-md 
        hover:translate-y-[-2px]
        transition-all duration-300 ease-in-out
      "
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-500">{title}</h2>
        <div
          className={`
            p-1 rounded-xl bg-white shadow-inner
            flex items-center justify-center
          `}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <p className="text-2xl font-bold mt-4 text-gray-700">{value}</p>
    </div>
  );
}
