// Age Gate Module: Handles age verification modal logic and flow

export function showAgeModal() {
    const ageModal = document.getElementById('ageModal');
    ageModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

export function hideAgeModal() {
    const ageModal = document.getElementById('ageModal');
    ageModal.style.display = 'none';
    document.body.style.overflow = '';
}

export function setAgeVerified() {
    localStorage.setItem('ageVerified', 'true');
    document.cookie = "ageVerified=true;path=/;max-age=31536000";
}

export function isAgeVerified() {
    return localStorage.getItem('ageVerified') === 'true' || document.cookie.includes('ageVerified=true');
}

export function setGuardianApproved() {
    localStorage.setItem('guardianApproved', 'true');
    document.cookie = "guardianApproved=true;path=/;max-age=31536000";
}

export function isGuardianApproved() {
    return localStorage.getItem('guardianApproved') === 'true' || document.cookie.includes('guardianApproved=true');
}

export function clearAgeGateFlags() {
    localStorage.removeItem('ageVerified');
    localStorage.removeItem('guardianApproved');
    document.cookie = "ageVerified=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "guardianApproved=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}