let sessionId = localStorage.getItem("sessionId") || generateSessionId();
localStorage.setItem("sessionId", sessionId);

let aiMessageCount = 0;
let isThinking = false;
let userSentLastMessage = false; // New tracker

function generateSessionId() {
    return "session-" + Math.random().toString(36).substr(2, 9);
}

async function sendMessageversatile(userMessage) {
    const chatBox = document.getElementById("chat-box-versatile");
    if (!userMessage) return;

    chatBox.innerHTML += `<div class="message user">${userMessage}</div>`;
    userSentLastMessage = true; // User sent a message

    // Show "Thinking..." if the user sent a message
    const lastBotMessageElement = document.getElementById("lastBotMessage");
    lastBotMessageElement.innerText = "";
    lastBotMessageElement.classList.add("thinking");

    // Show animation
    document.getElementById("animation").style.display = "block";
    isThinking = true;

    try {
        const response = await fetch("http://localhost:6000/chat-llama-3.3-70b-versatile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage, sessionId }),
        });

        const data = await response.json();
        if (!data.response) throw new Error("Invalid response from server");

        displayChatHistory(data.history);
    } catch (error) {
        chatBox.innerHTML += ``;
        isThinking = false;
        document.getElementById("animation").style.display = "none"; // Hide animation on error
    }
}

function displayChatHistory(history) {
    const chatBox = document.getElementById("chat-box-versatile");
    chatBox.innerHTML = "";

    aiMessageCount = 0;
    let firstUserMessage = "";
    let fourthAiMessage = "";
    let lastBotMessage = "";
    let lastMessageRole = "";

    history.forEach(msg => {
        const roleClass = msg.role === "user" ? "user" : "bot";
        chatBox.innerHTML += `<div class="message ${roleClass}">${msg.content}</div>`;

        if (msg.role === "user" && !firstUserMessage) {
            firstUserMessage = msg.content;
        }

        if (msg.role === "assistant") {
            aiMessageCount++;
            lastBotMessage = msg.content;
            if (aiMessageCount === 4) {
                fourthAiMessage = msg.content;
            }
        }

        lastMessageRole = msg.role;
    });

    if (lastMessageRole === "user") {
        document.getElementById("lastBotMessage").innerText = "";
    } else if (lastBotMessage) {
        document.getElementById("lastBotMessage").innerText = lastBotMessage;
        isThinking = false;
        document.getElementById("animation").style.display = "none"; // Hide animation when bot replies
        userSentLastMessage = false; // Reset tracker
    }

    if (firstUserMessage && fourthAiMessage) {
        showPopup(firstUserMessage + "\n\n" + fourthAiMessage);
    }
}

document.querySelector(".YES-button").addEventListener("click", () => sendMessageversatile("Yes"));
document.querySelector(".NO-button").addEventListener("click", () => sendMessageversatile("No"));
document.querySelector(".IDK-button").addEventListener("click", () => sendMessageversatile("I Don't Know"));
document.querySelector(".elaborate-button").addEventListener("click", () => sendMessageversatile("Explane your decision"));

document.querySelector("#user-input-versatile").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendTextInput();
    }
});

document.querySelector("#send-button").addEventListener("click", sendTextInput);


function sendTextInput() {
    const input = document.getElementById("user-input-versatile");
    const message = input.value.trim();
    if (message) {
        sendMessageversatile(message);
        input.value = "";
    }
}

function reset() {
    document.getElementById("chat-box-versatile").innerHTML = "";
    localStorage.removeItem("sessionId");
    aiMessageCount = 0;
    sessionId = generateSessionId();
    localStorage.setItem("sessionId", sessionId);
    closePopup();
}


function showPopup(message) {
document.getElementById("popup-message").innerText = message;
document.getElementById("popup").style.display = "block";
document.getElementById("popup-overlay").style.display = "block";
}

function closePopup() {
document.getElementById("popup").style.display = "none";
document.getElementById("popup-overlay").style.display = "none";
}