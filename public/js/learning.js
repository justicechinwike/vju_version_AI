// Load published learning resources.
async function loadLearning(query = "") {
  const response = await fetch(`/api/learning${query ? `?search=${encodeURIComponent(query)}` : ""}`);
  if (!response.ok) return;
  const data = await response.json();
  const grid = document.getElementById("learningGrid");
  grid.textContent = "";
  data.resources.forEach((resource) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `<h2>${resource.title}</h2><p>${resource.category}<br>${resource.description || ""}</p><button data-id="${resource.id}" class="save">Save lesson</button>`;
    grid.appendChild(card);
  });
  grid.querySelectorAll(".save").forEach((button) => button.addEventListener("click", async () => {
    await fetch(`/api/learning/${button.dataset.id}/save`, { method: "POST" });
  }));
}

// Search learning resources.
document.getElementById("searchButton").addEventListener("click", () => loadLearning(document.getElementById("search").value));

// Initialize learning resources.
loadLearning();
