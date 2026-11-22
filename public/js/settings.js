// Load voice preferences.
async function loadPreferences() {
  const response = await fetch("/api/voice/preferences");
  if (!response.ok) return;
  const data = await response.json();
  document.getElementById("voiceActivation").checked = data.preferences.voice_activation;
  document.getElementById("voiceResponse").checked = data.preferences.voice_response;
  document.getElementById("language").value = data.preferences.language || "en";
  document.getElementById("volume").value = data.preferences.playback_volume || 70;
}

// Save voice preferences.
document.getElementById("voiceForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  await fetch("/api/voice/preferences", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      voiceActivation: document.getElementById("voiceActivation").checked,
      voiceResponse: document.getElementById("voiceResponse").checked,
      language: document.getElementById("language").value,
      playbackVolume: Number(document.getElementById("volume").value)
    })
  });
  document.getElementById("message").textContent = "Voice settings saved.";
});

// Initialize settings.
loadPreferences();
