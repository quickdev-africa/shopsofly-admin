"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function MerchantsPage() {
  const router = useRouter();
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("operator_token");
    if (!token) { router.push("/login"); return; }
    api.getMerchants().then((data: any) => {
      setMerchants(data.merchants || []);
      setLoading(false);
    }).catch(() => router.push("/login"));
  }, [router]);

  function badge(status: string) {
    const c = status === "active" ? "bg-green-100 text-green-700" :
              status === "trial" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700";
    return <span className={"text-xs font-semibold px-2 py-1 rounded-full " + c}>{status}</span>;
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push("/dashboard")} className="text-gray-600 hover:text-gray-600 text-sm">← Dashboard</button>
        <h1 className="text-xl font-bold text-gray-900">Merchants</h1>
        <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded-full">{merchants.length}</span>
      </div>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Email", "Store", "Plan", "Status", "Trial Ends", "Subscription", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {merchants.map((m: any) => {
                const sub = m.subscription;
                const daysLeft = sub?.current_period_ends_at
                  ? Math.round((new Date(sub.current_period_ends_at).getTime() - Date.now()) / 86400000)
                  : null;
                const trialExpired = m.trial_ends_at && new Date(m.trial_ends_at) < new Date();
                return (
                  <tr key={m.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{m.email}</td>
                    <td className="px-4 py-3 text-sm">
                      <p className="font-semibold text-gray-900">{m.store?.name}</p>
                      <p className="text-xs text-gray-500">{m.store?.subdomain}.shopsofly.com</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{m.plan?.name || "—"}</td>
                    <td className="px-4 py-3">{badge(m.status)}</td>
                    <td className={"px-4 py-3 text-xs " + (trialExpired ? "text-red-500" : "text-gray-600")}>
                      {m.trial_ends_at ? new Date(m.trial_ends_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {daysLeft !== null ? (
                        <span className={daysLeft < 0 ? "text-red-500 font-semibold" : daysLeft < 7 ? "text-amber-500" : "text-gray-500"}>
                          {daysLeft < 0 ? Math.abs(daysLeft) + "d overdue" : daysLeft + "d left"}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => router.push("/merchants/" + m.id)}
                        className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700">
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
