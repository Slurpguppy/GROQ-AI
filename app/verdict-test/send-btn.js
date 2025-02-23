const sendButton = document.getElementById("send-button");

sendButton.addEventListener("click", () => {
    sendButton.textContent = "Sent!";
    sendButton.style.backgroundColor = "#4caf50";

    setTimeout(() => {
        sendButton.textContent = "Send";
        sendButton.style.backgroundColor = "#0092ca";
    }, 2000);
});




const YESbutton = document.getElementById("YES-button");

YESbutton.addEventListener("click", () => {
    YESbutton.textContent = "Yes!";
    YESbutton.style.backgroundColor = "#4caf50";

    setTimeout(() => {
        YESbutton.textContent = "yes";
        YESbutton.style.backgroundColor = "#0092ca";
    }, 2000);
});


const NObutton = document.getElementById("NO-button");

NObutton.addEventListener("click", () => {
    NObutton.textContent = "No!";
    NObutton.style.backgroundColor = "#4caf50";

    setTimeout(() => {
        NObutton.textContent = "No";
        NObutton.style.backgroundColor = "#0092ca";
    }, 2000);
});


const IDKbutton = document.getElementById("IDK-button");

IDKbutton.addEventListener("click", () => {
    IDKbutton.textContent = "I Don't Know!";
    IDKbutton.style.backgroundColor = "#4caf50";

    setTimeout(() => {
        IDKbutton.textContent = "IDKButton";
        IDKbutton.style.backgroundColor = "#0092ca";
    }, 2000);
});