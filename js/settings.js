// Function to fetch the API key from the serverless function
async function getApiKey() {
    try {
        const response = await fetch('/api/get-api-key');
        const data = await response.json();
        return data.apiKey;
    } catch (error) {
        console.error('Error fetching API key:', error);
        return null;
    }
}

// === INTERNAL SETTINGS: HARDCODED FOR INSTANT USE ===
let INTERNAL_SETTINGS = {};

// Initialize settings asynchronously
async function initializeSettings() {
    const apiKey = await getApiKey();
    INTERNAL_SETTINGS = {
        agent: {
            provider: "groq",
            apiKey: apiKey,
            model: "moonshotai/kimi-k2-instruct"
        },
        stt: {
            provider: "groq",
            apiKey: apiKey,
            model: "distil-whisper-large-v3-en",
            language: "en",
            endpoint: "https://api.groq.com/openai/v1/audio/transcriptions"
        },
        tts: {
            provider: "groq",
            apiKey: apiKey,
            voiceId: "Celeste-PlayAI",
            model: "playai-tts",
            endpoint: "https://api.groq.com/openai/v1/audio/speech"
        }
    };
}

// Initialize settings on load
initializeSettings();

export function getSettings() { return INTERNAL_SETTINGS; }