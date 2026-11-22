// Update the command-center clock.
function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" });
  document.getElementById("date").textContent = now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

// Initialize the clock and refresh it every second.
updateClock();
setInterval(updateClock, 1000);

// Load account and dashboard summary data.
fetch("/api/dashboard")
  .then((response) => response.ok ? response.json() : Promise.reject(new Error("Dashboard unavailable")))
  .then((data) => {
    document.getElementById("userName").textContent = data.user.fullName || "Operator";
  })
  .catch(() => {
    document.getElementById("userName").textContent = "Operator";
  });
