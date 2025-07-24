import {
  isAgeVerified,
  isGuardianApproved,
  showAgeModal,
  hideAgeModal,
  setAgeVerified,
  clearAgeGateFlags
} from './index.js';

export function initAgeGateListeners({ resetApp, userNameInput, userGradeInput, userDescriptionInput, aiAssessmentText, menuOverlay, addMessage }) {
  window.addEventListener('DOMContentLoaded', () => {
    if (!isAgeVerified() && !isGuardianApproved()) {
      showAgeModal();
      document.querySelectorAll('button, input, textarea').forEach(el => {
        if (!el.closest('#ageModal')) el.disabled = true;
      });
    } else {
      document.querySelectorAll('button, input, textarea').forEach(el => el.disabled = false);
    }
  });

  document.getElementById('ageYesBtn').onclick = () => {
    setAgeVerified();
    hideAgeModal();
    document.querySelectorAll('button, input, textarea').forEach(el => el.disabled = false);
  };

  document.getElementById('ageNoBtn').onclick = () => {
    document.getElementById('ageModalMsg').textContent =
      'You must be 13 or older to use this app. If you have guardian approval, please ask them to continue.';
  };

  const resetAppBtn = document.getElementById('resetAppBtn');
  if (resetAppBtn) {
    resetAppBtn.addEventListener('click', () => {
      resetApp(userNameInput, userGradeInput, userDescriptionInput, aiAssessmentText, menuOverlay, addMessage, clearAgeGateFlags, () => {
        showAgeModal();
        document.querySelectorAll('button, input, textarea').forEach(el => {
          if (!el.closest('#ageModal')) el.disabled = true;
        });
      });
    });
  }
}