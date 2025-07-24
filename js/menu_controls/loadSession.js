// js/menu_controls/loadSession.js
export function loadSession(loadChatFromCookie, menuOverlay) {
    loadChatFromCookie();
    menuOverlay.style.display = 'none';
}