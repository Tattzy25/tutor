// js/assessment.js

/**
 * @file Manages the creation, administration, and scoring of dynamic assessments.
 * @author ANUSH
 */

/**
 * Generates a dynamic assessment based on the user's grade level and a specific subject or description.
 * This function dynamically imports a set of questions from a JS module tailored to the user's grade.
 *
 * @param {string} grade - The user's grade level (e.g., '5th Grade', '6th Grade', etc.).
 * @param {string} description - A short description of the subject for the assessment (e.g., 'Math').
 * @returns {Promise<object>} A promise that resolves to an assessment object containing the questions and structure.
 */
async function generateAssessment(grade, description) {
    let questions = [];
    let gradeKey = grade.toLowerCase().replace(/\s/g, '-').replace('th-', 'th-').replace('grade', 'grade');
    if (gradeKey === '4th-grade') {
        questions = (await import('./grades/4th-grade-math.js')).default;
    } else if (gradeKey === '5th-grade') {
        questions = (await import('./grades/5th-grade-math.js')).default;
    } else if (gradeKey === '6th-grade') {
        questions = (await import('./grades/6th-grade-math.js')).default;
    } else if (gradeKey === '7th-grade') {
        questions = (await import('./grades/7th-grade-math.js')).default;
    } else if (gradeKey === '8th-grade') {
        questions = (await import('./grades/8th-grade-math.js')).default;
    } else if (gradeKey === '9th-grade') {
        questions = (await import('./grades/9th-grade-math.js')).default;
    } else if (gradeKey === '10th-grade') {
        questions = (await import('./grades/10th-grade-math.js')).default;
    } else if (gradeKey === '11th-grade') {
        questions = (await import('./grades/11th-grade-math.js')).default;
    } else if (gradeKey === '12th-grade') {
        questions = (await import('./grades/12th-grade-math.js')).default;
    }
    if (description && description.toLowerCase() !== 'math') {
        questions = questions.filter(q => q.subject && q.subject.toLowerCase() === description.toLowerCase());
    }
    const assessment = {
        id: `asmt-${Date.now()}`,
        grade: grade,
        subject: description,
        questions: questions,
        userAnswers: {}
    };
    return assessment;
}

/**
 * Saves the user's answers for a given assessment.
 * This would typically send the results to a backend for storage and analysis.
 *
 * @param {string} assessmentId - The ID of the assessment being answered.
 * @param {object} answers - An object containing the user's answers, with question IDs as keys.
 * @returns {boolean} True if the results were saved successfully, false otherwise.
 */
function saveAssessmentResult(assessmentId, answers) {
    // In a production environment, this would send results to a secure backend.
    // Example: fetch('/api/assessment/save', { method: 'POST', body: JSON.stringify({ assessmentId, answers }) });
    return true; // Assume success for this simulation.
}

/**
 * Grades the assessment based on the user's answers.
 * @param {object} assessment - The assessment object, including questions and correct answers.
 * @param {object} userAnswers - The user's submitted answers.
 * @returns {object} An object containing the score and a summary of correct/incorrect answers.
 */
function gradeAssessment(assessment, userAnswers) {
    let correctCount = 0;
    const results = {};

    assessment.questions.forEach(question => {
        const userAnswer = userAnswers[question.id];
        let isCorrect = false;

        switch (question.type) {
            case 'multiple-choice':
            case 'short-answer':
            case 'true-false':
            case 'mental-math':
                isCorrect = userAnswer === question.correctAnswer;
                break;
            case 'game':
                if (question.gameType === 'guess-my-number') {
                    // The user's guess is compared to the correct number.
                    // Both are treated as numbers for a correct comparison.
                    isCorrect = parseInt(userAnswer, 10) === question.correctAnswer;
                }
                break;
        }

        if (isCorrect) {
            correctCount++;
        }
        results[question.id] = {
            userAnswer: userAnswer,
            correct: isCorrect
        };
    });

    const score = (correctCount / assessment.questions.length) * 100;

    return {
        score: score.toFixed(2),
        correctCount: correctCount,
        totalQuestions: assessment.questions.length,
        results: results
    };
}

// Exporting the functions to be used by other modules, such as app.js
export { generateAssessment, saveAssessmentResult, gradeAssessment };