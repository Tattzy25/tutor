function saveChatToCookie() {
    const chatMessages = document.getElementById('chatMessages').innerHTML;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // Save for 7 days
    document.cookie = `mathTutorChat=${encodeURIComponent(chatMessages)};expires=${expiryDate.toUTCString()};path=/;SameSite=Lax`;
}

function loadChatFromCookie() {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {});
    const chatHistory = cookies.mathTutorChat;
    if (chatHistory) {
        document.getElementById('chatMessages').innerHTML = decodeURIComponent(chatHistory);
        // alert('Chat session loaded!');
    } else {
        // alert('No saved session found.');
    }
}

// Automatically load the chat on page load
document.addEventListener('DOMContentLoaded', loadChatFromCookie);