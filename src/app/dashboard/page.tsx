"use client";

import { useAuthStore } from "@/core/store/authStore";

export default function DashboardPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Status: {isAuthenticated ? "Logado ✅" : "Deslogado ❌"}</p>
    </div>
  );
}
