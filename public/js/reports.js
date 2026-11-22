// Load permitted educational reports.
async function loadReports() {
  const response = await fetch("/api/reports");
  if (!response.ok) return;
  const data = await response.json();
  const grid = document.getElementById("reportGrid");
  grid.textContent = "";
  data.reports.forEach((report) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `<h2>${report.asset || "Unknown asset"}</h2><p>${report.platform || "Unknown"} · ${report.timeframe || "Unknown"}<br>${new Date(report.created_at).toLocaleString()}</p><button data-id="${report.id}" class="export">Export</button><button data-id="${report.id}" class="delete">Delete</button>`;
    grid.appendChild(card);
  });
  grid.querySelectorAll(".export").forEach((button) => button.addEventListener("click", () => window.location.href = `/api/reports/${button.dataset.id}/export`));
  grid.querySelectorAll(".delete").forEach((button) => button.addEventListener("click", async () => {
    if (!confirm("Delete this report?")) return;
    await fetch(`/api/reports/${button.dataset.id}`, { method: "DELETE" });
    loadReports();
  }));
}

// Initialize report history.
loadReports();
