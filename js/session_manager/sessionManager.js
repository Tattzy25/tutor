// js/session_manager/sessionManager.js
// Production-grade multi-session manager for chat sessions using localStorage

const SESSION_PREFIX = 'aiTutorSession_';
const MAX_SESSIONS = 10;

function saveSession(sessionName, messages) {
    const sessionId = `${SESSION_PREFIX}${Date.now()}`;
    const sessionData = {
        id: sessionId,
        name: sessionName || `Session ${new Date().toLocaleString()}`,
        messages,
        timestamp: Date.now()
    };
    localStorage.setItem(sessionId, JSON.stringify(sessionData));
    cleanupOldSessions();
    return sessionId;
}

function loadSession(sessionId) {
    const data = localStorage.getItem(sessionId);
    return data ? JSON.parse(data) : null;
}

function deleteSession(sessionId) {
    localStorage.removeItem(sessionId);
}

function listSessions() {
    const sessions = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(SESSION_PREFIX)) {
            const session = JSON.parse(localStorage.getItem(key));
            sessions.push(session);
        }
    }
    // Sort by most recent
    sessions.sort((a, b) => b.timestamp - a.timestamp);
    return sessions;
}

function cleanupOldSessions() {
    const sessions = listSessions();
    if (sessions.length > MAX_SESSIONS) {
        const toDelete = sessions.slice(MAX_SESSIONS);
        toDelete.forEach(s => deleteSession(s.id));
    }
}

function exportSession(sessionId) {
    const session = loadSession(sessionId);
    return session ? JSON.stringify(session) : null;
}

function getRecentChats() {
    return listSessions();
}

function loadChat(sessionId) {
    const sessionData = loadSession(sessionId);
    if (sessionData) {
        // This is a placeholder for the actual chat loading logic in app.js
        console.log(`Loading chat: ${sessionData.name}`);
        // In a real app, you'd pass this data to the main app component
        // to render the chat messages.
    }
    return sessionData;
}

function importSession(sessionJson) {
    try {
        const session = JSON.parse(sessionJson);
        if (session && session.id && session.messages) {
            localStorage.setItem(session.id, JSON.stringify(session));
            cleanupOldSessions();
            return session.id;
        }
    } catch (e) {}
    return null;
}

export {
    saveSession,
    loadSession,
    deleteSession,
    listSessions,
    cleanupOldSessions,
    exportSession,
    importSession,
    getRecentChats,
    loadChat
};