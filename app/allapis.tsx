export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/";

/* ------------------------------------------------------------------ */
/*  Generic fetch helper                                                */
/* ------------------------------------------------------------------ */
async function call(
  path: string,
  method: "GET" | "POST" | "DELETE" | "PUT" = "POST",
  body?: object,
  headers?: Record<string, string>
) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function jwtHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

/* ------------------------------------------------------------------ */
/*  Auth                                                                */
/* ------------------------------------------------------------------ */
export async function loginAdmin(payload: { username: string; password: string }) {
  return call("admins/login", "POST", payload);
}

export async function signupAdmin(payload: {
  username: string; name: string; email: string;
  phone: string; password: string; address: string;
}) {
  return call("admins/create", "POST", payload);
}

/* ------------------------------------------------------------------ */
/*  Dashboard stats (JWT token)                                         */
/* ------------------------------------------------------------------ */
export async function instancesStatistics(jwtToken: string) {
  return call("dashboard/instanceStatistics", "POST", {}, jwtHeader(jwtToken));
}

/* ------------------------------------------------------------------ */
/*  Instance management (admin API token)                               */
/* ------------------------------------------------------------------ */
export async function createInstance(token: string, instance_name: string) {
  return call("instance/create", "POST", { instance_name, token });
}

export async function getAllInstances(token: string) {
  return call("instance/list", "POST", { token });
}

export async function getInstanceDetails(token: string, uuid: string) {
  return call(`instance/details/${uuid}`, "GET", undefined);
}

export async function getInstanceStatus(token: string, instanceId: string) {
  return call(`instance/status/${instanceId}`, "POST", { token });
}

export async function startInstance(token: string, instance_name: string) {
  return call("instance/start", "POST", { token, instance_name });
}

export async function deleteInstance(token: string, instanceId: string) {
  return call(`instance/${instanceId}`, "DELETE", { token });
}

export async function logoutInstance(token: string, instanceId: string) {
  return call(`instance/logout/${instanceId}`, "DELETE", { token });
}

export async function setWebhook(token: string, instanceId: string, webhookUrl: string) {
  return call(`instance/webhook/${instanceId}`, "POST", { token, webhookUrl });
}

export async function getQRpng(token: string, instance_id: string): Promise<Blob> {
  const res = await fetch(`${API_BASE_URL}instance/qrpng/${instance_id}?token=${token}`);
  if (!res.ok) throw new Error("Fetching QR failed");
  return res.blob();
}

/* ------------------------------------------------------------------ */
/*  Messaging                                                            */
/* ------------------------------------------------------------------ */
export async function sendMessage(token: string, instanceId: string, number: string, message: string) {
  return call(`instance/send/${instanceId}`, "POST", { token, number, message });
}

export async function sendMedia(
  token: string, instanceId: string, number: string,
  base64: string, mimetype: string, filename: string, caption?: string
) {
  return call(`instance/send-media/${instanceId}`, "POST", { token, number, base64, mimetype, filename, caption });
}

export async function sendMediaFromUrl(token: string, instanceId: string, number: string, url: string, caption?: string) {
  return call(`instance/send-media-url/${instanceId}`, "POST", { token, number, url, caption });
}

export async function sendLocation(
  token: string, instanceId: string, number: string,
  latitude: number, longitude: number, description?: string
) {
  return call(`instance/send-location/${instanceId}`, "POST", { token, number, latitude, longitude, description });
}

/* ------------------------------------------------------------------ */
/*  Chat                                                                */
/* ------------------------------------------------------------------ */
export async function getChats(token: string, instanceId: string) {
  return call(`instance/chats/${instanceId}`, "POST", { token });
}

export async function getChatMessages(token: string, instanceId: string, chatId: string, limit = 50) {
  return call(`instance/messages/${instanceId}/${chatId}`, "POST", { token, limit });
}

export async function markChatRead(token: string, instanceId: string, chatId: string) {
  return call(`instance/mark-read/${instanceId}`, "POST", { token, chatId });
}

export async function reactToMessage(token: string, instanceId: string, chatId: string, messageId: string, emoji: string) {
  return call(`instance/react/${instanceId}`, "POST", { token, chatId, messageId, emoji });
}

export async function deleteMessage(token: string, instanceId: string, chatId: string, messageId: string, forEveryone = false) {
  return call(`instance/delete-message/${instanceId}`, "POST", { token, chatId, messageId, forEveryone });
}

/* ------------------------------------------------------------------ */
/*  Contacts                                                             */
/* ------------------------------------------------------------------ */
export async function getContacts(token: string, instanceId: string) {
  return call(`instance/contacts/${instanceId}`, "POST", { token });
}

export async function checkNumber(token: string, instanceId: string, number: string) {
  return call(`instance/check-number/${instanceId}`, "POST", { token, number });
}

export async function getProfilePic(token: string, instanceId: string, number: string) {
  return call(`instance/profile-pic/${instanceId}`, "POST", { token, number });
}

export async function getAccountInfo(token: string, instanceId: string) {
  return call(`instance/account-info/${instanceId}`, "POST", { token });
}

/* ------------------------------------------------------------------ */
/*  Groups                                                              */
/* ------------------------------------------------------------------ */
export async function getGroups(token: string, instanceId: string) {
  return call(`instance/groups/${instanceId}`, "POST", { token });
}

export async function createGroup(token: string, instanceId: string, name: string, participants: string[]) {
  return call(`instance/create-group/${instanceId}`, "POST", { token, name, participants });
}

export async function addGroupParticipants(token: string, instanceId: string, groupId: string, participants: string[]) {
  return call(`instance/group-add/${instanceId}`, "POST", { token, groupId, participants });
}

export async function removeGroupParticipants(token: string, instanceId: string, groupId: string, participants: string[]) {
  return call(`instance/group-remove/${instanceId}`, "POST", { token, groupId, participants });
}

/* ------------------------------------------------------------------ */
/*  Payments (JWT)                                                       */
/* ------------------------------------------------------------------ */
export async function requestPayment(
  jwtToken: string,
  instanceId: number,
  opts?: { amount?: number; currency?: string; durationDays?: number;
           paymentMethod?: string; transactionId?: string; notes?: string }
) {
  return call("payments/request", "POST", { instanceId, ...opts }, jwtHeader(jwtToken));
}

export async function getMyPayments(jwtToken: string) {
  return call("payments/my", "GET", undefined, jwtHeader(jwtToken));
}

export async function getInstancePayments(jwtToken: string, instanceId: string) {
  return call(`payments/instance/${instanceId}`, "GET", undefined, jwtHeader(jwtToken));
}

/* ------------------------------------------------------------------ */
/*  Super Admin (JWT with superadmin role)                              */
/* ------------------------------------------------------------------ */
export async function saGetStats(jwtToken: string) {
  return call("superadmin/stats", "GET", undefined, jwtHeader(jwtToken));
}

export async function saGetAdmins(jwtToken: string) {
  return call("superadmin/admins", "GET", undefined, jwtHeader(jwtToken));
}

export async function saGetInstances(jwtToken: string) {
  return call("superadmin/instances", "GET", undefined, jwtHeader(jwtToken));
}

export async function saGetPayments(jwtToken: string, status?: string) {
  const qs = status ? `?status=${status}` : "";
  return call(`superadmin/payments${qs}`, "GET", undefined, jwtHeader(jwtToken));
}

export async function saApprovePayment(jwtToken: string, paymentId: number) {
  return call(`superadmin/payments/${paymentId}/approve`, "POST", {}, jwtHeader(jwtToken));
}

export async function saRejectPayment(jwtToken: string, paymentId: number, reason?: string) {
  return call(`superadmin/payments/${paymentId}/reject`, "POST", { reason }, jwtHeader(jwtToken));
}

export async function saLockInstance(jwtToken: string, instanceId: number) {
  return call(`superadmin/instances/${instanceId}/lock`, "POST", {}, jwtHeader(jwtToken));
}

export async function saUnlockInstance(jwtToken: string, instanceId: number, days = 30) {
  return call(`superadmin/instances/${instanceId}/unlock`, "POST", { days }, jwtHeader(jwtToken));
}

export async function saDeleteAdmin(jwtToken: string, adminId: number) {
  return call(`superadmin/admins/${adminId}`, "DELETE", undefined, jwtHeader(jwtToken));
}
