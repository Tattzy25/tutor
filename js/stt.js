import { getSettings } from './settings.js';
import { interruptSpeech } from './tts.js';

export let isListening = false;
export let mediaRecorder = null;
export let audioChunks = [];
export let recognition = null; // For Web Speech API
export let vadStream = null;
export let silenceTimer = null;
export let isSpeaking = false;
export let audioContext = null;

export function setupVAD(stream) {
    vadStream = stream; // Store the stream to be able to stop it
    if (!audioContext) audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    source.connect(analyser);

    function detectSpeech() {
        if (!vadStream) return; // Stop if VAD is deactivated
        analyser.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            const x = (dataArray[i] / 128.0) - 1.0;
            sum += x * x;
        }
        const rms = Math.sqrt(sum / bufferLength);

        const VAD_SENSITIVITY = 0.02; // Lower is more sensitive
        const SPEECH_END_SILENCE_DURATION_MS = 2000;

        if (rms > VAD_SENSITIVITY) { // Speaking detected
            if (!isSpeaking) {
                isSpeaking = true;
                interruptSpeech(); // Interrupt agent if it's talking
                if (!isListening) startRecording(stream); // Start recording if not already
            }
            clearTimeout(silenceTimer);
            silenceTimer = setTimeout(() => {
                if (isListening) stopRecording();
                isSpeaking = false;
            }, SPEECH_END_SILENCE_DURATION_MS);
        } 
        requestAnimationFrame(detectSpeech);
    }
    detectSpeech();
}

export function stopVoiceActivation() {
    if (vadStream) {
        vadStream.getTracks().forEach(track => track.stop());
        vadStream = null;
    }
    if (isListening) {
        stopRecording();
    }
    if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().then(() => { audioContext = null; });
    }
    document.getElementById('voiceBtn').classList.remove('active', 'listening');
    isListening = false;
    isSpeaking = false;
    clearTimeout(silenceTimer);
}

export function toggleVoiceActivation() {
    console.log("toggleVoiceActivation called");
    if (document.getElementById('voiceBtn').classList.contains('active')) {
        stopVoiceActivation();
    } else {
        startVoiceActivation();
    }
}

export async function startVoiceActivation() {
    console.log("startVoiceActivation called");
     try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        document.getElementById('voiceBtn').classList.add('active');
        setupVAD(stream);
    } catch (err) {
        console.error("Error in startVoiceActivation:", err);
        alert('Microphone access denied. Please enable microphone access to use voice input.');
        document.getElementById('voiceBtn').classList.remove('active');
    }
}

export function startRecording(stream) {
    const settings = getSettings();
    const provider = settings.stt?.provider || 'groq';
    const apiKey = settings.stt?.apiKey;
    if (!apiKey) return alert('Please configure STT API key');

    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstop = () => processAudio(provider, apiKey);
    mediaRecorder.start();
    isListening = true;
    document.getElementById('voiceBtn').classList.add('listening');
}

export function stopRecording() {
    if (mediaRecorder) mediaRecorder.stop();
    isListening = false;
    document.getElementById('voiceBtn').classList.remove('listening');
}

export async function processAudio(provider, apiKey) {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    const arrayBuffer = await audioBlob.arrayBuffer();
    const providers = {
        groq: () => transcribeGroq(arrayBuffer, apiKey),
        deepgram: () => transcribeDeepgram(arrayBuffer, apiKey),
        elevenlabs: () => transcribeElevenLabs(arrayBuffer, apiKey)
    };
    try {
        const text = await providers[provider]();
        document.getElementById('chatInput').value = text;
        // Dispatch a custom event with the transcription
        const event = new CustomEvent('transcription-complete', { detail: text });
        document.dispatchEvent(event);
    } catch (err) {
        alert(`STT Error: ${err.message}`);
    }
    document.getElementById('voiceBtn').classList.remove('listening');
    isListening = false;
}

export async function transcribeGroq(audio, key) {
    const formData = new FormData();
    formData.append('file', new Blob([audio], { type: 'audio/webm' }), 'audio.webm');
    formData.append('model', 'whisper-large-v3');
    formData.append('language', getSettings().stt?.language || 'en');
    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}` },
        body: formData
    });
    const data = await res.json();
    return data.text;
}

export async function transcribeDeepgram(audio, key) {
    const res = await fetch('https://api.deepgram.com/v1/listen', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${key}`,
            'Content-Type': 'audio/webm'
        },
        body: audio
    });
    const data = await res.json();
    return data.results.channels[0].alternatives[0].transcript;
}

export async function transcribeElevenLabs(audio, key) {
    const formData = new FormData();
    formData.append('file', new Blob([audio], { type: 'audio/webm' }));
    formData.append('model_id', getSettings().stt?.model || 'scribe_v1_experimental');
    const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: { 'xi-api-key': key },
        body: formData
    });
    const data = await res.json();
    return data.text;
}