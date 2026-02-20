const chatLog = document.getElementById("chat-log");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const submitButton = chatForm.querySelector("button");

function addMessage(text, sender) {
  const message = document.createElement("article");
  message.classList.add("message", sender);
  message.textContent = text;
  chatLog.appendChild(message);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? "Sending..." : "Send";
}

addMessage("Hi! I'm your chatbot tutor. Ask me a question to get started.", "bot");

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const question = userInput.value.trim();
  if (!question) {
    return;
  }

  addMessage(question, "user");
  userInput.value = "";
  setLoading(true);

  try {
    const response = await fetch("/api/tutor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong");
    }

    addMessage(data.answer, "bot");
  } catch (error) {
    addMessage(`Sorry, I couldn't respond right now. ${error.message}`, "bot");
  } finally {
    setLoading(false);
    userInput.focus();
  }
});
