// Track the active screen-assistance session.
let activeSessionId = null;

// Create a monitor session.
document.getElementById("monitorButton").addEventListener("click", async () => {
  const source = document.querySelector("input[name='source']:checked").value;
  const response = await fetch("/api/screen/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ captureSource: source })
  });
  const data = await response.json();
  if (response.ok) {
    activeSessionId = data.session.id;
    document.getElementById("sessionStatus").textContent = "Monitoring";
    document.getElementById("monitorButton").disabled = true;
    document.getElementById("stopButton").disabled = false;
  }
});

// Stop the active monitor session.
document.getElementById("stopButton").addEventListener("click", async () => {
  if (!activeSessionId) return;
  await fetch(`/api/screen/sessions/${activeSessionId}/stop`, { method: "POST" });
  activeSessionId = null;
  document.getElementById("sessionStatus").textContent = "Idle";
  document.getElementById("monitorButton").disabled = false;
  document.getElementById("stopButton").disabled = true;
});

// Upload and validate a screenshot.
document.getElementById("uploadButton").addEventListener("click", async () => {
  const file = document.getElementById("screenshot").files[0];
  const message = document.getElementById("message");
  if (!file) {
    message.textContent = "Select a supported screenshot first.";
    return;
  }
  const form = new FormData();
  form.append("screenshot", file);
  const response = await fetch("/api/screen/upload", { method: "POST", body: form });
  const data = await response.json();
  message.textContent = response.ok ? data.message : data.error;
});
