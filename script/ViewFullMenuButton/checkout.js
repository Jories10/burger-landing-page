/**
 * Checkout Module
 * Handles checkout button interactions and cart workflow
 *
 * @module ViewFullMenuButton/checkout
 */

const CONFIG = {
    SELECTORS: {
        CHECKOUT_BTN: '#checkout',
    },
    STYLES: {
        Z_INDEX_FORM: '6',
    },
};

let checkoutButton = null;
let formElement = null;
let openFormCallback = null;

/**
 * Initialize the checkout functionality
 *
 * @param {Function} callback - Callback to open order form
 * @param {HTMLElement} form - The order form element
 * @returns {boolean} True if initialization was successful
 */
function initializeCheckout(callback, form) {
    try {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }
        if (!(form instanceof HTMLElement)) {
            throw new Error('Form must be an HTMLElement');
        }

        // ✅ Directly query using the selector string
        checkoutButton = document.querySelector(CONFIG.SELECTORS.CHECKOUT_BTN);
        console.log('Checkout button found:', checkoutButton);
        if (!checkoutButton) {
            throw new Error(`Checkout button not found: ${CONFIG.SELECTORS.CHECKOUT_BTN}`);
        }

        openFormCallback = callback;
        formElement = form;
        attachEventListener();

        return true;
    } catch (error) {
        console.error('Checkout initialization failed:', error);
        return false;
    }
}

function attachEventListener() {
    checkoutButton.addEventListener('click', handleCheckoutClick);
}

function handleCheckoutClick(event) {
    console.log('Checkout button clicked');
    try {
        event.preventDefault();
        event.stopPropagation();

        // ✅ Ensure form container is visible and on top
        formElement.style.display = 'flex';
        formElement.style.zIndex = CONFIG.STYLES.Z_INDEX_FORM;

        // ✅ Call the form opening callback
        openFormCallback();
    } catch (error) {
        console.error('Error handling checkout click:', error);
    }
}

export function checkoutItems(onSubmit, orderForm) {
    // ✅ Immediately initialize so the button is wired
    initializeCheckout(onSubmit, orderForm);
    return { initialize: () => true };
}