const chatLog = document.getElementById("chat-log");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");

const placeholderResponses = [
  "Great question — this is a prototype response. In the full version, I'd explain the concept step by step.",
  "Thanks for asking! Placeholder tutor reply: we can break this down into smaller parts together.",
  "Prototype mode: imagine a detailed answer here with hints and examples tailored to your level.",
];

let responseIndex = 0;

function addMessage(text, sender) {
  const message = document.createElement("article");
  message.classList.add("message", sender);
  message.textContent = text;
  chatLog.appendChild(message);
  chatLog.scrollTop = chatLog.scrollHeight;
}

addMessage("Hi! I'm your chatbot tutor prototype. Ask me anything to test the UI.", "bot");

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const question = userInput.value.trim();
  if (!question) {
    return;
  }

  addMessage(question, "user");
  userInput.value = "";

  const response = placeholderResponses[responseIndex % placeholderResponses.length];
  responseIndex += 1;

  window.setTimeout(() => {
    addMessage(response, "bot");
  }, 300);
});
