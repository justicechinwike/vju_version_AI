// Attach the login submit handler.
document.getElementById("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = document.getElementById("message");
  message.textContent = "Signing in...";
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Login failed.");
    window.location.href = "/dashboard";
  } catch (error) {
    message.textContent = error.message;
  }
});
