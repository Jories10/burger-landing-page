/**
 * Grid Menu Add Product Module
 * Manages the "add to cart" functionality for burger items in the grid menu
 *
 * @module GridMenusButton/addproduct
 */

// ===================================
// Configuration Constants
// ===================================

const CONFIG = {
    SELECTORS: {
        GRID_MENUS: '.grid-menus',
        ADD_PRODUCT_BTN: '.add-product',
        BURGER_CONTAINER: '.burger',
        MESSAGE_DIALOG: '.message-dialog',
        BURGER_TITLE: '.burger-title',
        BURGER_PRICE: '.burger-price',
        BURGER_NAME: '.burger-name',
        BURGER_CONTENT: '.burger-content',
    },
    CLASSES: {
        MESSAGE_DIALOG: 'message-dialog',
        BURGER_NAME: 'burger-name',
        BURGER_CONTENT: 'burger-content',
    },
    ANIMATION: {
        SLIDE_OUT: 'dialog-slide-out',
        DURATION: 1000, // milliseconds
    },
    MESSAGES: {
        ADDED: 'added! 🍔',
        COMPLETE_ORDER: 'Click "Order Now" to complete your order.',
        INVALID_PRICE: 'Invalid price format detected',
    },
    CLOSE_BUTTON_SVG: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x h-4 w-4" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`,
};

// ===================================
// Global Variables
// ===================================

let gridMenusElement = null;
let addProductButtons = null;
let messageDialog = null;

// ===================================
// Functions
// ===================================

/**
 * Initialize the grid menu functionality
 * Caches DOM elements and attaches event listeners
 *
 * @returns {boolean} True if initialization was successful
 */
export function initializeGridMenus() {
    try {
        cacheElements();
        validateElements();
        attachEventListeners();
        return true;
    } catch (error) {
        console.error('Grid menu initialization failed:', error);
        return false;
    }
}

/**
 * Cache DOM elements for reuse
 */
function cacheElements() {
    gridMenusElement = document.querySelector(CONFIG.SELECTORS.GRID_MENUS);
    addProductButtons = document.querySelectorAll(CONFIG.SELECTORS.ADD_PRODUCT_BTN);
}

/**
 * Validate that required DOM elements exist
 *
 * @throws {Error} If required elements are not found
 */
function validateElements() {
    if (!gridMenusElement) {
        throw new Error(`Required element not found: ${CONFIG.SELECTORS.GRID_MENUS}`);
    }
    if (addProductButtons.length === 0) {
        throw new Error(`No add product buttons found: ${CONFIG.SELECTORS.ADD_PRODUCT_BTN}`);
    }
}

/**
 * Attach event listeners to add product buttons
 */
function attachEventListeners() {
    // Use event delegation for better performance
    if (gridMenusElement) {
        gridMenusElement.addEventListener('click', handleGridClick);
    }
}

/**
 * Handle clicks on the grid menus container
 *
 * @param {Event} event - The click event
 */
function handleGridClick(event) {
    const target = event.target;

    // Check if the clicked element is an add product button
    if (target.matches(CONFIG.SELECTORS.ADD_PRODUCT_BTN) || target.closest(CONFIG.SELECTORS.ADD_PRODUCT_BTN)) {
        handleAddProductClick(event);
    }
}

/**
 * Handle add product button click
 * Extracts burger data and shows confirmation dialog
 *
 * @param {Event} event - The click event
 */
function handleAddProductClick(event) {
    event.preventDefault();

    try {
        const burgerData = extractBurgerData(event.target);
        showMessageDialog(burgerData);
    } catch (error) {
        console.error('Error adding product:', error);
    }
}

/**
 * Extract burger data from the clicked element
 *
 * @param {HTMLElement} button - The add product button
 * @returns {Object} Burger data object
 */
function extractBurgerData(button) {
    const burgerContainer = button.closest(CONFIG.SELECTORS.BURGER_CONTAINER);

    if (!burgerContainer) {
        throw new Error('Burger container not found');
    }

    const burgerName = burgerContainer.querySelector(CONFIG.SELECTORS.BURGER_TITLE)?.textContent?.trim() || 'Unknown Burger';
    const burgerPriceText = burgerContainer.querySelector(CONFIG.SELECTORS.BURGER_PRICE)?.textContent?.trim() || '';

    // Parse price, remove currency symbols
    const priceMatch = burgerPriceText.match(/[\d.]+/);
    const burgerPrice = priceMatch ? parseFloat(priceMatch[0]) : 0;

    if (isNaN(burgerPrice) || burgerPrice <= 0) {
        console.warn(CONFIG.MESSAGES.INVALID_PRICE, burgerPriceText);
    }

    return {
        name: burgerName,
        price: burgerPrice,
        priceText: burgerPriceText
    };
}

/**
 * Show message dialog with burger information
 *
 * @param {Object} burgerData - The burger data
 */
function showMessageDialog(burgerData) {
    // Remove existing dialog if present
    if (messageDialog && messageDialog.parentElement) {
        messageDialog.remove();
    }

    // Create new dialog
    messageDialog = createMessageDialog(burgerData);

    // Append to grid menus
    if (gridMenusElement) {
        gridMenusElement.appendChild(messageDialog);
    }

    // Auto-remove after duration
    setTimeout(() => {
        if (messageDialog && messageDialog.parentElement) {
            messageDialog.classList.add(CONFIG.ANIMATION.SLIDE_OUT);
            setTimeout(() => {
                if (messageDialog && messageDialog.parentElement) {
                    messageDialog.remove();
                }
            }, CONFIG.ANIMATION.DURATION);
        }
    }, 3000);
}

/**
 * Create the message dialog element
 *
 * @param {Object} burgerData - The burger data
 * @returns {HTMLElement} The dialog element
 */
function createMessageDialog(burgerData) {
    const dialog = document.createElement('div');
    dialog.className = CONFIG.CLASSES.MESSAGE_DIALOG;

    // Burger name
    const nameElement = document.createElement('div');
    nameElement.className = CONFIG.CLASSES.BURGER_NAME;
    nameElement.textContent = burgerData.name;

    // Burger content (price and message)
    const contentElement = document.createElement('div');
    contentElement.className = CONFIG.CLASSES.BURGER_CONTENT;
    contentElement.textContent = `${CONFIG.MESSAGES.ADDED} ${CONFIG.MESSAGES.COMPLETE_ORDER}`;

    // Close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = CONFIG.CLOSE_BUTTON_SVG;
    closeButton.setAttribute('aria-label', 'Close message');
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', () => {
        if (dialog.parentElement) {
            dialog.classList.add(CONFIG.ANIMATION.SLIDE_OUT);
            setTimeout(() => {
                dialog.remove();
            }, CONFIG.ANIMATION.DURATION);
        }
    });

    dialog.appendChild(nameElement);
    dialog.appendChild(contentElement);
    dialog.appendChild(closeButton);

    return dialog;
}







// ===================================
// Module Export
// ===================================

export const GridMenusAddProduct = initializeGridMenus;