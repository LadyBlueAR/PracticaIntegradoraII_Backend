const socket = io();

let user;
let chatBox = document.getElementById('chatBox');

Swal.fire({
    title: "Ingresa tu Nombre",
    input: "text",
    text: "Nombre",
    inputValidator: (value) => {
        return !value && "El nombre de usuario es obligatorio"
    },
    allowOutsideClick: false }).then(result => {
        user= result.value;
});

chatBox.addEventListener('keyup', event => {
    if (event.key === "Enter") { 
        if (chatBox.value.trim().length > 0) {
            socket.emit('message', { user: user, message: chatBox.value });
            chatBox.value = "";
        }
    }
})

socket.on('messageLogs', (messages) => {
    let log = document.getElementById("messageLogs");
    log.innerHTML = "";
    messages.forEach((message) => {
        let messageElement = document.createElement("div");
        messageElement.innerHTML = `<strong>${message.user}</strong>: ${message.message}`;
        log.appendChild(messageElement);
    });
});