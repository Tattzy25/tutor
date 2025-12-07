// Simple logging utility for production
// Set DEBUG = false in production to disable logs

const DEBUG = true; // Set to false in production

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
