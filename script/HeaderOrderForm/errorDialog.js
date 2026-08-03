/**
 * Error Dialog Module
 * Displays validation error messages to users
 *
 * @module HeaderOrderForm/errorDialog
 */

// ===================================
// Configuration Constants
// ===================================

const CONFIG = {
    CLASSES: {
        CONTAINER: 'errorContainer',
        ANIMATION_IN: 'slide-in',
        ANIMATION_OUT: 'errordialog-slide-out',
    },
    TIMING: {
        CLOSE_ANIMATION: 1500, // ms for exit animation
        AUTO_REMOVE: 6000,     // ms before auto-removing if not manually closed
        AUTO_REMOVE_DELAY: 1500, // ms for animation after auto-remove starts
    },
    MESSAGES: {
        ERROR_TITLE: 'Missing Information',
        ERROR_TEXT: 'Please fill in all fields to place your order!',
    },
    CLOSE_BUTTON_SVG: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x h-4 w-4" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`,
};

// ===================================
// Global Variables
// ===================================

let autoRemoveTimer = null;
let isRemoving = false;

// ===================================
// Functions
// ===================================

/**
 * Show an error dialog in the specified parent element
 *
 * @param {HTMLElement} parentElement - The parent element to append the dialog to
 * @param {string} [title] - Custom error title (optional)
 * @param {string} [message] - Custom error message (optional)
 */
function showErrorDialog(parentElement, title = CONFIG.MESSAGES.ERROR_TITLE, message = CONFIG.MESSAGES.ERROR_TEXT) {
    if (!parentElement) {
        console.error('Parent element is required');
        return;
    }

    // Remove existing dialog if present
    const existingDialog = parentElement.querySelector(`.${CONFIG.CLASSES.CONTAINER}`);
    if (existingDialog) {
        existingDialog.remove();
    }

    // Create and show new dialog
    const dialog = createDialogElement(title, message);
    parentElement.appendChild(dialog);

    // Start auto-remove timer
    startAutoRemoveTimer(dialog);
}

/**
 * Create the error dialog DOM element
 *
 * @param {string} title - The error title
 * @param {string} message - The error message
 * @returns {HTMLElement} The dialog container
 */
function createDialogElement(title, message) {
    const container = document.createElement('div');
    container.className = `${CONFIG.CLASSES.CONTAINER} ${CONFIG.CLASSES.ANIMATION_IN}`;
    container.setAttribute('role', 'alert');
    container.setAttribute('aria-live', 'assertive');

    // Title
    const titleElement = document.createElement('h2');
    titleElement.textContent = title;

    // Message
    const messageElement = document.createElement('p');
    messageElement.textContent = message;

    // Close button
    const closeButton = createCloseButton(container);

    container.append(titleElement, messageElement, closeButton);
    return container;
}

/**
 * Create the close button for the dialog
 *
 * @param {HTMLElement} container - The dialog container
 * @returns {HTMLElement} The close button
 */
function createCloseButton(container) {
    const button = document.createElement('button');
    button.innerHTML = CONFIG.CLOSE_BUTTON_SVG;
    button.setAttribute('type', 'button');
    button.setAttribute('aria-label', 'Close error message');
    button.style.cursor = 'pointer';

    button.addEventListener('click', (event) => {
        event.stopPropagation();
        closeErrorDialog(container);
    });

    return button;
}

/**
 * Close the error dialog with animation
 *
 * @param {HTMLElement} dialog - The dialog to close
 */
function closeErrorDialog(dialog) {
    if (isRemoving) return;
    isRemoving = true;

    // Clear auto-remove timer
    if (autoRemoveTimer) {
        clearTimeout(autoRemoveTimer);
        autoRemoveTimer = null;
    }

    // Apply exit animation
    dialog.classList.remove(CONFIG.CLASSES.ANIMATION_IN);
    dialog.classList.add(CONFIG.CLASSES.ANIMATION_OUT);

    // Remove after animation
    setTimeout(() => {
        if (dialog.parentElement) {
            dialog.remove();
        }
        isRemoving = false;
    }, CONFIG.TIMING.CLOSE_ANIMATION);
}

/**
 * Start the auto-remove timer for the dialog
 *
 * @param {HTMLElement} dialog - The dialog element
 */
function startAutoRemoveTimer(dialog) {
    autoRemoveTimer = setTimeout(() => {
        if (dialog.parentElement && !isRemoving) {
            closeErrorDialog(dialog);
        }
    }, CONFIG.TIMING.AUTO_REMOVE);
}

// ===================================
// Module Export
// ===================================

/**
 * Error dialog function
 * @type {Function}
 */
export const errorDialog = showErrorDialog;

