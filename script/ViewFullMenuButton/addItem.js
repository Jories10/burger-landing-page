/**
 * Add Item to Cart Module
 * Manages shopping cart functionality and item management
 *
 * @module ViewFullMenuButton/addItem
 */

import { showCheckoutButtonContainer, checkoutContainer } from "./viewfullmenu.js";

// ===================================
// Configuration Constants
// ===================================

const CONFIG = {
    SELECTORS: {
        ADD_ITEM_BTN: '.add-item',
        MENU_ITEM: '.full-menu-item',
        FULL_MENU: '.full-menu',
        ITEM_COUNT: '.item-count',
        DELETE_BTN: '.delete-item-btn',
        DIALOG_CONTAINER: '.dialog-container',
        BURGER_NAME: '.burger-name',
        PRICE: '.price',
        BURGER_ADDED: '.burger-added',
        TOTAL_COST: '#total-cost',
    },
    CLASSES: {
        DIALOG_CONTAINER: 'dialog-container',
        ITEM_COUNT: 'item-count',
        DELETE_BTN: 'delete-item-btn',
        BURGER_ADDED: 'burger-added',
        REMOVE_DIALOG_BTN: 'remove-dialog-btn',
    },
    ANIMATIONS: {
        CHECKOUT_FADE_IN: 'fade-in',
        CHECKOUT_FADE_OUT: 'fade-out',
        DIALOG_SLIDE_OUT: 'slide-out',
    },
    TIMING: {
        DIALOG_ANIMATION: 1500, // ms
    },
    DELETE_ICON_SVG: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2 w-3 h-3 text-destructive"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>`,
    MINUS_ICON_SVG: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus w-3 h-3"><path d="M5 12h14"></path></svg>`,
    CLOSE_ICON_SVG: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x h-4 w-4" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`,
};

const MAX_ITEM_QUANTITY = 10;
const TOOLTIP_MESSAGES = {
    DEFAULT: 'Add one more item to your order',
    MAX_REACHED: `Maximum ${MAX_ITEM_QUANTITY} pieces allowed per item`,
};

// ===================================
// State
// ===================================

const state = {
    addItemButtons: null,
    totalCostElement: null,
    totalPrice: 0,
    totalItems: 0,
    eventListeners: [],
};

// ===================================
// Functions
// ===================================

function cacheElements() {
    state.addItemButtons = document.querySelectorAll(CONFIG.SELECTORS.ADD_ITEM_BTN);
    state.totalCostElement = document.querySelector(CONFIG.SELECTORS.TOTAL_COST);
}

function validateElements() {
    if (!state.addItemButtons || state.addItemButtons.length === 0) {
        throw new Error(`No add item buttons found: ${CONFIG.SELECTORS.ADD_ITEM_BTN}`);
    }
    if (!state.totalCostElement) {
        throw new Error(`Total cost element not found: ${CONFIG.SELECTORS.TOTAL_COST}`);
    }
}

function attachEventListeners() {
    state.addItemButtons.forEach((button) => {
        button.title = TOOLTIP_MESSAGES.DEFAULT;
        button.setAttribute('aria-label', 'Add item');

        const handler = (event) => handleAddItemClick(event);
        button.addEventListener('click', handler);
        state.eventListeners.push({ element: button, handler });
    });
}

function handleAddItemClick(event) {
    const menuItem = event.target.closest(CONFIG.SELECTORS.MENU_ITEM);
    const fullMenu = event.target.closest(CONFIG.SELECTORS.FULL_MENU);

    if (!menuItem || !fullMenu) {
        console.warn('Menu item or full menu container not found');
        return;
    }

    if (checkoutContainer) {
        checkoutContainer.style.animationName = CONFIG.ANIMATIONS.CHECKOUT_FADE_IN;
    }

    const itemData = extractItemData(menuItem);
    if (!itemData) {
        return;
    }

    showAddedNotification(fullMenu, itemData.name);
    updateCartItem(menuItem, itemData);
}

function getAddItemButton(menuItem) {
    return menuItem.querySelector(CONFIG.SELECTORS.ADD_ITEM_BTN);
}

function getItemCount(menuItem) {
    const countElement = menuItem.querySelector(CONFIG.SELECTORS.ITEM_COUNT);
    return countElement ? parseInt(countElement.textContent, 10) : 0;
}

function setAddButtonState(menuItem) {
    const button = getAddItemButton(menuItem);
    const count = getItemCount(menuItem);
    const isEnabled = count < MAX_ITEM_QUANTITY;

    if (!button) {
        return;
    }

    button.disabled = !isEnabled;
    button.title = isEnabled ? TOOLTIP_MESSAGES.DEFAULT : TOOLTIP_MESSAGES.MAX_REACHED;
    button.setAttribute('aria-label', isEnabled ? 'Add item' : 'Maximum quantity reached');

    if (isEnabled) {
        button.classList.remove('add-item--disabled');
    } else {
        button.classList.add('add-item--disabled');
    }
}

function extractItemData(menuItem) {
    const nameElement = menuItem.querySelector(CONFIG.SELECTORS.BURGER_NAME);
    const priceElement = menuItem.querySelector(CONFIG.SELECTORS.PRICE);

    if (!nameElement || !priceElement) {
        console.warn('Item name or price element not found');
        return null;
    }

    const name = nameElement.textContent.trim();
    const price = extractPrice(priceElement.textContent);

    if (!price) {
        console.error('Invalid price format');
        return null;
    }

    return { name, price };
}

function extractPrice(priceText) {
    const cleanPrice = priceText.trim().replace(/[^\d.]/g, '');
    const parsedPrice = parseFloat(cleanPrice);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return null;
    }

    return parsedPrice;
}

function showAddedNotification(fullMenu, itemName) {
    let dialogContainer = fullMenu.querySelector(CONFIG.SELECTORS.DIALOG_CONTAINER);

    if (!dialogContainer) {
        dialogContainer = createNotificationDialog(itemName);
        fullMenu.appendChild(dialogContainer);
    } else {
        const burgerAdded = dialogContainer.querySelector(CONFIG.SELECTORS.BURGER_ADDED);
        if (burgerAdded) {
            burgerAdded.textContent = `${itemName} added! 🍔`;
        }
    }
}

function createNotificationDialog(itemName) {
    const container = document.createElement('div');
    container.className = CONFIG.CLASSES.DIALOG_CONTAINER;

    const message = document.createElement('p');
    message.className = CONFIG.CLASSES.BURGER_ADDED;
    message.textContent = `${itemName} added! 🍔`;

    const closeBtn = document.createElement('button');
    closeBtn.className = CONFIG.CLASSES.REMOVE_DIALOG_BTN;
    closeBtn.innerHTML = CONFIG.CLOSE_ICON_SVG;
    closeBtn.setAttribute('type', 'button');
    closeBtn.setAttribute('aria-label', 'Close notification');

    closeBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        closeNotificationDialog(container);
    });

    container.append(message, closeBtn);
    return container;
}

function closeNotificationDialog(dialog) {
    dialog.style.animationName = CONFIG.ANIMATIONS.DIALOG_SLIDE_OUT;
    setTimeout(() => {
        if (dialog.parentElement) {
            dialog.remove();
        }
    }, CONFIG.TIMING.DIALOG_ANIMATION);
}

function updateCartItem(menuItem, itemData) {
    let countElement = menuItem.querySelector(CONFIG.SELECTORS.ITEM_COUNT);
    let deleteBtn = menuItem.querySelector(CONFIG.SELECTORS.DELETE_BTN);

    if (!countElement) {
        countElement = document.createElement('span');
        countElement.className = CONFIG.CLASSES.ITEM_COUNT;
        countElement.textContent = '1';

        deleteBtn = document.createElement('button');
        deleteBtn.className = CONFIG.CLASSES.DELETE_BTN;
        deleteBtn.innerHTML = CONFIG.DELETE_ICON_SVG;
        deleteBtn.setAttribute('type', 'button');
        deleteBtn.setAttribute('aria-label', 'Delete item');

        menuItem.append(deleteBtn, countElement);

        deleteBtn.addEventListener('click', (event) => {
            handleDeleteItem(event, menuItem, countElement, deleteBtn, itemData.price);
        });

        state.totalItems += 1;
        state.totalPrice += itemData.price;
    } else {
        const currentCount = parseInt(countElement.textContent, 10);
        countElement.textContent = currentCount + 1;

        if (deleteBtn && currentCount >= 1) {
            deleteBtn.innerHTML = CONFIG.MINUS_ICON_SVG;
            deleteBtn.style.color = 'white';
        }

        state.totalItems += 1;
        state.totalPrice += itemData.price;
    }

    setAddButtonState(menuItem);
    updateCheckoutUI();
}

function handleDeleteItem(event, menuItem, countElement, deleteBtn, itemPrice) {
    event.stopPropagation();

    let currentCount = parseInt(countElement.textContent, 10);

    if (currentCount > 1) {
        currentCount -= 1;
        countElement.textContent = currentCount;
        state.totalItems -= 1;
        state.totalPrice -= itemPrice;
    } else {
        if (deleteBtn) deleteBtn.remove();
        if (countElement) countElement.remove();
        state.totalItems -= 1;
        state.totalPrice -= itemPrice;
    }

    setAddButtonState(menuItem);
    updateCheckoutUI();
}

function updateCheckoutUI() {
    if (state.totalCostElement) {
        state.totalCostElement.textContent = `₱${state.totalPrice.toFixed(2)}`;
    }

    if (state.totalItems > 0) {
        showCheckoutButtonContainer(state.totalItems, 'block');
    } else {
        if (checkoutContainer) {
            checkoutContainer.style.animationName = CONFIG.ANIMATIONS.CHECKOUT_FADE_OUT;
        }
        setTimeout(() => {
            showCheckoutButtonContainer(0, 'none');
        }, 1000);
    }
}

function clearCart() {
    state.totalPrice = 0;
    state.totalItems = 0;
    updateCheckoutUI();

    state.addItemButtons.forEach((btn) => {
        const menuItem = btn.closest(CONFIG.SELECTORS.MENU_ITEM);
        if (menuItem) {
            const countEl = menuItem.querySelector(CONFIG.SELECTORS.ITEM_COUNT);
            const deleteEl = menuItem.querySelector(CONFIG.SELECTORS.DELETE_BTN);
            if (countEl) countEl.remove();
            if (deleteEl) deleteEl.remove();
            setAddButtonState(menuItem);
        }
    });
}

function destroy() {
    state.eventListeners.forEach(({ element, handler }) => {
        element.removeEventListener('click', handler);
    });
    state.eventListeners = [];
}
function renableDeleteButton(){
        const deleteButtons = document.querySelectorAll('.delete-item-btn');
        deleteButtons.forEach(btn => {
            btn.disabled = false;
            btn.style.display = 'inline-block';
        });
}

/**
 * Get current cart items from DOM
 * @returns {Array} Array of items with name and count
 */
function getCartItems() {
    const cartItems = [];
    const menuItems = document.querySelectorAll(CONFIG.SELECTORS.MENU_ITEM);
    
    menuItems.forEach((item) => {
        const countElement = item.querySelector(CONFIG.SELECTORS.ITEM_COUNT);
        if (countElement) {
            const nameElement = item.querySelector(CONFIG.SELECTORS.BURGER_NAME);
            const priceElement = item.querySelector(CONFIG.SELECTORS.PRICE);
            
            if (nameElement && priceElement) {
                cartItems.push({
                    name: nameElement.textContent.trim(),
                    count: parseInt(countElement.textContent, 10),
                    price: extractPrice(priceElement.textContent),
                });
            }
        }
    });
    
    return cartItems;
}

export function addItemToCart() {
    try {
        cacheElements();
        validateElements();
        attachEventListeners();
        
        return {
            clearCart,
            destroy,
            getTotal: () => state.totalPrice,
            getItemCount: () => state.totalItems,
            getCartItems,
        };
    } catch (error) {
        console.error('Failed to initialize addItemToCart', error);
        return null;
    }

   

}
