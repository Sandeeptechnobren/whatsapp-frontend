// "use client";

// import "./globals.css";
// import { ReactNode } from "react";
// import { AuthProvider } from "./AuthContext";

// export default function RootLayout({ children }: { children: ReactNode }) {
//   return (
//     <html lang="en">
//       <body className="flex h-screen">
//         <AuthProvider>
//           <main className="flex-1 bg-gray-100">{children}</main>
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }
"use client";

import "./globals.css";
import { ReactNode } from "react";
import { AuthProvider, useAuth } from "./AuthContext"; // ✅ import useAuth hook
import TopNav from "./components/TopNav";
import Footer from "./components/Footer";

function LayoutContent({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();

  return (
    <body className="flex h-screen flex-col">
      {/* Show Navbar only when logged in */}
      {isLoggedIn && <TopNav />}
      <main className="flex-1 bg-gray-100">{children}</main>
      {isLoggedIn && <Footer />}
    </body>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <AuthProvider>
        <LayoutContent>{children}</LayoutContent>
      </AuthProvider>
    </html>
  );
}
