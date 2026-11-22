// Load permitted profile fields.
async function loadProfile() {
  const response = await fetch("/api/profile");
  if (!response.ok) return;
  const data = await response.json();
  document.getElementById("fullName").value = data.profile.full_name || "";
  document.getElementById("email").value = data.profile.email || "";
  document.getElementById("country").value = data.profile.country || "";
  document.getElementById("language").value = data.profile.preferred_language || "en";
}

// Save permitted profile changes.
document.getElementById("profileForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  await fetch("/api/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: document.getElementById("fullName").value,
      country: document.getElementById("country").value,
      preferredLanguage: document.getElementById("language").value
    })
  });
  document.getElementById("message").textContent = "Profile updated.";
});

// Record an account deletion request.
document.getElementById("deleteRequest").addEventListener("click", async () => {
  if (!confirm("Request account deletion?")) return;
  await fetch("/api/profile/delete-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason: "user_request" })
  });
  document.getElementById("message").textContent = "Account deletion request recorded.";
});

// Initialize profile.
loadProfile();
