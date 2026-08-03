/**
 * Remove Dialog Utility Module
 *
 * @module utility/removeDialog
 *
 * This module provides a generic helper to auto-remove dialog elements with animation.
 * It is still usable in procedural code paths and preserves lightweight behavior for small dialogs.
 */

/**
 * Auto-remove a dialog element after a delay
 *
 * @param {HTMLElement} dialog - The dialog element to remove
 * @param {number} [delay=6000] - Delay before removing (ms)
 * @param {number} [animationDuration=1500] - Animation duration (ms)
 */
export function removeDialog(dialog, delay = 6000, animationDuration = 1500) {
    console.warn('removeDialog() is deprecated. Use ErrorDialogManager or OrderConfirmationManager instead.');
    
    if (!dialog) {
        console.error('Dialog element is required');
        return;
    }

    setTimeout(() => {
        if (dialog && dialog.parentElement) {
            dialog.style.animationName = 'errordialog-slide-out';
            setTimeout(() => {
                if (dialog && dialog.parentElement) {
                    dialog.remove();
                }
            }, animationDuration);
        }
    }, delay);
}
