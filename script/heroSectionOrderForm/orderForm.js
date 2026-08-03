const CONFIG = {
    SELECTORS: {
        ORDER_NOW_BTN: '#order-now-btn',
    }
};


let orderNow = null;

function initializeButtons() {
    orderNow = document.getElementById(CONFIG.SELECTORS.ORDER_NOW_BTN.slice(1));

    if (!orderNow) {
        console.warn(`Button not found: ${CONFIG.SELECTORS.ORDER_NOW_BTN}`);
    }
}

initializeButtons();

function getOrderNowButton() {
    return orderNow;
}


export { orderNow };

export { getOrderNowButton };


