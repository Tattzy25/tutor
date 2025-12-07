// js/menu_controls/newChat.js
export function newChat(addMessage, menuOverlay) {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';
    document.cookie = "chatHistory=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    addMessage("Hello! I'm your AI Tutor. I can help you learn languages, practice conversation, or answer any questions. Use voice or text!", false);
    menuOverlay.style.display = 'none';
}