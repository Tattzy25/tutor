// js/menu_controls/openMenu.js
import { resetApp } from './resetApp.js';
import { clearAgeGateFlags, showAgeModal } from '../age-gate/index.js';

export async function openMenu(menuOverlay) {
    menuOverlay.style.display = 'flex';

    const placeholder = document.getElementById('reset-button-placeholder');
    if (placeholder.innerHTML.trim() === '') { // Load only if it's not already loaded
        try {
            const response = await fetch('buttons/ResetButton.html?v=1.5');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            placeholder.innerHTML = html;

            // Now that the button is in the DOM, add the event listener
            const resetAppBtn = document.getElementById('resetAppBtn');
            if (resetAppBtn) {
                // Get all the elements needed for resetApp
                const userNameInput = document.getElementById('userName');
                const userGradeInput = document.getElementById('userGrade');
                const userDescriptionInput = document.getElementById('userDescription');
                const aiAssessmentText = document.getElementById('aiAssessmentText');
                
                const simpleAddMessage = (content, isUser = false) => {
                    const container = document.getElementById('chatMessages');
                    const div = document.createElement('div');
                    div.className = `message ${isUser ? 'user' : 'assistant'}`;
                    div.innerHTML = `<div class="message-content">${content}</div>`;
                    container.appendChild(div);
                    container.scrollTop = container.scrollHeight;
                };

                resetAppBtn.addEventListener('click', () => {
                    resetApp(
                        userNameInput,
                        userGradeInput,
                        userDescriptionInput,
                        aiAssessmentText,
                        menuOverlay,
                        simpleAddMessage, // Using the simplified version
                        clearAgeGateFlags,
                        showAgeModal
                    );
                });
            }
        } catch (error) {
            console.error('Failed to load reset button:', error);
            placeholder.innerHTML = '<p style="color: red;">Error loading reset button.</p>';
        }
    }
}