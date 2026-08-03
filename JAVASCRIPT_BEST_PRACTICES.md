# JavaScript Best Practices & Implementation Guide

## Overview

This guide documents the JavaScript architecture and best practices implemented in the BurgerCraft project, featuring a complete order management system with persistent storage, smooth navigation, and comprehensive error handling.

**Last Updated:** April 7, 2026
**Architecture:** Class-based ES6 modules with event-driven design

---

## 1. Core Architecture Patterns

### Class-Based Module Structure

All JavaScript modules follow a consistent class-based architecture:

```javascript
class ModuleName {
    constructor() {
        this.CONFIG = {
            SELECTORS: { /* DOM selectors */ },
            CLASSES: { /* CSS classes */ },
            STORAGE_KEYS: { /* localStorage keys */ },
            MESSAGES: { /* User messages */ }
        };
        this.elements = {};
        this.state = {};
        this.init();
    }

    init() {
        this.cacheElements();
        this.attachEventListeners();
        this.setupState();
    }

    cacheElements() {
        // Cache DOM elements for performance
        this.elements = {
            container: document.querySelector(this.CONFIG.SELECTORS.container),
            // ... other elements
        };
    }

    attachEventListeners() {
        // Attach all event listeners
        this.elements.button?.addEventListener('click',
            this.handleButtonClick.bind(this));
    }

    // Public API methods
    show() { /* Show component */ }
    hide() { /* Hide component */ }
    destroy() { /* Cleanup */ }
}

// Export singleton instance
export const moduleInstance = new ModuleName();
```

### Configuration-Driven Development

Centralize all constants in CONFIG objects:

```javascript
const CONFIG = {
    SELECTORS: {
        orderForm: '.order-now-form',
        confirmButton: '#confirm-order',
        historyPanel: '.order-history-panel',
        scrollTopButton: '.order-history-scroll-top'
    },
    STORAGE_KEYS: {
        ORDER_HISTORY: 'burgercraft_order_history'
    },
    CLASSES: {
        hidden: 'hidden',
        active: 'active',
        error: 'error-state'
    },
    MESSAGES: {
        confirmOrder: 'Are you sure you want to place this order?',
        orderSuccess: 'Order placed successfully!',
        storageError: 'Failed to save order history'
    },
    TIMINGS: {
        autoClose: 6000,
        transition: 300
    }
};
```

---

## 2. Order Management Implementation

### Persistent Storage Pattern (`orderPlace.js`)

```javascript
class OrderConfirmationManager {
    constructor() {
        this.CONFIG = CONFIG; // Import shared config
        this.init();
    }

    // Store order with error handling
    storeOrderData(orderData) {
        try {
            const history = this.getOrderHistory();
            const orderWithMetadata = {
                ...orderData,
                id: Date.now(),
                timestamp: new Date().toISOString(),
                status: 'completed'
            };

            history.push(orderWithMetadata);

            // Check storage quota
            const dataString = JSON.stringify(history);
            if (dataString.length > 5000000) { // 5MB limit
                history.shift(); // Remove oldest order
            }

            localStorage.setItem(
                this.CONFIG.STORAGE_KEYS.ORDER_HISTORY,
                JSON.stringify(history)
            );

            return true;
        } catch (error) {
            console.error('Storage error:', error);
            this.showStorageError();
            return false;
        }
    }

    // Retrieve order history with validation
    getOrderHistory() {
        try {
            const stored = localStorage.getItem(
                this.CONFIG.STORAGE_KEYS.ORDER_HISTORY
            );
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to retrieve order history:', error);
            return [];
        }
    }

    // Remove specific order
    removeOrderFromHistory(orderId) {
        const history = this.getOrderHistory();
        const filtered = history.filter(order => order.id !== orderId);

        try {
            localStorage.setItem(
                this.CONFIG.STORAGE_KEYS.ORDER_HISTORY,
                JSON.stringify(filtered)
            );
            return true;
        } catch (error) {
            console.error('Failed to remove order:', error);
            return false;
        }
    }
}
```

### Form Orchestration Pattern (`orderNowForm.js`)

```javascript
class OrderFormManager {
    constructor() {
        this.state = {
            isVisible: false,
            hasUnsavedChanges: false,
            activeModal: null
        };
        this.init();
    }

    init() {
        this.cacheElements();
        this.attachEventListeners();
        this.setupOrderHistory();
        this.setupScrollToTop();
    }

    // Comprehensive element caching
    cacheElements() {
        this.elements = {
            orderForm: document.querySelector(this.CONFIG.SELECTORS.orderForm),
            confirmButton: document.getElementById('confirm-order'),
            historyButton: document.querySelector('.order-history-btn'),
            historyPanel: null, // Created dynamically
            historyList: null,
            scrollTopBtn: null,
            // Form inputs
            fullName: document.getElementById('full-name'),
            phoneNumber: document.getElementById('phone-number'),
            deliveryAddress: document.getElementById('delivery-address')
        };
    }

    // Event delegation and binding
    attachEventListeners() {
        // Form events
        this.elements.confirmButton?.addEventListener('click',
            this.handleOrderConfirmation.bind(this));

        // History events
        this.elements.historyButton?.addEventListener('click',
            this.showOrderHistory.bind(this));

        // Dynamic element events (attached when created)
        document.addEventListener('click', this.handleGlobalClick.bind(this));
    }

    // Global click handler for dynamic elements
    handleGlobalClick(event) {
        const target = event.target;

        if (target.matches('.order-history-close')) {
            this.hideOrderHistory();
        } else if (target.matches('.order-delete-btn')) {
            const orderId = parseInt(target.dataset.orderId);
            this.deleteOrder(orderId);
        } else if (target.matches('.order-view-btn')) {
            const orderId = parseInt(target.dataset.orderId);
            this.viewOrder(orderId);
        }
    }
}
```

### Dynamic UI Creation Pattern

```javascript
createOrderHistoryPanel() {
    const panel = document.createElement('div');
    panel.className = 'order-history-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-labelledby', 'history-title');
    panel.innerHTML = `
        <div class="order-history-header">
            <h3 id="history-title">Order History</h3>
            <button class="order-history-close"
                    aria-label="Close order history"
                    type="button">×</button>
        </div>
        <div class="order-history-list" role="list"></div>
        <button class="order-history-scroll-top"
                style="display: none;"
                aria-label="Scroll to top of order history"
                type="button">
            ↑ Back to Top
        </button>
    `;

    // Cache references to dynamic elements
    this.elements.historyPanel = panel;
    this.elements.historyList = panel.querySelector('.order-history-list');
    this.elements.scrollTopBtn = panel.querySelector('.order-history-scroll-top');

    return panel;
}
```

---

## 3. Navigation & Transitions

### View Transitions API Implementation

```javascript
// Smooth navigation with fallback
async navigateToViewFullMenu() {
    try {
        if ('startViewTransition' in document) {
            // Modern browsers with View Transitions
            const transition = document.startViewTransition(() => {
                this.hideOrderForm();
                return this.showFullMenu();
            });

            await transition.finished;
        } else {
            // Fallback for older browsers
            this.hideOrderForm();
            await this.showFullMenu();
        }
    } catch (error) {
        console.error('Navigation failed:', error);
        // Emergency fallback
        this.hideOrderForm();
        this.showFullMenu();
    }
}

hideOrderForm() {
    if (this.elements.orderForm) {
        this.elements.orderForm.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

async showFullMenu() {
    try {
        const { showFullMenu } = await import('../ViewFullMenuButton/viewfullmenu.js');
        showFullMenu();
    } catch (error) {
        console.error('Failed to load full menu:', error);
        this.showFallbackMenu();
    }
}
```

### Scroll-to-Top UX Pattern

```javascript
setupScrollToTop() {
    const list = this.elements.historyList;
    const scrollTopBtn = this.elements.scrollTopBtn;

    if (!list || !scrollTopBtn) return;

    // Throttled scroll handler
    let scrollTimeout;
    list.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const shouldShow = list.scrollTop > 100;
            scrollTopBtn.style.display = shouldShow ? 'block' : 'none';

            // Accessibility: Update aria-expanded
            scrollTopBtn.setAttribute('aria-expanded', shouldShow);
        }, 100);
    });

    // Smooth scroll behavior
    scrollTopBtn.addEventListener('click', () => {
        list.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        // Focus management
        scrollTopBtn.blur(); // Remove focus after click
    });
}
```

---

## 4. Error Handling & Validation

### Comprehensive Error Handling

```javascript
class ErrorHandler {
    static handleStorageError(error) {
        console.error('Storage operation failed:', error);

        // User-friendly error messages
        const messages = {
            QUOTA_EXCEEDED_ERR: 'Storage full. Please clear some data.',
            SECURITY_ERR: 'Storage access denied. Check privacy settings.',
            default: 'Failed to save data. Please try again.'
        };

        const message = messages[error.name] || messages.default;
        this.showUserError(message);
    }

    static handleNetworkError(error) {
        console.error('Network operation failed:', error);

        if (!navigator.onLine) {
            this.showUserError('No internet connection. Order saved locally.');
        } else {
            this.showUserError('Connection error. Please check your network.');
        }
    }

    static showUserError(message) {
        // Use error dialog system
        import('./errorDialog.js')
            .then(({ errorDialog }) => {
                errorDialog('Error', message);
            })
            .catch(() => {
                // Fallback: browser alert
                alert(message);
            });
    }
}
```

### Form Validation Framework

```javascript
class FormValidator {
    static validateRequired(value, fieldName) {
        if (!value || value.trim() === '') {
            throw new ValidationError(`${fieldName} is required`, fieldName);
        }
    }

    static validatePhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
            throw new ValidationError('Please enter a valid phone number', 'phone');
        }
    }

    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new ValidationError('Please enter a valid email address', 'email');
        }
    }

    static async validateForm(formData) {
        const errors = [];

        try {
            this.validateRequired(formData.fullName, 'Full Name');
            this.validateRequired(formData.phoneNumber, 'Phone Number');
            this.validateRequired(formData.deliveryAddress, 'Delivery Address');

            if (formData.email) {
                this.validateEmail(formData.email);
            }

            this.validatePhone(formData.phoneNumber);

        } catch (error) {
            if (error instanceof ValidationError) {
                errors.push({
                    field: error.field,
                    message: error.message
                });
            } else {
                errors.push({
                    field: 'general',
                    message: 'Validation failed. Please check your input.'
                });
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

class ValidationError extends Error {
    constructor(message, field) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
    }
}
```

---

## 5. Performance Optimizations

### Memory Management

```javascript
class ComponentManager {
    constructor() {
        this.instances = new Map();
        this.eventListeners = new Set();
    }

    // Proper cleanup to prevent memory leaks
    destroy() {
        // Remove all event listeners
        this.eventListeners.forEach(({ element, type, handler }) => {
            element.removeEventListener(type, handler);
        });
        this.eventListeners.clear();

        // Clear DOM references
        this.elements = {};

        // Clear state
        this.state = {};

        // Remove from instances map
        this.instances.delete(this.constructor.name);
    }

    // Safe event listener addition with tracking
    addEventListener(element, type, handler, options = {}) {
        if (!element) return;

        element.addEventListener(type, handler, options);
        this.eventListeners.add({ element, type, handler });
    }
}
```

### Lazy Loading Pattern

```javascript
class LazyLoader {
    static async loadModule(modulePath) {
        try {
            const module = await import(modulePath);
            return module;
        } catch (error) {
            console.error(`Failed to load module ${modulePath}:`, error);
            throw error;
        }
    }

    static async loadComponent(componentName) {
        const modulePath = `../${componentName}/${componentName}.js`;
        return this.loadModule(modulePath);
    }

    // Preload critical modules
    static preloadCritical() {
        const criticalModules = [
            './orderPlace.js',
            './errorDialog.js'
        ];

        criticalModules.forEach(module => {
            import(module).catch(error =>
                console.warn(`Failed to preload ${module}:`, error)
            );
        });
    }
}
```

---

## 6. Accessibility Implementation

### ARIA Live Regions & Announcements

```javascript
class AccessibilityManager {
    static announce(message, priority = 'polite') {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;

        document.body.appendChild(announcement);

        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    static updateLiveRegion(regionId, message) {
        const region = document.getElementById(regionId);
        if (region) {
            region.textContent = message;
        }
    }
}

// Usage in order management
storeOrderData(orderData) {
    // ... storage logic ...

    AccessibilityManager.announce('Order saved successfully');
}
```

### Focus Management

```javascript
class FocusManager {
    static trapFocus(container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTabKey = (event) => {
            if (event.key === 'Tab') {
                if (event.shiftKey) {
                    if (document.activeElement === firstElement) {
                        event.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        event.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        container.addEventListener('keydown', handleTabKey);

        // Return cleanup function
        return () => container.removeEventListener('keydown', handleTabKey);
    }

    static restoreFocus(previousElement) {
        if (previousElement && previousElement.focus) {
            previousElement.focus();
        }
    }
}
```

---

## 7. Testing Patterns

### Unit Testing Structure

```javascript
// orderPlace.test.js
import { OrderConfirmationManager } from './orderPlace.js';

describe('OrderConfirmationManager', () => {
    let manager;
    let mockLocalStorage;

    beforeEach(() => {
        mockLocalStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn()
        };
        Object.defineProperty(window, 'localStorage', {
            value: mockLocalStorage
        });

        manager = new OrderConfirmationManager();
    });

    describe('storeOrderData', () => {
        it('should store order data successfully', () => {
            const orderData = { items: ['burger'], total: 10.99 };
            mockLocalStorage.getItem.mockReturnValue('[]');

            const result = manager.storeOrderData(orderData);

            expect(result).toBe(true);
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'burgercraft_order_history',
                expect.stringContaining('"items":["burger"]')
            );
        });

        it('should handle storage quota exceeded', () => {
            const largeOrder = { items: new Array(100000).fill('item') };
            mockLocalStorage.setItem.mockImplementation(() => {
                throw new DOMException('Quota exceeded', 'QuotaExceededError');
            });

            const result = manager.storeOrderData(largeOrder);

            expect(result).toBe(false);
        });
    });
});
```

### Integration Testing

```javascript
// orderFlow.test.js
describe('Order Flow Integration', () => {
    it('should complete full order flow', async () => {
        // Setup
        const formManager = new OrderFormManager();
        const confirmationManager = new OrderConfirmationManager();

        // Simulate user input
        formManager.elements.fullName.value = 'John Doe';
        formManager.elements.phoneNumber.value = '123-456-7890';
        formManager.elements.deliveryAddress.value = '123 Main St';

        // Trigger order confirmation
        formManager.elements.confirmButton.click();

        // Verify order was stored
        const history = confirmationManager.getOrderHistory();
        expect(history).toHaveLength(1);
        expect(history[0].fullName).toBe('John Doe');

        // Verify UI updates
        expect(formManager.elements.orderForm.style.display).toBe('none');
    });
});
```

---

## 8. Code Quality Standards

### JSDoc Documentation

```javascript
/**
 * Manages order confirmation and persistent storage
 * @class OrderConfirmationManager
 */
class OrderConfirmationManager {
    /**
     * Creates an instance of OrderConfirmationManager
     * @constructor
     */
    constructor() {
        // ...
    }

    /**
     * Stores order data in localStorage with error handling
     * @param {Object} orderData - The order data to store
     * @param {string} orderData.fullName - Customer's full name
     * @param {string} orderData.phoneNumber - Customer's phone number
     * @param {string} orderData.deliveryAddress - Delivery address
     * @param {Array} orderData.items - Ordered items
     * @param {number} orderData.total - Order total
     * @returns {boolean} Success status
     * @throws {StorageError} When localStorage operations fail
     */
    storeOrderData(orderData) {
        // ... implementation
    }
}
```

### Naming Conventions

```javascript
// ✅ Good naming
class OrderFormManager {
    handleOrderConfirmation() {}
    validateFormData() {}
    createOrderHistoryPanel() {}
    setupScrollToTop() {}
}

// ❌ Avoid
class orderForm {           // PascalCase for classes
    orderConfirm() {}       // camelCase for methods
    validate() {}           // Descriptive names
    createPanel() {}        // Specific names
    setupScroll() {}        // Complete names
}
```

---

## 9. Deployment & Maintenance

### Build Configuration

```javascript
// webpack.config.js or vite.config.js
export default {
    build: {
        target: 'es2015',
        minify: 'terser',
        sourcemap: true
    },
    optimizeDeps: {
        include: [
            // Pre-bundle critical dependencies
            'localStorage-polyfill'
        ]
    }
};
```

### Performance Monitoring

```javascript
class PerformanceMonitor {
    static measureExecutionTime(label, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();

        console.log(`${label} took ${end - start}ms`);
        return result;
    }

    static trackUserInteractions() {
        document.addEventListener('click', (event) => {
            const element = event.target;
            if (element.matches('button, a, [role="button"]')) {
                // Track button clicks
                this.sendAnalytics('button_click', {
                    element: element.tagName,
                    className: element.className,
                    text: element.textContent?.trim()
                });
            }
        });
    }
}
```

---

This guide reflects the actual implementation patterns used throughout the BurgerCraft project. All code examples are based on the working codebase as of April 7, 2026.
    FORM_SELECTOR: '.order-now-form',
    EXIT_BUTTON_ID: 'exit',
    CONFIRM_BUTTON_ID: 'confirm-order',
    DISPLAY_FLEX: 'flex',
    DISPLAY_NONE: 'none',
    OVERFLOW_HIDDEN: 'hidden',
    OVERFLOW_AUTO: 'auto',
};

// Clear, descriptive variable names
const userFullNameInput = document.getElementById('full-name');
const userPhoneNumberInput = document.getElementById('phone-number');
const deliveryAddressInput = document.getElementById('delivery-address');
```

### 3. **Error Handling**

#### Current Issues
- No try-catch blocks
- Silent failures
- No validation feedback

#### Recommendations
```javascript
// ✅ Better error handling
class FormValidator {
    static validatePhoneNumber(phoneNumber) {
        const phoneRegex = /^[+]?[\d\s\-()]+$/;
        return phoneRegex.test(phoneNumber);
    }

    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validateName(name) {
        return name.trim().length >= 2;
    }

    static validate(formData) {
        const errors = [];

        if (!this.validateName(formData.fullName)) {
            errors.push('Full name must be at least 2 characters');
        }

        if (!this.validatePhoneNumber(formData.phoneNumber)) {
            errors.push('Please enter a valid phone number');
        }

        if (!formData.deliveryAddress.trim()) {
            errors.push('Delivery address is required');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}
```

### 4. **Event Management**

#### Current Issues
- Event listeners added multiple times
- Unbounded `this` context
- Memory leaks from persistent listeners

#### Recommendations
```javascript
// ✅ Better event management
class EventManager {
    constructor() {
        this.listeners = new Map();
    }

    on(element, eventType, handler) {
        const key = element + eventType;
        this.listeners.set(key, { element, eventType, handler });
        element.addEventListener(eventType, handler);
    }

    off(element, eventType) {
        const key = element + eventType;
        const listener = this.listeners.get(key);
        if (listener) {
            element.removeEventListener(eventType, listener.handler);
            this.listeners.delete(key);
        }
    }

    offAll() {
        this.listeners.forEach(({ element, eventType, handler }) => {
            element.removeEventListener(eventType, handler);
        });
        this.listeners.clear();
    }
}
```

### 5. **DOM Query Caching**

#### Current Issues
- Repeated DOM queries
- No caching of elements
- Performance overhead

#### Recommendations
```javascript
// ✅ Cache DOM elements
class DOMCache {
    constructor() {
        this.cache = new Map();
    }

    getElementById(id) {
        if (!this.cache.has(id)) {
            this.cache.set(id, document.getElementById(id));
        }
        return this.cache.get(id);
    }

    querySelector(selector) {
        if (!this.cache.has(selector)) {
            this.cache.set(selector, document.querySelector(selector));
        }
        return this.cache.get(selector);
    }

    querySelectorAll(selector) {
        if (!this.cache.has(selector)) {
            this.cache.set(selector, document.querySelectorAll(selector));
        }
        return this.cache.get(selector);
    }

    clear() {
        this.cache.clear();
    }
}
```

### 6. **Async Operations**

#### Current Issues
- No async/await usage
- Callback hell potential
- No promise chaining

#### Recommendations
```javascript
// ✅ Use async/await for asynchronous operations
class OrderService {
    async submitOrder(orderData) {
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Order submission failed:', error);
            throw error;
        }
    }
}
```

### 7. **Testing Readiness**

#### Recommendations
```javascript
// ✅ Structure code for easier testing
// Separate concerns: UI logic, business logic, API calls

class OrderManager {
    constructor(apiService, uiManager, validator) {
        this.apiService = apiService;
        this.uiManager = uiManager;
        this.validator = validator;
    }

    async placeOrder(orderData) {
        // Test: Can validate without UI
        const validation = this.validator.validate(orderData);
        if (!validation.isValid) {
            this.uiManager.showErrors(validation.errors);
            return;
        }

        // Test: Can submit without UI
        try {
            const result = await this.apiService.submitOrder(orderData);
            this.uiManager.showSuccess('Order placed successfully!');
            return result;
        } catch (error) {
            this.uiManager.showError('Failed to place order');
            throw error;
        }
    }
}
```

### 8. **Documentation**

#### Recommendations
```javascript
/**
 * OrderFormManager - Manages order form interactions and validation
 * 
 * @class OrderFormManager
 * @example
 * const manager = new OrderFormManager();
 * manager.showForm();
 * manager.submitOrder(formData);
 */
class OrderFormManager {
    /**
     * Show the order form dialog
     * @method showForm
     * @returns {void}
     */
    showForm() {
        // Implementation
    }

    /**
     * Validate form data
     * @method validateForm
     * @param {Object} formData - The form data to validate
     * @param {string} formData.fullName - User full name
     * @param {string} formData.phoneNumber - User phone number
     * @param {string} formData.deliveryAddress - Delivery address
     * @returns {Object} Validation result with isValid and errors array
     */
    validateForm(formData) {
        // Implementation
    }
}
```

## File Structure Recommendations

```
script/
├── core/
│   ├── OrderManager.js           (Main orchestrator)
│   ├── FormValidator.js          (Validation logic)
│   └── OrderService.js           (API operations)
├── ui/
│   ├── OrderFormUI.js            (Form UI management)
│   ├── MenuUI.js                 (Menu display)
│   └── DialogUI.js               (Dialog management)
├── utils/
│   ├── DOMCache.js               (DOM query caching)
│   ├── EventManager.js           (Event delegation)
│   └── constants.js              (App constants)
├── modules/
│   ├── cardOperations.js         (Cart functionality)
│   ├── checkoutOperations.js     (Checkout flow)
│   └── menuOperations.js         (Menu operations)
└── app.js                        (Entry point)
```

## Performance Tips

1. **Debounce Event Handlers**
```javascript
function debounce(fn, delay = 300) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}
```

2. **Use Event Delegation**
```javascript
document.addEventListener('click', (event) => {
    if (event.target.matches('.add-to-cart')) {
        handleAddToCart(event.target);
    }
});
```

3. **Avoid Layout Thrashing**
```javascript
// ❌ Bad: Multiple reflows
for (let i = 0; i < items.length; i++) {
    element.style.width = item.width + 'px';
}

// ✅ Good: Batch DOM changes
const fragment = document.createDocumentFragment();
items.forEach(item => {
    const el = createItem(item);
    fragment.appendChild(el);
});
container.appendChild(fragment);
```

## Accessibility Considerations

1. **Focus Management**
```javascript
// Trap focus in modals
function setupFocusTrap(modalElement) {
    const focusableElements = modalElement.querySelectorAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex=\"-1\"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    modalElement.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    });
}
```

2. **ARIA Updates**
```javascript
function updateCartCount(count) {
    const cartButton = document.getElementById('cart');
    cartButton.setAttribute('aria-label', `Cart with ${count} items`);
    cartButton.setAttribute('aria-busy', 'false');
}
```

## Next Steps

1. Refactor module organization using class-based architecture
2. Add comprehensive error handling
3. Implement form validation framework
4. Add unit tests
5. Document all public methods
6. Performance profiling and optimization
7. Accessibility audit and fixes
