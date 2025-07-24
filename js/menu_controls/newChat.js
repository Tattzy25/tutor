// js/menu_controls/newChat.js
export function newChat(addMessage, menuOverlay) {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';
    document.cookie = "chatHistory=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    addMessage("Hello! I'm your AI Math Tutor. Ask me any math question or use voice input!", false);
    menuOverlay.style.display = 'none';
}