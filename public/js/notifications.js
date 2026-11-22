// Load notification history.
async function loadNotifications() {
  const response = await fetch("/api/notifications");
  if (!response.ok) return;
  const data = await response.json();
  const list = document.getElementById("notificationList");
  list.textContent = "";
  data.notifications.forEach((notification) => {
    const item = document.createElement("article");
    item.className = "item";
    item.innerHTML = `<div><strong>${notification.title || notification.category}</strong><p>${notification.message || ""}</p></div><button data-id="${notification.id}">Delete</button>`;
    list.appendChild(item);
  });
  list.querySelectorAll("button").forEach((button) => button.addEventListener("click", async () => {
    await fetch(`/api/notifications/${button.dataset.id}`, { method: "DELETE" });
    loadNotifications();
  }));
}

// Initialize notifications.
loadNotifications();
