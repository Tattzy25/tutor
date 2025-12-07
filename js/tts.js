import { getSettings } from './settings.js';

let currentAudioElement = null;
let currentBlobUrl = null;

export function interruptSpeech() {
    if (currentAudioElement) {
        if (!currentAudioElement.paused) {
            currentAudioElement.pause();
        }
        currentAudioElement.src = '';
        currentAudioElement = null;
    }
    if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
        currentBlobUrl = null;
    }
}

export async function speakText(text) {
    const settings = getSettings();
    const { provider, apiKey, voiceId } = settings.tts || {};
    
    if (!apiKey) {
        console.warn('TTS: No API key configured');
        return;
    }
    
    if (!text || text.trim().length === 0) {
        console.warn('TTS: No text to speak');
        return;
    }
    
    try {
        const audioBlobUrl = await generateSpeech(provider, apiKey, voiceId, text);
        if (audioBlobUrl) {
            interruptSpeech(); // Stop any previous audio and revoke old URL
            currentBlobUrl = audioBlobUrl;
            currentAudioElement = new Audio(audioBlobUrl);
            
            currentAudioElement.onerror = (e) => {
                console.error('TTS Audio playback error:', e);
                interruptSpeech();
            };
            
            currentAudioElement.onended = () => {
                interruptSpeech();
            };
            
            await currentAudioElement.play();
            console.log('TTS: Audio playing');
        }
    } catch (err) {
        console.error('TTS: Error in speakText:', err);
    }
}

async function generateSpeech(provider, key, voiceId, text) {
    const providers = {
        elevenlabs: async () => {
            const ttsSettings = getSettings().tts;
            const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ttsSettings.voiceId || 'tnSpp4vdxKPjI9w0GnoV'}`, {
                method: 'POST',
                headers: {
                    'xi-api-key': key,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text, model_id: ttsSettings.model || 'eleven_flash_v2_5' })
            });
            if (!res.ok) throw new Error(`ElevenLabs TTS error: ${res.status} ${res.statusText}`);
            return URL.createObjectURL(await res.blob());
        },
        deepgram: async () => {
            const res = await fetch(`https://api.deepgram.com/v1/speak?model=${voiceId || 'aura-asteria-en'}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${key}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });
            if (!res.ok) throw new Error(`Deepgram TTS error: ${res.status} ${res.statusText}`);
            return URL.createObjectURL(await res.blob());
        },
        groq: async () => {
            const ttsSettings = getSettings().tts;
            console.log('TTS: Calling GROQ API', { endpoint: ttsSettings.endpoint, model: ttsSettings.model, voice: ttsSettings.voiceId });
            const res = await fetch(ttsSettings.endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: ttsSettings.model,
                    input: text,
                    voice: ttsSettings.voiceId
                })
            });
            if (!res.ok) {
                const errorText = await res.text();
                console.error('TTS: GROQ API error response:', errorText);
                throw new Error(`GROQ TTS error: ${res.status} ${res.statusText}`);
            }
            const blob = await res.blob();
            console.log('TTS: Received audio blob', { size: blob.size, type: blob.type });
            return URL.createObjectURL(blob);
        }
    };
    try {
        if (!providers[provider]) {
            throw new Error(`Unknown TTS provider: ${provider}`);
        }
        return await providers[provider]();
    } catch (err) {
        console.error('TTS: generateSpeech error:', err);
        return null;
    }
}