 /**
 * Order Now Form Module
 * Main orchestrator for the header order form and navigation
 *
 * @module HeaderOrderForm/orderNowForm
 */

import { errorDialog } from './errorDialog.js';
import { orderPlaced, storeOrderData, getOrdersHistory, removeOrderFromHistory } from './orderPlace.js';
import { orderNow } from '../heroSectionOrderForm/orderForm.js';
import { renderFullMenu, removeFullMenu, fullMenu, removeFullMenuBtn, showCheckoutButtonContainer } from '../ViewFullMenuButton/viewfullmenu.js';
import { addItemToCart } from '../ViewFullMenuButton/addItem.js';
import { checkoutItems } from '../ViewFullMenuButton/checkout.js';
import { GridMenusAddProduct } from '../GridMenusButton/addproduct.js';

const CONFIG = {
    SELECTORS: {
        ORDER_FORM: '.order-now-form',
        FORM_CONTAINER: '.form-container',
        HERO_SECTION: '#hero-section',
        VIEW_FULL_MENU_BTN: '#view-full-menu',
        SMALL_SCREEN_ORDER_BTN: '#order-now',
        WIDE_SCREEN_ORDER_BTN: '#wide-screen-order-button',
        CONFIRM_ORDER_BTN: '#confirm-order',
        EXIT_FORM_BTN: '#exit',
        ORDER_HISTORY_BTN: '#order-history-button',
        MOBILE_ORDER_HISTORY_BTN: '#order-history-mobile-button',
        FULL_NAME: '#full-name',
        PHONE_NUMBER: '#phone-number',
        DELIVERY_ADDRESS: '#delivery-address',
    },
    FORM_DISPLAY: {
        DISPLAY: 'flex',
        OVERFLOW_HIDDEN: 'hidden',
    },
    MESSAGES: {
        VALIDATION_ERROR: 'Please fill in all fields to place your order!',
    },
};

const FormValidator = {
    validateFormFields(fields) {
        const { fullName, phoneNumber, deliveryAddress } = fields;

        if (!fullName || !phoneNumber || !deliveryAddress) {
            return false;
        }

        const fullNameValue = fullName.value.trim() || '';
        const phoneNumberValue = phoneNumber.value.trim() || '';
        const deliveryAddressValue = deliveryAddress.value.trim() || '';

        return fullNameValue.length > 0 &&
            phoneNumberValue.length > 0 &&
            deliveryAddressValue.length > 0;
    },

    clearFormFields(fields) {
        const { fullName, phoneNumber, deliveryAddress } = fields;

        if (fullName) fullName.value = '';
        if (phoneNumber) phoneNumber.value = '';
        if (deliveryAddress) deliveryAddress.value = '';
    },
};

const state = {
    orderForm: null,
    formContainer: null,
    heroSection: null,
    viewFullMenuBtn: null,
    smallScreenOrderBtn: null,
    wideScreenOrderBtn: null,
    confirmOrderBtn: null,
    exitFormBtn: null,
    fullNameInput: null,
    phoneNumberInput: null,
    deliveryAddressInput: null,
    eventListeners: [],
    gridMenuManager: null,
    addItemManager: null,
    cartManager: null,
    orderHistoryBtn: null,
    mobileOrderHistoryBtn: null,
    orderHistoryPanel: null,
};


function cacheElements() {
    state.orderForm = document.querySelector(CONFIG.SELECTORS.ORDER_FORM);
    state.formContainer = document.querySelector(CONFIG.SELECTORS.FORM_CONTAINER);
    state.heroSection = document.querySelector(CONFIG.SELECTORS.HERO_SECTION);

    state.viewFullMenuBtn = document.querySelector(CONFIG.SELECTORS.VIEW_FULL_MENU_BTN);
    state.smallScreenOrderBtn = document.querySelector(CONFIG.SELECTORS.SMALL_SCREEN_ORDER_BTN);
    state.wideScreenOrderBtn = document.querySelector(CONFIG.SELECTORS.WIDE_SCREEN_ORDER_BTN);
    state.orderHistoryBtn = document.querySelector(CONFIG.SELECTORS.ORDER_HISTORY_BTN);
    state.mobileOrderHistoryBtn = document.querySelector(CONFIG.SELECTORS.MOBILE_ORDER_HISTORY_BTN);
    state.confirmOrderBtn = document.querySelector(CONFIG.SELECTORS.CONFIRM_ORDER_BTN);
    state.exitFormBtn = document.querySelector(CONFIG.SELECTORS.EXIT_FORM_BTN);
    state.fullNameInput = document.querySelector(CONFIG.SELECTORS.FULL_NAME);
    state.phoneNumberInput = document.querySelector(CONFIG.SELECTORS.PHONE_NUMBER);
    state.deliveryAddressInput = document.querySelector(CONFIG.SELECTORS.DELIVERY_ADDRESS);
}

function validateElements() {
    const requiredElements = {
        orderForm: state.orderForm,
        formContainer: state.formContainer,
        heroSection: state.heroSection,
        viewFullMenuBtn: state.viewFullMenuBtn,
        confirmOrderBtn: state.confirmOrderBtn,
        exitFormBtn: state.exitFormBtn,
        fullNameInput: state.fullNameInput,
        phoneNumberInput: state.phoneNumberInput,
        deliveryAddressInput: state.deliveryAddressInput,
    };

    for (const [name, element] of Object.entries(requiredElements)) {
        if (!element) {
            throw new Error(`Required element not found: ${name}`);
        }
    }
}

function addEventListenerWithHistory(element, event, handler, options = false) {
    if (!element) {
        return;
    }

    element.addEventListener(event, handler, options);
    state.eventListeners.push({ element, event, handler, options });
}

function openOrderForm() {
    if (!state.orderForm) return;

    state.orderForm.style.display = CONFIG.FORM_DISPLAY.DISPLAY;
    state.orderForm.style.overflow = CONFIG.FORM_DISPLAY.OVERFLOW_HIDDEN;
    document.body.style.overflow = CONFIG.FORM_DISPLAY.OVERFLOW_HIDDEN;

    // Close full menu if open
    if (fullMenu && fullMenu.style.display === 'block') {
        removeFullMenu();
    }
}

function closeOrderForm() {
    if (!state.orderForm) return;

    state.orderForm.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function handleViewFullMenu(event) {
    console.log('View full menu clicked');
    event.stopPropagation();
    renderFullMenu();
}



function handleGlobalClick(event) {
    if (!fullMenu) {
        return;
    }

    if (fullMenu.style.display === 'block') {
        const clickedOnMenu = fullMenu.contains(event.target);
        const clickedOnOrderForm = state.orderForm?.contains(event.target);
        const clickedOnFormContainer = state.formContainer?.contains(event.target);

        if (!clickedOnMenu && !clickedOnOrderForm && !clickedOnFormContainer) {
            removeFullMenu();
        }
    }
}

function createOrderHistoryPanel() {
    const overlay = document.createElement('div');
    overlay.id = 'order-history-overlay';
    overlay.className = 'order-history-overlay';
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closeOrderHistoryPanel();
        }
    });

    const panel = document.createElement('section');
    panel.id = 'order-history-panel';
    panel.className = 'order-history-panel';
    panel.setAttribute('aria-label', 'Order History');
    panel.innerHTML = `
        <div class="order-history-header">
            <div>
                <h2>Order History</h2>
                <p class="order-history-subtitle">View your past orders and remove completed history.</p>
            </div>
            <button type="button" id="order-history-close" class="order-history-close" aria-label="Close order history panel">×</button>
        </div>
        <div id="order-history-list" class="order-history-list"></div>
        <button type="button" id="order-history-scroll-top" class="order-history-scroll-top" aria-label="Scroll to top">⬆</button>
    `;

    overlay.append(panel);
    document.body.appendChild(overlay);

    const closeButton = panel.querySelector('#order-history-close');
    if (closeButton) {
        closeButton.addEventListener('click', (event) => {
            event.stopPropagation();
            closeOrderHistoryPanel();
        });
    }

    const scrollTopButton = panel.querySelector('#order-history-scroll-top');
    if (scrollTopButton) {
        scrollTopButton.addEventListener('click', (event) => {
            event.stopPropagation();
            panel.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    panel.addEventListener('scroll', () => {
        const button = panel.querySelector('#order-history-scroll-top');
        if (!button) {
            return;
        }

        if (panel.scrollTop > 220) {
            button.classList.add('visible');
        } else {
            button.classList.remove('visible');
        }
    });

    return overlay;
}

function openOrderHistoryPanel() {
    if (!state.orderHistoryPanel) {
        state.orderHistoryPanel = createOrderHistoryPanel();
    }

    state.orderHistoryPanel.style.display = 'block';
    document.body.style.overflow = 'hidden';
    renderOrderHistoryList();
}

function closeOrderHistoryPanel() {
    if (!state.orderHistoryPanel) {
        return;
    }

    state.orderHistoryPanel.remove();
    state.orderHistoryPanel = null;
    document.body.style.overflow = 'auto';
}

function renderOrderHistoryList() {
    const listContainer = document.querySelector('#order-history-list');
    if (!listContainer) {
        return;
    }

    const orders = getOrdersHistory();
    listContainer.innerHTML = '';

    if (orders.length === 0) {
        listContainer.innerHTML = '<p class="order-history-empty">No order history found.</p>';
        return;
    }

    orders.forEach((order) => {
        const card = document.createElement('article');
        card.className = 'order-history-card';
        card.dataset.orderId = order.orderId;

        const itemLines = order.items.map((item) => {
            return `<li>${item.count}× ${item.name} - ₱${item.price.toFixed(2)}</li>`;
        }).join('');

        card.innerHTML = `
            <div class="order-history-card-header">
                <div>
                    <p class="order-history-meta">Order ID: ${order.orderId}</p>
                    <p class="order-history-date">${new Date(order.timestamp).toLocaleString()}</p>
                </div>
                <button type="button" class="order-history-delete" data-order-id="${order.orderId}">Delete</button>
            </div>
            <p><strong>Name:</strong> ${order.fullName}</p>
            <p><strong>Phone:</strong> ${order.phoneNumber}</p>
            <p><strong>Address:</strong> ${order.deliveryAddress}</p>
            <p><strong>Items:</strong> ${order.itemCount} | <strong>Total:</strong> ₱${order.totalPrice.toFixed(2)}</p>
            <ul class="order-history-items">
                ${itemLines}
            </ul>
        `;

        listContainer.appendChild(card);
    });

    const deleteButtons = listContainer.querySelectorAll('.order-history-delete');
    deleteButtons.forEach((button) => {
        button.addEventListener('click', handleOrderHistoryDelete);
    });
}

function handleOrderHistoryDelete(event) {
    event.stopPropagation();
    const orderId = event.currentTarget.dataset.orderId;
    if (!orderId) {
        return;
    }

    const confirmed = window.confirm(
        'Are you sure you want to delete this transaction history? It will be deleted permanently.'
    );
    if (!confirmed) {
        return;
    }

    const removed = removeOrderFromHistory(orderId);
    if (!removed) {
        return;
    }

    renderOrderHistoryList();
}

function handleConfirmOrder() {
    const formFields = {
        fullName: state.fullNameInput,
        phoneNumber: state.phoneNumberInput,
        deliveryAddress: state.deliveryAddressInput,
    };

    if (!FormValidator.validateFormFields(formFields)) {
        errorDialog(state.heroSection, 'Missing Information', CONFIG.MESSAGES.VALIDATION_ERROR);
        return;
    }

    // ✅ Get cart items before clearing
    const cartItems = state.addItemManager && state.addItemManager.getCartItems ? state.addItemManager.getCartItems() : [];
    const totalPrice = state.addItemManager && state.addItemManager.getTotal ? state.addItemManager.getTotal() : 0;
    const itemCount = state.addItemManager && state.addItemManager.getItemCount ? state.addItemManager.getItemCount() : 0;

    // ✅ Store order data with form and cart information
    const orderData = {
        fullName: state.fullNameInput.value.trim(),
        phoneNumber: state.phoneNumberInput.value.trim(),
        deliveryAddress: state.deliveryAddressInput.value.trim(),
        totalPrice: totalPrice,
        itemCount: itemCount,
        items: cartItems,
    };

    // Store the order in the array
    const storedOrder = storeOrderData(orderData);
    console.log('Order placed:', storedOrder);

    // ✅ Clear the cart
    if (state.addItemManager && state.addItemManager.clearCart) {
        state.addItemManager.clearCart();
    }

    // ✅ Remove all delete buttons and item counts from menu items
    const allMenuItems = document.querySelectorAll('.full-menu-item');
    allMenuItems.forEach((item) => {
        const deleteBtn = item.querySelector('.delete-item-btn');
        const itemCountEl = item.querySelector('.item-count');
        if (deleteBtn) deleteBtn.remove();
        if (itemCountEl) itemCountEl.remove();
    });

    // ✅ Reset UI elements
    const items = document.querySelector('#items');
    const totalCost = document.querySelector('#total-cost');

    if (items) items.textContent = '(0 items)';
    if (totalCost) totalCost.textContent = '₱0.00';

    // ✅ Hide checkout button container
    showCheckoutButtonContainer(0, 'none');

    // Close full menu if open
    if (fullMenu && fullMenu.style.display === 'block') {
        removeFullMenu();
    }

    // Show order confirmation
    orderPlaced(state.heroSection);

    // Clear form fields
    FormValidator.clearFormFields(formFields);

    // Close the order form
    closeOrderForm();
}

function handleExitForm(event) {
    console.log('Exit form clicked');
    event.stopPropagation();
    closeOrderForm();
}

function navigateToViewFullMenu(event) {
    console.log('Navigate to full menu clicked');
    event.preventDefault();
    event.stopPropagation();

    const openMenu = () => {
        renderFullMenu();
    };

    if (typeof document.startViewTransition === 'function') {
        document.startViewTransition(openMenu);
        return;
    }

    openMenu();
}

function attachEventListeners() {
    console.log('Attaching event listeners in orderNowForm');

    // View full menu button
    if (state.viewFullMenuBtn) {
        addEventListenerWithHistory(state.viewFullMenuBtn, 'click', handleViewFullMenu);
    }

    // Order now buttons should navigate to the full menu
    if (state.smallScreenOrderBtn) {
        addEventListenerWithHistory(state.smallScreenOrderBtn, 'click', navigateToViewFullMenu);
    }
    if (state.wideScreenOrderBtn) {
        addEventListenerWithHistory(state.wideScreenOrderBtn, 'click', navigateToViewFullMenu);
    }

    if (orderNow) {
        orderNow.addEventListener('click', navigateToViewFullMenu);
    }

    // Form buttons
    if (state.confirmOrderBtn) {
        addEventListenerWithHistory(state.confirmOrderBtn, 'click', (event)=>{
            event.preventDefault()
            handleConfirmOrder();
        });
    }
    if (state.exitFormBtn) {
        addEventListenerWithHistory(state.exitFormBtn, 'click', handleExitForm);
    }
    if (state.orderHistoryBtn) {
        addEventListenerWithHistory(state.orderHistoryBtn, 'click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            openOrderHistoryPanel();
        });
    }
    if (state.mobileOrderHistoryBtn) {
        addEventListenerWithHistory(state.mobileOrderHistoryBtn, 'click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            openOrderHistoryPanel();
        });
    }

    // Global click handler for closing menu
    addEventListenerWithHistory(document, 'click', handleGlobalClick);
}

function initializeOrderNowForm() {
    console.log('Initializing order now form');
    try {
        cacheElements();
        validateElements();
        attachEventListeners();

        // Initialize other modules
        if (typeof GridMenusAddProduct === 'function') {
            state.gridMenuManager = GridMenusAddProduct();
        }
        if (typeof addItemToCart === 'function') {
            state.addItemManager = addItemToCart();
        }
        if (typeof checkoutItems === 'function') {
            state.cartManager = checkoutItems(openOrderForm, state.formContainer);
        }

        console.log('Order now form initialized successfully');
    } catch (error) {
        console.error('Failed to initialize order now form:', error);
    }
}

function destroyOrderNowForm() {
    console.log('Destroying order now form');

    // Remove all event listeners
    state.eventListeners.forEach(({ element, event, handler, options }) => {
        if (element) {
            element.removeEventListener(event, handler, options);
        }
    });
    state.eventListeners = [];

    // Clean up state
    Object.keys(state).forEach(key => {
        if (key !== 'eventListeners') {
            state[key] = null;
        }
    });
}

//remove full menu using exit button
removeFullMenuBtn();

// Export functions
export { initializeOrderNowForm, destroyOrderNowForm };
export const heroSection = state.heroSection;

// Initialize the module when loaded
initializeOrderNowForm();
