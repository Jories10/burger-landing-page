/**
 * Order Placement Confirmation Module
 * Displays order confirmation message to users
 *
 * @module HeaderOrderForm/orderPlace
 */

// ===================================
// Configuration Constants
// ===================================

const CONFIG = {
    SELECTORS: {
        PLACE_ORDER_CONTAINER: '.place-order',
    },
    CLASSES: {
        CONTAINER: 'place-order',
        TITLE: 'order-title',
        EXIT_BUTTON: 'exit-button',
        ANIMATION_OUT: 'placeorder-slide-out',
    },
    TIMING: {
        CLOSE_ANIMATION: 1500, // ms
        AUTO_REMOVE: 6000,     // ms
        AUTO_REMOVE_DELAY: 1500, // ms
    },
    MESSAGES: {
        SUCCESS_TITLE: 'Order Placed! 🍔',
        SUCCESS_TEXT: 'Your delicious burger will arrive in 30 minutes.',
    },
    CLOSE_BUTTON_SVG: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x h-4 w-4" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`,
};

// ===================================
// Global Variables
// ===================================

let autoRemoveTimer = null;
let isRemoving = false;

// Store all placed orders
let ordersHistory = [];
const STORAGE_KEY = 'burgercraftOrderHistory';

function loadOrdersFromStorage() {
    try {
        const savedOrders = localStorage.getItem(STORAGE_KEY);
        if (!savedOrders) {
            return;
        }

        const parsedOrders = JSON.parse(savedOrders);
        if (Array.isArray(parsedOrders)) {
            ordersHistory = parsedOrders;
        }
    } catch (error) {
        console.warn('Could not load order history from localStorage:', error);
        ordersHistory = [];
    }
}

function saveOrdersToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ordersHistory));
    } catch (error) {
        console.error('Could not save order history to localStorage:', error);
    }
}

loadOrdersFromStorage();

// ===================================
// Functions
// ===================================

/**
 * Show an order confirmation dialog in the specified parent element
 *
 * @param {HTMLElement} parentElement - The parent element to append the dialog to
 * @param {string} [title] - Custom success title (optional)
 * @param {string} [message] - Custom success message (optional)
 */
function showOrderConfirmation(parentElement, title = CONFIG.MESSAGES.SUCCESS_TITLE, message = CONFIG.MESSAGES.SUCCESS_TEXT) {
    if (!parentElement) {
        console.error('Parent element is required');
        return;
    }

    // Check if dialog already exists
    const existing = parentElement.querySelector(CONFIG.SELECTORS.PLACE_ORDER_CONTAINER);
    if (existing) {
        return;
    }

    // Create and show new dialog
    const dialog = createDialogElement(title, message);
    parentElement.appendChild(dialog);

    // Start auto-remove timer
    startAutoRemoveTimer(dialog);
}

/**
 * Create the order confirmation dialog DOM element
 *
 * @param {string} title - The success title
 * @param {string} message - The success message
 * @returns {HTMLElement} The dialog container
 */
function createDialogElement(title, message) {
    const container = document.createElement('div');
    container.className = CONFIG.CLASSES.CONTAINER;
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');

    // Title
    const titleElement = document.createElement('h2');
    titleElement.className = CONFIG.CLASSES.TITLE;
    titleElement.textContent = title;

    // Message
    const messageElement = document.createElement('p');
    messageElement.textContent = message;

    // Exit button
    const exitButton = createExitButton(container);

    container.append(titleElement, messageElement, exitButton);
    return container;
}

/**
 * Create the exit button for the dialog
 *
 * @param {HTMLElement} container - The dialog container
 * @returns {HTMLElement} The exit button
 */
function createExitButton(container) {
    const button = document.createElement('button');
    button.className = CONFIG.CLASSES.EXIT_BUTTON;
    button.innerHTML = CONFIG.CLOSE_BUTTON_SVG;
    button.setAttribute('type', 'button');
    button.setAttribute('aria-label', 'Close order confirmation');
    button.style.cursor = 'pointer';

    button.addEventListener('click', (event) => {
        event.stopPropagation();
        closeOrderConfirmation(container);
    });

    return button;
}

/**
 * Close the order confirmation dialog with animation
 *
 * @param {HTMLElement} dialog - The dialog to close
 */
function closeOrderConfirmation(dialog) {
    if (isRemoving) return;
    isRemoving = true;

    // Clear auto-remove timer
    if (autoRemoveTimer) {
        clearTimeout(autoRemoveTimer);
        autoRemoveTimer = null;
    }

    // Apply exit animation
    dialog.style.animationName = CONFIG.CLASSES.ANIMATION_OUT;

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
            closeOrderConfirmation(dialog);
        }
    }, CONFIG.TIMING.AUTO_REMOVE);
}

// ===================================
// Module Export
// ===================================

/**
 * Store order data in history array
 *
 * @param {Object} orderData - The order data to store
 * @param {string} orderData.fullName - Customer's full name
 * @param {string} orderData.phoneNumber - Customer's phone number
 * @param {string} orderData.deliveryAddress - Delivery address
 * @param {number} orderData.totalPrice - Total price of the order
 * @param {number} orderData.itemCount - Number of items in the order
 * @param {Array} orderData.items - Array of items in the order
 * @returns {Object} - The stored order data with timestamp
 */
function storeOrderData(orderData) {
    try {
        const orderWithTimestamp = {
            ...orderData,
            orderId: `ORD-${Date.now()}`,
            timestamp: new Date().toISOString(),
        };
        
        ordersHistory.push(orderWithTimestamp);
        saveOrdersToStorage();
        console.log('Order stored successfully:', orderWithTimestamp);
        console.log('Orders history:', ordersHistory);
        return orderWithTimestamp;
    } catch (error) {
        console.error('Failed to store order data:', error);
        return null;
    }
}

/**
 * Get all orders from history
 *
 * @returns {Array} - Array of all stored orders
 */
function getOrdersHistory() {
    return ordersHistory;
}

/**
 * Clear orders history
 */
function removeOrderFromHistory(orderId) {
    const index = ordersHistory.findIndex((order) => order.orderId === orderId);
    if (index === -1) {
        return false;
    }

    ordersHistory.splice(index, 1);
    saveOrdersToStorage();
    return true;
}

function clearOrdersHistory() {
    ordersHistory = [];
    saveOrdersToStorage();
}

/**
 * Order confirmation function
 * @type {Function}
 */
export const orderPlaced = showOrderConfirmation;

// Export order management functions
export { storeOrderData, getOrdersHistory, removeOrderFromHistory, clearOrdersHistory };
