// Check application health through the protected API group.
fetch("/api/health")
  .then((response) => response.json())
  .then((data) => {
    document.getElementById("health").textContent =
      `${data.status} · Database ${data.database}`;
  })
  .catch(() => {
    document.getElementById("health").textContent = "System health is unavailable.";
  });
