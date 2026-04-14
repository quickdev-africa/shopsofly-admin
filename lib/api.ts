const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://robust-annmaria-laserstarglobal-813df33a.koyeb.app";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("operator_token");
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}/api/v2/operator${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const api = {
  login:        (data: object) => request("/operator_sessions", { method: "POST", body: JSON.stringify(data) }),
  dashboard:    () => request("/dashboard/summary"),
  getStores:    (page = 1) => request(`/stores?page=${page}`),
  getStore:     (id: number) => request(`/stores/${id}`),
  updateStore:          (id: number, data: object) => request(`/stores/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteStore:          (id: number) => request(`/stores/${id}`, { method: "DELETE" }),
  getMerchants:         () => request("/merchants"),
  getMerchant:          (id: number) => request(`/merchants/${id}`),
  resendWelcomeEmail:   (id: number) => request(`/merchants/${id}/resend_welcome`, { method: "POST" }),
  getSubscriptions:     () => request("/subscriptions"),
  markPaid:             (id: number) => request(`/subscriptions/${id}/mark_paid`, { method: "POST" }),
  suspendSubscription:  (id: number) => request(`/subscriptions/${id}/suspend`, { method: "POST" }),
  reactivateSubscription: (id: number) => request(`/subscriptions/${id}/reactivate`, { method: "POST" }),
  getDemoBookings:        () => request("/demo_bookings"),
  updateDemoBooking:      (id: number, data: object) => request(`/demo_bookings/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
};
