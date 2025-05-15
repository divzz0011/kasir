let cart = [];

function addItem() {
    const nameInput = document.getElementById("itemName");
    const priceInput = document.getElementById("itemPrice");
    const quantityInput = document.getElementById("itemQuantity");

    const name = nameInput.value;
    const price = parseFloat(priceInput.value);
    const quantity = parseInt(quantityInput.value);

    if (!name || isNaN(price) || isNaN(quantity) || price <= 0 || quantity <= 0) return;

    cart.push({ name, price, quantity });
    renderCart();
    calculateTotals();

    // Kosongkan input setelah ditambahkan
    nameInput.value = "";
    priceInput.value = "";
    quantityInput.value = "";
}

function renderCart() {
    const tbody = document.querySelector("#cartTable tbody");
    tbody.innerHTML = "";

    cart.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.name}</td>
            <td>Rp ${item.price.toLocaleString()}</td>
            <td>${item.quantity}</td>
            <td>Rp ${(item.price * item.quantity).toLocaleString()}</td>
            <td><button onclick="removeItem(${index})">Hapus</button></td>
        `;
        tbody.appendChild(row);
    });
}

function removeItem(index) {
    cart.splice(index, 1);
    renderCart();
    calculateTotals();
}

function calculateTotals() {
    let subtotal = 0;
    cart.forEach(item => subtotal += item.price * item.quantity);

    const tax = subtotal * (getTaxRate() / 100);
    const total = subtotal + tax;

    document.getElementById("subtotal").textContent = `Subtotal: Rp ${subtotal.toLocaleString()}`;
    document.getElementById("tax").textContent = `Pajak (10%): Rp ${tax.toLocaleString()}`;
    document.getElementById("total").textContent = `Total: Rp ${total.toLocaleString()}`;

    calculateChange();
}

function calculateChange() {
    const paid = parseFloat(document.getElementById("paidAmount").value);
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    const change = paid - total;

    document.getElementById("changeAmount").textContent = `Kembalian: Rp ${change >= 0 ? change.toLocaleString() : 0}`;
}

function generateTransactionId() {
    const now = new Date();
    return 'TRX' + now.getTime();
}

function printReceipt() {
    const receipt = document.getElementById("receipt");
    const content = document.getElementById("receiptContent");
    const paid = parseFloat(document.getElementById("paidAmount").value);

    const storeName = document.querySelector(".header h1").innerText;
    const storeAddress = document.querySelector(".header p").innerText;

    document.getElementById("receiptStoreName").innerText = storeName;
    document.getElementById("receiptStoreAddress").innerText = storeAddress;

    const date = new Date();
    document.getElementById("receiptDate").textContent = `Tanggal: ${date.toLocaleString()}`;

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    const change = paid - total;

    content.innerHTML = "";
    cart.forEach(item => {
        const itemLine = document.createElement("div");
        itemLine.textContent = `${item.quantity}x ${item.name} - Rp ${(item.price * item.quantity).toLocaleString()}`;
        content.appendChild(itemLine);
    });

    document.getElementById("receiptSubtotal").textContent = `Subtotal: Rp ${subtotal.toLocaleString()}`;
    document.getElementById("receiptTax").textContent = `Pajak: Rp ${tax.toLocaleString()}`;
    document.getElementById("receiptTotal").textContent = `Total: Rp ${total.toLocaleString()}`;
    document.getElementById("receiptPaid").textContent = `Dibayar: Rp ${paid.toLocaleString()}`;
    document.getElementById("receiptChange").textContent = `Kembalian: Rp ${change >= 0 ? change.toLocaleString() : 0}`;

    const barcodeArea = document.getElementById("barcodeArea");
    const trxId = generateTransactionId();
    barcodeArea.innerHTML = `<img src="https://barcode.tec-it.com/barcode.ashx?data=${trxId}&code=Code128&dpi=96" alt="Barcode"><p>ID Transaksi: ${trxId}</p>`;

    // Tampilkan struk hanya saat print
    receipt.style.display = "block";

    // Sembunyikan elemen lain dan cetak
    const elementsToHide = document.querySelectorAll("body > *:not(#receipt)");
    elementsToHide.forEach(el => el.style.display = "none");

    // Print struk
    window.print();

    // Setelah cetak, kembalikan keadaan normal
    receipt.style.display = "none";
    elementsToHide.forEach(el => el.style.display = "");

    resetForm();
}

// Fokus otomatis ke input nama setelah tambah barang
function focusToNameInput() {
    document.getElementById("itemName").focus();
}

// Tangkap Enter saat mengetik input barang
document.getElementById("itemQuantity").addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        addItem();
        focusToNameInput();
    }
});

// Tangkap Enter pada input jumlah bayar
document.getElementById("paidAmount").addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        printReceipt();
    }
});

// Autofokus awal ke input nama saat halaman dimuat
window.addEventListener("DOMContentLoaded", () => {
    focusToNameInput();
});

// Navigasi Enter antar input
document.getElementById("itemName").addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        e.preventDefault(); // Hindari submit
        document.getElementById("itemPrice").focus();
    }
});

document.getElementById("itemPrice").addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        document.getElementById("itemQuantity").focus();
    }
});

document.getElementById("itemQuantity").addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        addItem();
        focusToNameInput(); // Fokus balik ke input pertama
    }
});

function resetForm() {
    // Kosongkan input
    document.getElementById("itemName").value = "";
    document.getElementById("itemPrice").value = "";
    document.getElementById("itemQuantity").value = "";
    document.getElementById("paidAmount").value = "";
    document.getElementById("changeAmount").textContent = "Kembalian: Rp 0";

    // Kosongkan cart dan render ulang
    cart = [];
    renderCart();
    calculateTotals();

    // Fokus kembali ke input nama
    focusToNameInput();
}

// Load pengaturan toko dari localStorage saat halaman dimuat
window.addEventListener("DOMContentLoaded", () => {
    loadStoreSettings();
    focusToNameInput();
});

// Toggle panel pengaturan
document.getElementById("toggleSettings").addEventListener("click", function () {
    const panel = document.getElementById("storeSettings");
    panel.style.display = panel.style.display === "none" ? "block" : "none";
});

// Simpan pengaturan toko
function saveStoreSettings() {
    const name = document.getElementById("storeNameInput").value;
    const address = document.getElementById("storeAddressInput").value;
    const taxRate = parseFloat(document.getElementById("taxRateInput").value);

    localStorage.setItem("storeName", name);
    localStorage.setItem("storeAddress", address);
    localStorage.setItem("taxRate", isNaN(taxRate) ? 10 : taxRate);

    document.querySelector(".header h1").innerText = name;
    document.querySelector(".header p").innerText = address;

    calculateTotals(); // perbarui pajak berdasarkan pengaturan

    document.getElementById("storeSettings").style.display = "none"; // <-- TUTUP PANEL DI SINI

    alert("Pengaturan berhasil disimpan!");
}

// Ambil pengaturan toko dari localStorage
function loadStoreSettings() {
    const name = localStorage.getItem("storeName") || "Divzz Store";
    const address = localStorage.getItem("storeAddress") || "Jl Terusan Buahbatu";
    const taxRate = parseFloat(localStorage.getItem("taxRate")) || 10;

    document.getElementById("storeNameInput").value = name;
    document.getElementById("storeAddressInput").value = address;
    document.getElementById("taxRateInput").value = taxRate;

    document.querySelector(".header h1").innerText = name;
    document.querySelector(".header p").innerText = address;
}

// Ambil pajak dari pengaturan toko
function getTaxRate() {
    return parseFloat(localStorage.getItem("taxRate")) || 10;
}
