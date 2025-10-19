"use client";

export default function LogoutButton() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login"; // redirect after logout
  };

  return (
    <button
      onClick={handleLogout}
      className="fixed bottom-6 right-6 bg-red-500 text-white rounded-full p-4 shadow-lg hover:bg-red-600 transition"
    >
      Logout
    </button>
  );
}
