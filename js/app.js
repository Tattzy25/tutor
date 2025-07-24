import { getSystemPrompt } from './prompt.js';
import { getSettings } from './settings.js';
import { toggleVoiceActivation, stopVoiceActivation, startVoiceActivation } from './stt.js';
import { interruptSpeech, speakText } from './tts.js';

const menuBtn = document.getElementById('menuBtn');
const closeMenuBtn = document.getElementById('closeMenuBtn');
const menuOverlay = document.getElementById('menuOverlay');
const loadSessionBtn = document.getElementById('loadSessionBtn');
let isVoiceModeActive = false;

// User Profile Elements
const userNameInput = document.getElementById('userName');
const userGradeInput = document.getElementById('userGrade');
const userDescriptionInput = document.getElementById('userDescription');
const aiAssessmentText = document.getElementById('aiAssessmentText');

function saveUserProfile() {
    const userProfile = {
        name: userNameInput.value,
        grade: userGradeInput.value,
        description: userDescriptionInput.value
    };
    document.cookie = `userProfile=${JSON.stringify(userProfile)};path=/;max-age=31536000`;
}

function loadUserProfile() {
    const cookies = document.cookie.split(';');
    const profileCookie = cookies.find(c => c.trim().startsWith('userProfile='));
    if (profileCookie) {
        const profile = JSON.parse(profileCookie.split('=')[1]);
        userNameInput.value = profile.name || '';
        userGradeInput.value = profile.grade || '';
        userDescriptionInput.value = profile.description || '';
    }
}

userNameInput.addEventListener('input', saveUserProfile);
userGradeInput.addEventListener('input', saveUserProfile);
userDescriptionInput.addEventListener('input', saveUserProfile);

document.addEventListener('DOMContentLoaded', loadUserProfile);

function saveSettings() { return; }
function addMessage(content, isUser = false) {
     const container = document.getElementById('chatMessages');
     const div = document.createElement('div');
     div.className = `message ${isUser ? 'user' : 'assistant'}`;
     div.innerHTML = `<div class="message-content">${content}</div>`;
     container.appendChild(div);
     container.scrollTop = container.scrollHeight;
     saveChatToCookie(); // Auto-save after each message
 }


export async function sendMessage(textFromSTT = null) {
    interruptSpeech();
    const input = document.getElementById('chatInput');
    const text = textFromSTT || input.value.trim();

    if (!text) return;

    // If the message is from text input, deactivate voice mode.
    if (!textFromSTT) {
        isVoiceModeActive = false;
        stopVoiceActivation();
    }

    addMessage(text, true);
    input.value = '';
    const loading = document.createElement('div');
    loading.className = 'message assistant';
    loading.innerHTML = '<div class="message-content"><div class="loading-spinner"></div> Thinking...</div>';
    document.getElementById('chatMessages').appendChild(loading);

    try {
        const response = await generateResponse(text);
        loading.remove();
        addMessage(response);
        await speakText(response);

        // After TTS is finished, if voice mode is still active, start listening again.
        if (isVoiceModeActive) {
            startVoiceActivation();
        }

    } catch (err) {
        loading.remove();
        addMessage(`Error: ${err.message}`);
    }
}

async function generateResponse(message) {
    const userProfile = {
        name: userNameInput.value,
        grade: userGradeInput.value,
        description: userDescriptionInput.value
    };
    const systemPrompt = getSystemPrompt(userProfile);

    const settings = getSettings();
    const { provider, apiKey, model } = settings.agent || {};
    if (!apiKey) throw new Error('Please configure your API key');
    const endpoints = {
        groq: 'https://api.groq.com/openai/v1/chat/completions',
        openai: 'https://api.openai.com/v1/chat/completions',
        openrouter: 'https://openrouter.ai/api/v1/chat/completions'
    };
    const res = await fetch(endpoints[provider], {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            ...(provider === 'openrouter' && { 'HTTP-Referer': location.href, 'X-Title': 'Math Tutor' })
        },
        body: JSON.stringify({
            model: model || 'llama3-8b-8192',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ]
        })
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    const data = await res.json();
    return data.choices[0].message.content;
}
const voiceBtn = document.getElementById('voiceBtn');
const sendBtn = document.getElementById('sendBtn');
const chatInput = document.getElementById('chatInput');

voiceBtn.addEventListener('click', () => {
    isVoiceModeActive = !isVoiceModeActive;
    toggleVoiceActivation();
});
sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

menuBtn.addEventListener('click', () => menuOverlay.style.display = 'flex');
closeMenuBtn.addEventListener('click', () => menuOverlay.style.display = 'none');
loadSessionBtn.addEventListener('click', () => {
    loadChatFromCookie();
    menuOverlay.style.display = 'none';
});
const newChatBtn = document.getElementById('newChatBtn');
newChatBtn.addEventListener('click', startNewChat);

// Listen for the custom event from stt.js
document.addEventListener('transcription-complete', (e) => {
    const transcribedText = e.detail;
    if (transcribedText) {
        sendMessage(transcribedText);
    }
});





function startNewChat() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';
    // Clear the cookie by setting an empty value and past expiry
    document.cookie = "chatHistory=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    addMessage("Hello! I'm your AI Math Tutor. Ask me any math question or use voice input!", false);
}