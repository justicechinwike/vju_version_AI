// Load administrative statistics.
async function loadAdmin() {
  const statsResponse = await fetch("/api/admin/statistics");
  if (!statsResponse.ok) {
    document.getElementById("stats").innerHTML = "<p>Administrative permission required.</p>";
    return;
  }
  const stats = await statsResponse.json();
  const labels = [
    ["Users", stats.users],
    ["Active", stats.activeUsers],
    ["Reports", stats.reports],
    ["Sessions", stats.screenSessions],
    ["Payments", stats.payments]
  ];
  document.getElementById("stats").innerHTML = labels.map(([label, value]) =>
    `<article class="stat"><strong>${value}</strong><small>${label}</small></article>`
  ).join("");

  const usersResponse = await fetch("/api/admin/users");
  const usersData = await usersResponse.json();
  document.getElementById("users").innerHTML = usersData.users.map((user) =>
    `<div class="row">${user.full_name} · ${user.email}<br><small>${user.role} · ${user.status}</small></div>`
  ).join("");

  const auditResponse = await fetch("/api/admin/audit");
  const auditData = await auditResponse.json();
  document.getElementById("audit").innerHTML = auditData.audit.map((entry) =>
    `<div class="row">${entry.action}<br><small>${entry.entity || ""} · ${new Date(entry.created_at).toLocaleString()}</small></div>`
  ).join("");
}

// Initialize administrative dashboard.
loadAdmin();
