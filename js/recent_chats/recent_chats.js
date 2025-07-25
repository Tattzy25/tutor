import { getRecentChats, loadChat } from '../session_manager/sessionManager.js';

let recentChatsOverlay = null;

async function loadRecentChatsComponent() {
    if (document.getElementById('recent-chats-overlay')) return;

    const response = await fetch('js/recent_chats/recent_chats.html');
    const html = await response.text();
    document.body.insertAdjacentHTML('beforeend', html);

    recentChatsOverlay = document.getElementById('recent-chats-overlay');
    const closeButton = document.getElementById('close-recent-chats');
    closeButton.addEventListener('click', hideRecentChats);

    const listElement = document.getElementById('recent-chats-list');
    listElement.addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {
            const sessionId = event.target.dataset.sessionId;
            if (sessionId) {
                loadChat(sessionId);
                hideRecentChats();
            }
        }
    });
}

function showRecentChats() {
    if (!recentChatsOverlay) return;

    const recentChats = getRecentChats();
    const listElement = document.getElementById('recent-chats-list');
    listElement.innerHTML = '';

    if (recentChats.length === 0) {
        listElement.innerHTML = '<li>No recent chats found.</li>';
    } else {
        recentChats.forEach(chat => {
            const listItem = document.createElement('li');
            listItem.textContent = `Chat from ${new Date(chat.timestamp).toLocaleString()}`;
            listItem.dataset.sessionId = chat.id;
            listElement.appendChild(listItem);
        });
    }

    recentChatsOverlay.classList.remove('hidden');
}

function hideRecentChats() {
    if (recentChatsOverlay) {
        recentChatsOverlay.classList.add('hidden');
    }
}

export async function initRecentChats() {
    await loadRecentChatsComponent();
    const loadSessionBtn = document.getElementById('load-session-btn');
    if(loadSessionBtn) {
        loadSessionBtn.addEventListener('click', showRecentChats);
    }
}