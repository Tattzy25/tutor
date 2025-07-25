// User Profile Module

/**
 * Sets up user profile event listeners and loads profile from cookie.
 * @param {HTMLInputElement} userNameInput
 * @param {HTMLInputElement} userGradeInput
 * @param {HTMLTextAreaElement} userDescriptionInput
 */
export function setupUserProfile(userNameInput, userGradeInput, userDescriptionInput) {
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
}

/**
 * Returns the current user profile from the DOM.
 * @param {HTMLInputElement} userNameInput
 * @param {HTMLInputElement} userGradeInput
 * @param {HTMLTextAreaElement} userDescriptionInput
 * @returns {{name: string, grade: string, description: string}}
 */
export function getUserProfile(userNameInput, userGradeInput, userDescriptionInput) {
    return {
        name: userNameInput.value,
        grade: userGradeInput.value,
        description: userDescriptionInput.value
    };
}