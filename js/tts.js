console.log('tts.js module executed');
import { getSettings } from './settings.js';

let currentAudioElement = null;

export function interruptSpeech() {
    if (currentAudioElement && !currentAudioElement.paused) {
        currentAudioElement.pause();
        currentAudioElement.src = ''; // Detach the source
        currentAudioElement = null;
    }
}

export async function speakText(text) {
    const settings = getSettings();
    const { provider, apiKey, voiceId } = settings.tts || {};
    if (!apiKey) return;
    const audio = await generateSpeech(provider, apiKey, voiceId, text);
    if (audio) {
        interruptSpeech(); // Stop any previous audio
        currentAudioElement = new Audio(audio);
        currentAudioElement.play();
        currentAudioElement.onended = () => {
            currentAudioElement = null;
        };
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
            return URL.createObjectURL(await res.blob());
        },
        groq: async () => {
            const res = await fetch('https://api.groq.com/openai/v1/audio/speech', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: voiceId || 'tts-1',
                    input: text,
                    voice: 'alloy'
                })
            });
            return URL.createObjectURL(await res.blob());
        }
    };
    try {
        return await providers[provider]();
    } catch (err) {
        console.error('TTS Error:', err);
        return null;
    }
}