// Store the active conversation identifier.
let activeConversationId = null;

// Add a message to the visible chat.
function appendMessage(role, content) {
  const article = document.createElement("article");
  article.className = role;
  article.textContent = content;
  document.getElementById("messages").appendChild(article);
  article.scrollIntoView({ behavior: "smooth" });
}

// Load existing conversations.
async function loadConversations() {
  const response = await fetch("/api/chat/conversations");
  if (!response.ok) return;
  const data = await response.json();
  const list = document.getElementById("conversationList");
  list.textContent = "";
  data.conversations.forEach((conversation) => {
    const item = document.createElement("div");
    item.className = "conversation-item";
    item.textContent = conversation.title;
    item.addEventListener("click", () => openConversation(conversation.id));
    list.appendChild(item);
  });
}

// Open an existing conversation.
async function openConversation(id) {
  const response = await fetch(`/api/chat/conversations/${id}`);
  if (!response.ok) return;
  const data = await response.json();
  activeConversationId = id;
  document.getElementById("conversationTitle").textContent = data.conversation.title;
  document.getElementById("messages").textContent = "";
  (data.conversation.messages || []).forEach((message) => appendMessage(message.role, message.content));
}

// Create a new conversation.
document.getElementById("newChat").addEventListener("click", async () => {
  const response = await fetch("/api/chat/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Educational analysis" })
  });
  if (!response.ok) return;
  const data = await response.json();
  activeConversationId = data.conversation.id;
  document.getElementById("conversationTitle").textContent = data.conversation.title;
  document.getElementById("messages").textContent = "";
  appendMessage("assistant", "How can I help explain the selected chart information?");
  loadConversations();
});

// Send a chat message.
document.getElementById("chatForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text) return;
  if (!activeConversationId) {
    await document.getElementById("newChat").click();
  }
  appendMessage("user", text);
  input.value = "";
  const response = await fetch(`/api/chat/conversations/${activeConversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text })
  });
  const data = await response.json();
  appendMessage("assistant", data.message || data.error || "Unable to generate a response.");
});

// Initialize conversation list.
loadConversations();
