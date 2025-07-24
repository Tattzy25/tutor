// js/menu_controls/resetApp.js
export function resetApp(userNameInput, userGradeInput, userDescriptionInput, aiAssessmentText, menuOverlay, addMessage, clearAgeGateFlags, showAgeModal) {
    userNameInput.value = '';
    userGradeInput.value = '';
    userDescriptionInput.value = '';
    aiAssessmentText.textContent = 'The AI will provide an assessment of your progress here.';
    document.cookie = "userProfile=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "chatHistory=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';
    addMessage("Hello! I'm your AI Math Tutor. Ask me any math question or use voice input!", false);
    menuOverlay.style.display = 'none';
    localStorage.removeItem('ageVerified');
    document.cookie = "ageVerified=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    clearAgeGateFlags();
    showAgeModal();
}