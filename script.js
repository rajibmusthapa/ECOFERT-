let cart = JSON.parse(localStorage.getItem('escfert_cart')) || {};
let orders = JSON.parse(localStorage.getItem('escfert_orders')) || [];

const PRODUCTS = {
    padat1: { name: 'Pupuk Padat Organik 1kg', price: 15000, type: 'padat' },
    padat5: { name: 'Pupuk Padat Organik 5kg', price: 75000, type: 'padat' },
    cair: { name: 'Pupuk Cair Organik 1L', price: 30000, type: 'cair' }
};

function showToast(msg, type = 'success') {
    let toast = document.getElementById('toast');
    if (!toast) { toast = document.createElement('div'); toast.id = 'toast'; toast.className = 'toast'; document.body.appendChild(toast); }
    toast.textContent = msg;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.className = 'toast', 3000);
}

function changeQty(productId, change) {
    let el = document.getElementById(productId + 'Qty');
    if (el) { let val = parseInt(el.textContent); val = Math.max(1, Math.min(99, val + change)); el.textContent = val; }
}

function addToCart(productId) {
    let qtyEl = document.getElementById(productId + 'Qty');
    let qty = qtyEl ? parseInt(qtyEl.textContent) : 1;
    let product = PRODUCTS[productId];
    if (!product) return;
    if (cart[productId]) { cart[productId].qty += qty; } 
    else { cart[productId] = { ...product, qty: qty }; }
    localStorage.setItem('escfert_cart', JSON.stringify(cart));
    updateCartCount();
    showToast(`✅ ${product.name} ditambahkan! (Total: ${cart[productId].qty})`);
    if (qtyEl) qtyEl.textContent = '1';
}

function updateCartCount() {
    let total = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
    let badge = document.getElementById('headerCartCount');
    if (badge) { badge.textContent = total; badge.style.display = total === 0 ? 'none' : 'flex'; badge.setAttribute('data-count', total); }
}

function viewCart() {
    if (Object.keys(cart).length === 0) { showToast('Keranjang kosong 😅', 'warning'); return; }
    let existingModal = document.getElementById('ecCartModal');
    if (existingModal) existingModal.remove();
    let total = 0, itemsHtml = '';
    for (let id in cart) {
        let item = cart[id];
        let subtotal = item.qty * item.price;
        total += subtotal;
        itemsHtml += `<div class="cart-item"><div class="cart-item-left"><div class="cart-item-icon ${item.type}"></div><div><h4>${item.name}</h4><p>${item.qty} × Rp${item.price.toLocaleString()}</p></div></div><div class="cart-item-right"><div class="cart-price">Rp${subtotal.toLocaleString()}</div><div class="cart-qty-controls"><button onclick="cartChangeQty('${id}', -1)">-</button><span class="cart-qty-num">${item.qty}</span><button onclick="cartChangeQty('${id}', 1)">+</button></div><button class="cart-remove-btn" onclick="cartRemoveItem('${id}')">Hapus</button></div></div>`;
    }
    let modalHtml = `<div id="ecCartModal"><div class="cart-overlay" onclick="closeCartModal()"></div><div class="cart-content"><div class="cart-header"><h3>🛒 Keranjang Belanja</h3><button class="close-btn" onclick="closeCartModal()">×</button></div><div class="cart-items">${itemsHtml}</div><div class="cart-footer"><div class="total-row"><span>Total Belanja:</span><strong>Rp${total.toLocaleString()}</strong></div><button class="btn-checkout" onclick="cartCheckout()">💬 Checkout WhatsApp</button><button class="btn-clear" onclick="cartClearAll()">🗑️ Kosongkan Keranjang</button></div></div></div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function cartChangeQty(productId, change) {
    if (!cart[productId]) return;
    let newQty = cart[productId].qty + change;
    if (newQty <= 0) { delete cart[productId]; } else { cart[productId].qty = Math.min(99, newQty); }
    localStorage.setItem('escfert_cart', JSON.stringify(cart));
    updateCartCount();
    if (Object.keys(cart).length > 0) { viewCart(); } else { closeCartModal(); showToast('Keranjang kosong', 'warning'); }
}

function cartRemoveItem(productId) {
    if (confirm(`Hapus ${cart[productId]?.name} dari keranjang?`)) {
        delete cart[productId];
        localStorage.setItem('escfert_cart', JSON.stringify(cart));
        updateCartCount();
        if (Object.keys(cart).length > 0) { viewCart(); } else { closeCartModal(); showToast('Item dihapus', 'warning'); }
    }
}

function cartClearAll() {
    if (confirm('Kosongkan SEMUA item di keranjang?')) {
        cart = {};
        localStorage.setItem('escfert_cart', JSON.stringify(cart));
        updateCartCount();
        closeCartModal();
        showToast('Keranjang dikosongkan');
    }
}

function closeCartModal() {
    let modal = document.getElementById('ecCartModal');
    if (modal) modal.remove();
}

function cartCheckout() {
    if (Object.keys(cart).length === 0) { showToast('Keranjang kosong', 'warning'); return; }
    let message = `*🛒 PESANAN ESCOFERT ECOCYCLE*\n\n`;
    let total = 0;
    for (let id in cart) {
        let item = cart[id];
        let subtotal = item.qty * item.price;
        total += subtotal;
        message += `• ${item.name}\n  ${item.qty} × Rp${item.price.toLocaleString()} = Rp${subtotal.toLocaleString()}\n\n`;
    }
    message += `*TOTAL: Rp${total.toLocaleString()}*\n\n`;
    message += `📍 Alamat: [isi alamat lengkap]\n📞 No. HP: [isi nomor WhatsApp]\n⏰ ${new Date().toLocaleString('id-ID')}`;
    window.open(`https://wa.me/628211951858?text=${encodeURIComponent(message)}`, '_blank');
    orders.unshift({ id: 'ORD' + Date.now(), date: new Date().toISOString(), items: { ...cart }, total: total, status: 'Menunggu Konfirmasi' });
    localStorage.setItem('escfert_orders', JSON.stringify(orders.slice(0, 50)));
    cart = {};
    localStorage.setItem('escfert_cart', JSON.stringify(cart));
    updateCartCount();
    closeCartModal();
    showToast('✅ Pesanan terkirim ke WhatsApp!');
}

document.addEventListener('DOMContentLoaded', function() { console.log('✅ ESCOFERT App Ready'); updateCartCount(); });

window.changeQty = changeQty;
window.addToCart = addToCart;
window.viewCart = viewCart;
window.cartChangeQty = cartChangeQty;
window.cartRemoveItem = cartRemoveItem;
window.cartClearAll = cartClearAll;
window.closeCartModal = closeCartModal;
window.cartCheckout = cartCheckout;
