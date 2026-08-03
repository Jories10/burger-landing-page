/**
 * View Full Menu Module
 * Manages the full menu display and visibility
 *
 * @module ViewFullMenuButton/viewfullmenu
 */

// ===================================
// Configuration Constants
// ===================================

const CONFIG = {
    SELECTORS: {
        MENU_CONTAINER: '.full-menu-container',
        MENU: '.full-menu',
        MENU_ITEM: '.full-menu-item',
        MENUS: '.menus',
        CHECKOUT_CONTAINER: '.check-btn-container',
        ITEMS_COUNT: '#items',
        MOBILE_EXIT_BTN: '#mobile-exit-button',
    },
    CLASSES: {
        ANIMATION_OUT: 'right-slide-out',
    },
    TIMING: {
        CLOSE_ANIMATION: 1000, // ms
    },
    STYLES: {
        PADDING_WITH_CHECKOUT: '8rem',
        PADDING_WITHOUT_CHECKOUT: '3rem',
    },
};

// ===================================
// Global Variables
// ===================================

let menuContainer = null;
let menu = null;
let menuItem = null;
let menusElement = null;
let checkoutContainer = null;
let itemsCountElement = null;
let mobileExitButton = null;
let isOpen = false;

// ===================================
// Functions
// ===================================

/**
 * Initialize the full menu functionality
 * Caches DOM elements and validates them
 *
 * @returns {boolean} True if initialization was successful
 */
function initializeFullMenu() {
    try {
        cacheElements();
        validateElements();
        return true;
    } catch (error) {
        console.error('Full menu initialization failed:', error);
        return false;
    }
}

/**
 * Cache DOM elements for reuse
 */
function cacheElements() {
    menuContainer = document.querySelector(CONFIG.SELECTORS.MENU_CONTAINER);
    menu = document.querySelector(CONFIG.SELECTORS.MENU);
    menuItem = document.querySelector(CONFIG.SELECTORS.MENU_ITEM);
    menusElement = document.querySelector(CONFIG.SELECTORS.MENUS);
    mobileExitButton = document.querySelector(CONFIG.SELECTORS.MOBILE_EXIT_BTN);
    checkoutContainer = document.querySelector(CONFIG.SELECTORS.CHECKOUT_CONTAINER);
    itemsCountElement = document.querySelector(CONFIG.SELECTORS.ITEMS_COUNT);
}

/**
 * Validate that required DOM elements exist
 *
 * @throws {Error} If required elements are not found
 */
function validateElements() {
    const requiredElements = {
        'menuContainer': menuContainer,
        'menu': menu,
        'menusElement': menusElement,
        'checkoutContainer': checkoutContainer,
    };

    for (const [name, element] of Object.entries(requiredElements)) {
        if (!element) {
            throw new Error(`Required element not found: ${name}`);
        }
    }
}

/**
 * Show the checkout button container and update item count
 *
 * @param {number} itemCount - Number of items in the cart
 * @param {string} [display='block'] - CSS display value
 */
function showCheckoutButtonContainer(itemCount, display = 'block') {
    if (checkoutContainer) {
        checkoutContainer.style.display = display;
    }

    if (itemsCountElement) {
        itemsCountElement.textContent = `(${itemCount} ${itemCount === 1 ? 'Item' : 'Items'})`;
    }

    // Adjust menu padding based on checkout visibility
    if (menusElement) {
        if (display === 'block') {
            menusElement.style.paddingBottom = CONFIG.STYLES.PADDING_WITH_CHECKOUT;
        } else {
            menusElement.style.paddingBottom = CONFIG.STYLES.PADDING_WITHOUT_CHECKOUT;
        }
    }
}

export function removeFullMenuBtn(){
    mobileExitButton.addEventListener('click', (event)=>{
        event.preventDefault()
        event.stopPropagation();
        menu.classList.add(CONFIG.CLASSES.ANIMATION_OUT);
        document.body.style.overflow = 'auto';
        setTimeout(()=>{
            menu.classList.remove(CONFIG.CLASSES.ANIMATION_OUT);
            menuContainer.style.display = "none";
            menu.style.display = 'none';
        },1500);
    });
}

/**
 * Hide the checkout button container and reset item count
 */
function hideCheckoutButtonContainer() {
    showCheckoutButtonContainer(0, 'none');
}

/**
 * Render (open) the full menu
 */
export function renderFullMenu() {
    try {
        if (!menuContainer || !menu) {
            throw new Error('Menu elements not available');
        }

        menuContainer.style.display = 'block';
        menu.style.display = 'block';
        document.body.style.overflow = 'hidden';
        isOpen = true;
    } catch (error) {
        console.error('Error rendering full menu:', error);
    }
}

/**
 * Remove (close) the full menu with animation
 */
export function removeFullMenu() {
    if (!isOpen || !menu) {
        return;
    }

    try {
        isOpen = false;

        // Apply exit animation
        menu.classList.add(CONFIG.CLASSES.ANIMATION_OUT);

        // Remove after animation completes
        setTimeout(() => {
            if (menuContainer) menuContainer.style.display = 'none';
            if (menu) {
                menu.style.display = 'none';
                menu.classList.remove(CONFIG.CLASSES.ANIMATION_OUT);
            }
            document.body.style.overflow = 'auto';
        }, CONFIG.TIMING.CLOSE_ANIMATION);
    } catch (error) {
        console.error('Error removing full menu:', error);
        // Fallback: force hide if animation fails
        if (menuContainer) menuContainer.style.display = 'none';
        if (menu) menu.style.display = 'none';
        document.body.style.overflow = 'auto';
        isOpen = false;
    }
}

// Initialize on module load
initializeFullMenu();

// ===================================
// Module Exports
// ===================================

/**
 * Full menu element
 * @type {HTMLElement}
 */
export const fullMenu = menu;

/**
 * Checkout container element
 * @type {HTMLElement}
 */
export { checkoutContainer };

/**
 * Show checkout button and update item count
 *
 * @function
 * @param {number} itemCount - Number of items in cart
 * @param {string} [display='block']
 */
export { showCheckoutButtonContainer };
