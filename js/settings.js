// === INTERNAL SETTINGS: HARDCODED FOR INSTANT USE ===
const INTERNAL_SETTINGS = {
    agent: {
        provider: "groq",
        apiKey: "YOUR API KEY HERE",
        model: "moonshotai/kimi-k2-instruct"
    },
    stt: {
        provider: "elevenlabs",
        apiKey: "YOUR API KEY HERE",
        model: "scribe_v1_experimental",
        language: "en"
    },
    tts: {
        provider: "elevenlabs",
        apiKey: "YOUR API KEY HERE ",
        voiceId: "tnSpp4vdxKPjI9w0GnoV",
        model: "eleven_flash_v2_5"
    }
};

export function getSettings() { return INTERNAL_SETTINGS; }