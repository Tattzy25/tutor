import { getSystemPrompt } from './prompt.js';
import { getSettings } from './settings.js';
import { toggleVoiceActivation, stopVoiceActivation, startVoiceActivation } from './stt.js';
import { interruptSpeech, speakText } from './tts.js';
import { showAgeModal, hideAgeModal, setAgeVerified, isAgeVerified, setGuardianApproved, isGuardianApproved, clearAgeGateFlags } from './age-gate/index.js';
import { openMenu } from './menu_controls/openMenu.js';
import { closeMenu } from './menu_controls/closeMenu.js';
import { loadSession } from './menu_controls/loadSession.js';
import { newChat } from './menu_controls/newChat.js';
import { resetApp } from './menu_controls/resetApp.js';
import { saveSession, loadSession as loadSavedSession, deleteSession, listSessions, cleanupOldSessions, exportSession, importSession } from './session_manager/sessionManager.js';
import { setupUserProfile, getUserProfile } from './user_profile/userProfile.js';
import { initRecentChats } from './recent_chats/recent_chats.js';

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

setupUserProfile(userNameInput, userGradeInput, userDescriptionInput);

function saveSettings() { return; }

// Save session after each message
function saveCurrentSession() {
    const chatMessages = Array.from(document.querySelectorAll('#chatMessages .message')).map(div => ({
        role: div.classList.contains('user') ? 'user' : 'assistant',
        content: div.textContent
    }));
    const sessionName = `${userNameInput.value || 'User'} - ${new Date().toLocaleString()}`;
    saveSession(sessionName, chatMessages);
}
// Replace saveChatToCookie with saveCurrentSession in addMessage
function addMessage(content, isUser = false) {
    const container = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = `message ${isUser ? 'user' : 'assistant'}`;
    div.innerHTML = `<div class="message-content">${content}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    saveCurrentSession();
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
    const userProfile = getUserProfile(userNameInput, userGradeInput, userDescriptionInput);
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
            ...(provider === 'openrouter' && { 'HTTP-Referer': location.href, 'X-Title': 'AI Tutor' })
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

menuBtn.addEventListener('click', () => openMenu(menuOverlay));
closeMenuBtn.addEventListener('click', () => closeMenu(menuOverlay));

const newChatBtn = document.getElementById('newChatBtn');
newChatBtn.addEventListener('click', () => newChat(addMessage, menuOverlay));

document.addEventListener('DOMContentLoaded', initRecentChats);



// Age Verification Modal Logic is now handled by the modularized age-gate system.

document.addEventListener('transcription-complete', (e) => {
    const transcribedText = e.detail;
    if (transcribedText) {
        sendMessage(transcribedText);
    }
});

// Assessment Integration
import { generateAssessment, gradeAssessment } from './assessment.js';

let currentAssessment = null;
let currentQuestionIndex = 0;
let assessmentResults = null;

async function startAssessment() {
    const grade = userGradeInput.value;
    const description = userDescriptionInput.value || 'Math';
    currentAssessment = await generateAssessment(grade, description);
    currentQuestionIndex = 0;
    assessmentResults = null;
    showNextAssessmentQuestion();
}

function showNextAssessmentQuestion() {
    const question = currentAssessment.questions[currentQuestionIndex];
    if (!question) {
        finishAssessment();
        return;
    }
    // Render question UI (replace with your preferred UI framework or vanilla JS)
    const container = document.getElementById('assessmentContainer') || createAssessmentContainer();
    container.innerHTML = `<div class="assessment-question"><strong>Question ${currentQuestionIndex + 1}:</strong> ${question.text}</div>` +
        renderAssessmentInput(question) +
        `<button id="submitAssessmentAnswer">Submit</button>`;
    document.getElementById('submitAssessmentAnswer').onclick = () => {
        const answer = getAssessmentInputValue(question);
        currentAssessment.userAnswers[question.id] = answer;
        currentQuestionIndex++;
        showNextAssessmentQuestion();
    };
}

function finishAssessment() {
    assessmentResults = gradeAssessment(currentAssessment, currentAssessment.userAnswers);
    // Hide assessment UI
    const container = document.getElementById('assessmentContainer');
    if (container) container.remove();
    // Feed results into AI session (e.g., display summary, update profile, etc.)
    aiAssessmentText.textContent = `Assessment Complete! Score: ${assessmentResults.score}% (${assessmentResults.correctCount}/${assessmentResults.totalQuestions})`;
    // Optionally, trigger a welcome message or next phase
}

function createAssessmentContainer() {
    const container = document.createElement('div');
    container.id = 'assessmentContainer';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.background = 'rgba(255,255,255,0.98)';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    document.body.appendChild(container);
    return container;
}

function renderAssessmentInput(question) {
    switch (question.type) {
        case 'multiple-choice':
            return question.options.map((opt, i) => `<label><input type="radio" name="assessmentInput" value="${opt}"> ${opt}</label><br>`).join('');
        case 'true-false':
            return ['True', 'False'].map(opt => `<label><input type="radio" name="assessmentInput" value="${opt}"> ${opt}</label><br>`).join('');
        case 'short-answer':
        case 'mental-math':
        case 'game':
            return `<input type="text" id="assessmentInput" autocomplete="off">`;
        default:
            return '';
    }
}

function getAssessmentInputValue(question) {
    switch (question.type) {
        case 'multiple-choice':
        case 'true-false':
            const checked = document.querySelector('input[name="assessmentInput"]:checked');
            return checked ? checked.value : '';
        case 'short-answer':
        case 'mental-math':
        case 'game':
            return document.getElementById('assessmentInput').value;
        default:
            return '';
    }
}

// Trigger assessment after profile entry (e.g., after userDescriptionInput blur or a dedicated button)
userDescriptionInput.addEventListener('blur', () => {
    if (userNameInput.value && userGradeInput.value && userDescriptionInput.value) {
        startAssessment();
    }
});