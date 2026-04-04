"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function MessagesPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("operator_token");
    if (!token) { router.push("/login"); return; }
    api.getDemoBookings().then((data: any) => {
      setBookings(data.bookings || []);
      setLoading(false);
    }).catch(() => router.push("/login"));
  }, [router]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  async function updateStatus(id: number, status: string) {
    setActing(id);
    try {
      await api.updateDemoBooking(id, { status });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      showToast("Status updated.");
    } catch { showToast("Failed."); }
    finally { setActing(null); }
  }

  function statusBadge(status: string) {
    const c = status === "confirmed" ? "bg-green-100 text-green-700" :
              status === "cancelled" ? "bg-red-100 text-red-700" :
              "bg-amber-100 text-amber-700";
    return <span className={"text-xs font-semibold px-2 py-1 rounded-full " + c}>{status}</span>;
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-400">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push("/dashboard")} className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</button>
        <h1 className="text-xl font-bold text-gray-900">Demo Bookings</h1>
        <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded-full">{bookings.length}</span>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-500 font-medium">No demo bookings yet.</p>
            <p className="text-gray-400 text-sm mt-1">When visitors book a demo on shopsofly.com, they will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Name", "Email", "Phone", "Preferred Date", "Notes", "Status", "Booked", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b: any) => (
                  <tr key={b.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{b.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{b.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{b.phone}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {b.preferred_date ? new Date(b.preferred_date).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" }) + " 7:30 PM" : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{b.notes || "—"}</td>
                    <td className="px-4 py-3">{statusBadge(b.status || "pending")}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(b.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => updateStatus(b.id, "confirmed")} disabled={acting === b.id || b.status === "confirmed"}
                          className="text-xs bg-green-600 text-white px-2 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-40">
                          ✓ Confirm
                        </button>
                        <button onClick={() => updateStatus(b.id, "cancelled")} disabled={acting === b.id || b.status === "cancelled"}
                          className="text-xs bg-red-500 text-white px-2 py-1.5 rounded-lg hover:bg-red-600 disabled:opacity-40">
                          ✕ Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm z-50">{toast}</div>
      )}
    </div>
  );
}
