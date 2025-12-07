// Simple logging utility for production
// To disable logs in production: Change DEBUG to false before deployment
// For Vercel: Set environment variable DEBUG_LOGS=false and read from process.env

const DEBUG = false; // PRODUCTION: Set to false to disable debug logs

export const logger = {
    log: (...args) => {
        if (DEBUG) console.log(...args);
    },
    warn: (...args) => {
        if (DEBUG) console.warn(...args);
    },
    error: (...args) => {
        // Always log errors
        console.error(...args);
    }
};
