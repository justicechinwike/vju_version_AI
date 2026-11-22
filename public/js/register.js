// Attach the registration submit handler.
document.getElementById("registerForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = document.getElementById("message");
  message.textContent = "Creating account...";
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: document.getElementById("fullName").value,
        email: document.getElementById("email").value,
        country: document.getElementById("country").value,
        password: document.getElementById("password").value,
        confirmPassword: document.getElementById("confirmPassword").value,
        terms: document.getElementById("terms").checked
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Registration failed.");
    message.textContent = data.message;
    setTimeout(() => { window.location.href = "/login"; }, 1200);
  } catch (error) {
    message.textContent = error.message;
  }
});
