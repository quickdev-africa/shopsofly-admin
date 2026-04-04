"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function SubscriptionsPage() {
  const router = useRouter();
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("operator_token");
    if (!token) { router.push("/login"); return; }
    api.getSubscriptions().then((data: any) => { setSubs(data.subscriptions || []); setLoading(false); })
      .catch(() => router.push("/login"));
  }, [router]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  async function handleMarkPaid(id: number) {
    setActing(id);
    try {
      await api.markPaid(id);
      showToast("Marked as paid!");
      const data: any = await api.getSubscriptions();
      setSubs(data.subscriptions || []);
    } catch { showToast("Failed."); }
    finally { setActing(null); }
  }

  async function handleSuspend(id: number) {
    if (!confirm("Suspend this merchant?")) return;
    setActing(id);
    try {
      await api.suspendSubscription(id);
      showToast("Suspended.");
      const data: any = await api.getSubscriptions();
      setSubs(data.subscriptions || []);
    } catch { showToast("Failed."); }
    finally { setActing(null); }
  }

  async function handleReactivate(id: number) {
    setActing(id);
    try {
      await api.reactivateSubscription(id);
      showToast("Reactivated!");
      const data: any = await api.getSubscriptions();
      setSubs(data.subscriptions || []);
    } catch { showToast("Failed."); }
    finally { setActing(null); }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-600">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push("/dashboard")} className="text-gray-600 hover:text-gray-600 text-sm">← Dashboard</button>
        <h1 className="text-xl font-bold text-gray-900">Subscriptions</h1>
        <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded-full">{subs.length}</span>
      </div>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>{["Merchant","Plan","Status","Period Ends","Grace Period","Failed","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {subs.map((s: any) => {
                const days = s.days_until_expiry;
                const isActing = acting === s.id;
                return (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <p className="font-semibold text-gray-900">{s.merchant?.email}</p>
                      <p className="text-xs text-gray-600 font-medium">{s.merchant?.store?.name}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{s.merchant?.plan?.name || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={"text-xs font-semibold px-2 py-1 rounded-full " + (s.status === "active" ? "bg-green-100 text-green-700" : s.status === "trial" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700")}>{s.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {s.current_period_ends_at ? new Date(s.current_period_ends_at).toLocaleDateString() : "—"}
                      {days !== null && <p className={"text-xs " + (days < 0 ? "text-red-500 font-semibold" : days < 7 ? "text-amber-500" : "text-gray-400")}>{days < 0 ? Math.abs(days) + "d overdue" : days + "d left"}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {s.grace_period_active ? <span className="text-amber-500 font-semibold text-xs">{7 + days}d remaining</span> :
                       s.should_suspend ? <span className="text-red-500 font-semibold text-xs">Should suspend</span> : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm">{s.failed_attempts ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleMarkPaid(s.id)} disabled={isActing}
                          className="text-xs bg-green-600 text-white px-2 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50">
                          ✓ Paid
                        </button>
                        {s.status !== "suspended" ? (
                          <button onClick={() => handleSuspend(s.id)} disabled={isActing}
                            className="text-xs bg-red-500 text-white px-2 py-1.5 rounded-lg hover:bg-red-600 disabled:opacity-50">
                            Suspend
                          </button>
                        ) : (
                          <button onClick={() => handleReactivate(s.id)} disabled={isActing}
                            className="text-xs bg-blue-600 text-white px-2 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {toast && <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm z-50">{toast}</div>}
    </div>
  );
}
