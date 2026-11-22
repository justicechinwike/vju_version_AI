// Load user recordings.
async function loadRecordings() {
  const response = await fetch("/api/recordings");
  if (!response.ok) return;
  const data = await response.json();
  const grid = document.getElementById("recordingGrid");
  grid.textContent = "";
  data.recordings.forEach((recording) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `<h2>${recording.name}</h2><p>${recording.mode} · ${recording.resolution}<br>${recording.status} · ${recording.duration_seconds}s</p><button class="stop" data-id="${recording.id}">Stop</button><button class="delete" data-id="${recording.id}">Delete</button>`;
    grid.appendChild(card);
  });
  grid.querySelectorAll(".stop").forEach((button) => button.addEventListener("click", async () => {
    await fetch(`/api/recordings/${button.dataset.id}/stop`, { method: "POST" });
    loadRecordings();
  }));
  grid.querySelectorAll(".delete").forEach((button) => button.addEventListener("click", async () => {
    if (!confirm("Delete this recording?")) return;
    await fetch(`/api/recordings/${button.dataset.id}`, { method: "DELETE" });
    loadRecordings();
  }));
}

// Start a recording session.
document.getElementById("start").addEventListener("click", async () => {
  await fetch("/api/recordings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: `Recording ${new Date().toLocaleString()}`,
      mode: document.getElementById("mode").value,
      resolution: document.getElementById("resolution").value,
      frameRate: Number(document.getElementById("frameRate").value),
      audioConfig: { enabled: false }
    })
  });
  loadRecordings();
});

// Initialize the recording library.
loadRecordings();
