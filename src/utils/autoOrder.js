const fs = require('fs-extra');
const path = require('path');

// ========== KONFIGURASI ==========
const ORDERS_FILE = '/root/yeyeye/database/orders.json';
const USERS_FILE = '/root/yeyeye/database/users.json';
const LIMIT_PRICE = 500;

console.log('[AUTOORDER] Initialized');
console.log('[AUTOORDER] Orders file:', ORDERS_FILE);
console.log('[AUTOORDER] Orders file exists:', fs.existsSync(ORDERS_FILE));

// ========== FUNGSI ORDER ==========
function loadOrders() {
    if (!fs.existsSync(ORDERS_FILE)) {
        console.log('[AUTOORDER] Creating orders.json');
        fs.writeJsonSync(ORDERS_FILE, { orders: [], nextId: 1 });
    }
    return fs.readJsonSync(ORDERS_FILE);
}

function saveOrders(data) {
    fs.writeJsonSync(ORDERS_FILE, data, { spaces: 2 });
}

function createOrder(userId, userName, limitCount, totalPrice) {
    const db = loadOrders();
    const orderId = db.nextId || 1;
    const newOrder = {
        id: orderId,
        userId: userId,
        userName: userName,
        limitCount: limitCount,
        totalPrice: totalPrice,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    db.orders.push(newOrder);
    db.nextId = orderId + 1;
    saveOrders(db);
    console.log('[AUTOORDER] Order created:', newOrder);
    return newOrder;
}

function updateOrderStatus(orderId, status) {
    const db = loadOrders();
    const order = db.orders.find(o => o.id === orderId);
    if (order) {
        order.status = status;
        if (status === 'confirmed') {
            order.confirmedAt = new Date().toISOString();
        }
        saveOrders(db);
        console.log('[AUTOORDER] Order', orderId, 'status updated to', status);
        return true;
    }
    return false;
}

function getPendingOrders() {
    const db = loadOrders();
    return db.orders.filter(o => o.status === 'pending');
}

function getUserOrders(userId) {
    const db = loadOrders();
    return db.orders.filter(o => o.userId === userId);
}

function getOrderById(orderId) {
    const db = loadOrders();
    return db.orders.find(o => o.id === orderId);
}

// ========== FUNGSI USER LIMIT ==========
function loadUsers() {
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeJsonSync(USERS_FILE, { users: [] });
    }
    return fs.readJsonSync(USERS_FILE);
}

function saveUsers(data) {
    fs.writeJsonSync(USERS_FILE, data, { spaces: 2 });
}

function getUserLimit(userId) {
    const db = loadUsers();
    const user = db.users.find(u => u.id === userId);
    return user?.limit || 0;
}

function addUserLimit(userId, amount) {
    const db = loadUsers();
    let user = db.users.find(u => u.id === userId);
    if (!user) {
        user = { id: userId, limit: 0 };
        db.users.push(user);
    }
    user.limit = (user.limit || 0) + amount;
    saveUsers(db);
    console.log('[AUTOORDER] User', userId, 'limit +', amount, 'total:', user.limit);
    return user.limit;
}

function calculatePrice(limitCount) {
    return limitCount * LIMIT_PRICE;
}

// ========== EXPORT MODULE ==========
module.exports = {
    loadOrders,
    saveOrders,
    createOrder,
    updateOrderStatus,
    getPendingOrders,
    getUserOrders,
    getOrderById,
    getUserLimit,
    addUserLimit,
    calculatePrice,
    LIMIT_PRICE
};
