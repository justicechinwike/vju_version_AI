// Load configurable subscription packages.
async function loadPlans() {
  const response = await fetch("/api/subscriptions/plans");
  if (!response.ok) return;
  const data = await response.json();
  const grid = document.getElementById("planGrid");
  grid.textContent = "";
  data.plans.forEach((plan) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `<h2>${plan.name}</h2><div class="price">${plan.currency} ${Number(plan.price).toLocaleString()}</div><p>${plan.description || ""}</p><button data-id="${plan.id}">Select plan</button>`;
    grid.appendChild(card);
  });
  grid.querySelectorAll("button").forEach((button) => button.addEventListener("click", async () => {
    await fetch("/api/subscriptions/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: Number(button.dataset.id) })
    });
  }));
}

// Initialize subscription plans.
loadPlans();
