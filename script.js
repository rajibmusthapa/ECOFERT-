let cart = JSON.parse(localStorage.getItem('ecfert-cart')) || [];

function addToCart(name, price) {
    cart.push({name, price, qty: 1});
    localStorage.setItem('ecfert-cart', JSON.stringify(cart));
    updateCart();
    alert(`${name} ditambahkan ke keranjang! ✅`);
}

function updateCart() {
    document.getElementById('cart-count').textContent = cart.reduce((sum, item) => sum + item.qty, 0);
}

function viewCart() {
    if (cart.length === 0) {
        alert('Keranjang kosong!');
        return;
    }
    
    let message = 'Pesanan ECOFERT:\n\n';
    let total = 0;
    cart.forEach(item => {
        message += `${item.name} x${item.qty} = Rp${item.price * item.qty.toLocaleString()}\n`;
        total += item.price * item.qty;
    });
    message += `\nTotal: Rp${total.toLocaleString()}`;
    
    const waUrl = `https://wa.me/628123456789?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
}

// Load cart on page load
updateCart();
