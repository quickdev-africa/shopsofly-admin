"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setLoading(true);
    setError("");
    try {
      const data: any = await api.login(form);
      localStorage.setItem("operator_token", data.token);
      localStorage.setItem("operator", JSON.stringify(data.operator));
      router.push("/dashboard");
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🛡️</div>
          <h1 className="text-2xl font-bold text-gray-900">Shopsofly Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Platform administration access</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email}
              onChange={(e) => setForm(s => ({ ...s, email: e.target.value }))}
              placeholder="admin@shopsofly.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={form.password}
              onChange={(e) => setForm(s => ({ ...s, password: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button onClick={handleLogin} disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-60">
            {loading ? "Signing in..." : "Sign In to Admin Panel"}
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">Shopsofly Platform Administration — QuickDev Africa</p>
      </div>
    </div>
  );
}
