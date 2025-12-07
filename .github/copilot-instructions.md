# Math Tutor AI - Copilot Instructions

## Repository Overview

**Math Tutor AI** is a voice-enabled, interactive AI math tutor web application designed for students (13+). It provides real-time tutoring using AI (via GROQ API), voice input (Speech-to-Text via GROQ Whisper), and voice output (Text-to-Speech via GROQ TTS).

- **Type**: Static web application (HTML/CSS/JavaScript ES6 modules)
- **Deployment**: Vercel serverless platform
- **Target Runtime**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Size**: Small (~20 files, primarily JavaScript modules)
- **Languages**: JavaScript (ES6 modules), HTML5, CSS3
- **No Build System**: Direct file serving, no compilation/bundling required

## Architecture & File Structure

### Root Files
- `tutor.html` - Main HTML entry point with embedded CSS
- `vercel.json` - Vercel deployment configuration
- `.env` - Environment variables (contains GROQ_API_KEY)
- `.gitignore` - Git ignore rules
- `audit` - Comprehensive code audit document with issues and recommendations

### Directory Structure

```
/api/
  get-api-key.js          # Serverless function to securely fetch GROQ_API_KEY

/js/
  app.js                  # Main application logic, message handling, API calls
  settings.js             # Settings management, API key fetching
  stt.js                  # Speech-to-Text (GROQ Whisper integration)
  tts.js                  # Text-to-Speech (GROQ TTS integration)
  prompt.js               # System prompt generation for AI tutor
  assessment.js           # Assessment generation and grading logic
  
  /age-gate/
    index.js              # Age verification state management
    initListeners.js      # Age gate event listeners
  
  /grades/
    4th-grade-math.js through 12th-grade-math.js  # Grade-specific prompts
  
  /menu_controls/
    openMenu.js           # Menu overlay opening logic
    closeMenu.js          # Menu overlay closing logic
    loadSession.js        # Session loading logic
    newChat.js            # New chat initialization
    resetApp.js           # App reset functionality
  
  /recent_chats/
    recent_chats.js       # Recent chats management
    recent_chats.css      # Recent chats styling
    recent_chats.html     # Recent chats HTML template
  
  /session_manager/
    sessionManager.js     # Session save/load/delete operations
  
  /user_profile/
    userProfile.js        # User profile management
```

## Build, Test, and Run

### Prerequisites
- **No build tools required** - This is a static web application
- Modern web browser with ES6 module support
- Python 3 (for local development server) OR any static file server

### Local Development

**ALWAYS** use a local web server (never open HTML files directly):

```bash
# Navigate to repository root
cd /home/runner/work/tutor/tutor

# Start Python HTTP server (recommended)
python3 -m http.server 8080

# Access at: http://localhost:8080/tutor.html
```

**Alternative servers:**
```bash
# Node.js http-server (if installed)
npx http-server -p 8080

# PHP built-in server
php -S localhost:8080
```

⚠️ **IMPORTANT**: The app MUST be served via HTTP server due to:
- ES6 module imports (require HTTP/HTTPS protocol)
- API endpoint calls to `/api/get-api-key`
- Browser security restrictions (CORS)

### Testing
- **No automated tests** - Manual testing only
- Test checklist:
  1. Age gate modal appears on first load
  2. User profile saves to localStorage
  3. Text message send/receive works
  4. Voice input (STT) records and transcribes
  5. Voice output (TTS) plays audio responses
  6. Chat messages display correctly
  7. Session save/load functions
  8. Mobile responsive layout works

### Deployment

The app is deployed on **Vercel**:

```bash
# Deployment is handled automatically via Git push
# Vercel reads vercel.json for configuration
```

**Environment Variable Required:**
- Set `GROQ_API_KEY` in Vercel dashboard environment variables
- Maps to `@groq_api_key` in vercel.json

## Key Configuration Files

### API Configuration (`js/settings.js`)
```javascript
// Hardcoded settings - fetches API key from serverless function
INTERNAL_SETTINGS = {
  agent: {
    provider: "groq",
    model: "moonshotai/kimi-k2-instruct"
  },
  stt: {
    provider: "groq",
    model: "distil-whisper-large-v3-en",
    endpoint: "https://api.groq.com/openai/v1/audio/transcriptions"
  },
  tts: {
    provider: "groq",
    model: "playai-tts",
    voiceId: "Celeste-PlayAI",
    endpoint: "https://api.groq.com/openai/v1/audio/speech"
  }
}
```

### Vercel Configuration (`vercel.json`)
```json
{
  "env": {
    "GROQ_API_KEY": "@groq_api_key"
  }
}
```

## Known Issues & Workarounds

### Critical Issues (from audit document)

1. **Textarea Overflow** - Long text breaks container, no scroll
   - Symptom: Text extends beyond visible area horizontally
   - Fix: Add `word-wrap: break-word; overflow-wrap: break-word;` to `.chat-input`

2. **Mobile Responsiveness** - Layout not fully mobile-first
   - Current breakpoints: 900px and 600px
   - Fix: Ensure all elements scale properly on mobile devices

3. **TTS Not Working** - GROQ TTS may not play audio
   - Check: `speakText()` in `tts.js` creates Audio element correctly
   - Verify: API endpoint and authentication in settings

4. **STT Not Transcribing** - Voice input may not transcribe
   - Check: Microphone permissions granted
   - Verify: MediaRecorder and GROQ Whisper API integration
   - Debug: Console logs in `processAudio()` function

5. **Session Management** - Only single session saved
   - Current: Uses cookies/localStorage for one session
   - Limitation: "Recent Chats" UI not fully functional

6. **No Conversation Context** - AI doesn't remember past messages
   - Current: Each API call sends only system prompt + latest user message
   - Fix: Include message history in `generateResponse()` API call

7. **Assessment Not Triggered** - Initial assessment never runs
   - `assessment.js` exists but not invoked
   - Decision: Implement or remove assessment functionality

### Security Considerations

- **API Key Exposure**: GROQ_API_KEY fetched via serverless function (good)
- **XSS Risk**: Chat saves raw innerHTML to storage - sanitize or store as JSON
- **Cookie Limitations**: Chat history in cookies limited to ~4KB
- **Recommendation**: Migrate to localStorage with JSON serialization

## Development Workflow

### Making Changes

1. **Before editing**:
   ```bash
   # Check current state
   cd /home/runner/work/tutor/tutor
   git status
   ```

2. **Start local server**:
   ```bash
   python3 -m http.server 8080 &
   # Access at http://localhost:8080/tutor.html
   ```

3. **Edit files** - All files are plain JavaScript/HTML/CSS, no compilation needed

4. **Test changes** - Reload browser (Ctrl+Shift+R for hard refresh)

5. **Common issues**:
   - Module not loading: Check browser console for CORS errors
   - API key error: Verify `/api/get-api-key` returns valid key
   - Voice not working: Check browser permissions for microphone

### Debugging

**Browser Console** - Check for:
- Module import errors
- API call failures
- Permission denied errors (microphone/audio)

**Key Debug Points**:
```javascript
// STT debugging
console.log("toggleVoiceActivation called");  // In stt.js
console.log("startVoiceActivation called");   // In stt.js

// TTS debugging
console.log('tts.js module executed');        // In tts.js

// API debugging
// Check Network tab for API calls to GROQ endpoints
```

## Code Conventions

### Module System
- **ES6 modules** - All `.js` files in `/js/` use `import`/`export`
- **Type**: Add `type="module"` in HTML script tags
- **Imports**: Use relative paths (e.g., `./settings.js`)

### Styling
- **Embedded CSS** - All styles in `<style>` tag in `tutor.html`
- **CSS Variables** - Uses CSS custom properties for theming
- **Mobile-first** - Media queries for responsive design

### State Management
- **localStorage** - User profile, sessions
- **Module state** - Voice activation, audio playback state
- **No framework** - Vanilla JavaScript with event listeners

### API Integration
- **Fetch API** - For all HTTP requests
- **Async/await** - Modern promise handling
- **Error handling** - Try/catch blocks with user feedback

## Production Checklist

Before deploying or marking as production-ready:

- [ ] Fix textarea overflow issue (word-wrap, max-width)
- [ ] Verify mobile responsive layout on multiple devices
- [ ] Test TTS audio playback end-to-end
- [ ] Test STT recording and transcription end-to-end
- [ ] Verify age gate appears correctly
- [ ] Test session save/load functionality
- [ ] Add conversation context to AI calls
- [ ] Remove or implement assessment feature
- [ ] Clean up console.log statements
- [ ] Verify all ES6 imports work
- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Verify microphone permissions on mobile
- [ ] Check audio playback on iOS Safari
- [ ] Verify no console errors on load

## API Endpoints

### GROQ API
- **Base URL**: `https://api.groq.com`
- **Chat**: `/openai/v1/chat/completions`
- **STT**: `/openai/v1/audio/transcriptions`
- **TTS**: `/openai/v1/audio/speech`
- **Auth**: Bearer token with GROQ_API_KEY

### Models Used
- **Chat**: `moonshotai/kimi-k2-instruct`
- **STT**: `distil-whisper-large-v3-en`
- **TTS**: `playai-tts` with voice `Celeste-PlayAI`

## Voice Features

### Speech-to-Text (STT)
- Uses GROQ Whisper API
- Records audio via MediaRecorder
- Voice Activity Detection (VAD) via audio analysis
- Transcription sent via custom event `transcription-complete`

### Text-to-Speech (TTS)
- Uses GROQ TTS API
- Fetches audio blob from API
- Plays via HTML5 Audio element
- Supports interruption for new speech

### Voice Workflow
1. User clicks microphone button
2. VAD detects speech start
3. Records audio chunks
4. Detects silence (2 seconds)
5. Sends audio to GROQ Whisper
6. Transcription appears in chat input
7. Auto-sends message to AI
8. AI response spoken via TTS

## Important Notes

- **No package.json** - No npm dependencies
- **No build step** - Direct file serving
- **No linting configured** - Manual code review
- **No CI/CD pipeline** - Manual deployment via Vercel Git integration
- **Free tier** - GROQ API usage, no authentication required for users
- **localStorage only** - No backend database
- **Client-side only** - All processing in browser except API calls

## Search Before Exploring

**Trust these instructions first.** Only search/explore if:
- Specific error message needs investigation
- New feature requires understanding unlisted code
- Debugging requires seeing actual implementation

Common searches to avoid:
- ❌ "How to start the app" → Use Python server command above
- ❌ "Where is the config" → See settings.js section above
- ❌ "How to test" → Follow testing checklist above
- ❌ "What's the architecture" → See Architecture section above

**When you must search:**
```bash
# Find specific function usage
grep -r "functionName" /home/runner/work/tutor/tutor/js/

# Find file containing text
find /home/runner/work/tutor/tutor -name "*.js" -exec grep -l "searchTerm" {} \;
```

## Quick Reference

**Start Server**: `python3 -m http.server 8080`  
**Main Entry**: `tutor.html`  
**Core Logic**: `js/app.js`  
**Voice Input**: `js/stt.js`  
**Voice Output**: `js/tts.js`  
**API Config**: `js/settings.js`  
**Environment**: `.env` (local) or Vercel dashboard (production)
