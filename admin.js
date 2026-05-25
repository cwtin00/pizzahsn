import { products } from "./products.js";

import {
    db,
    ref,
    set,
    onValue
} from "./firebase.js";


import {
    getAuth,
    onAuthStateChanged
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const auth = getAuth();

onAuthStateChanged(auth,(user)=>{

    if(!user){

        window.location.href =
        "login.html";

    }

});

// AKTİF MASA

let currentTable = null;


// AKTİF KATEGORİ

let currentCategory = "all";


// ELEMENTLER

const tableButtons =
document.querySelectorAll(".table-card");

const orderList =
document.querySelector(".order-list");

const totalText =
document.querySelector(".total-box h2");

const productsGrid =
document.querySelector(".products-grid");

const categoryButtons =
document.querySelectorAll(".cat-btn");

const clearBtn =
document.querySelector(".clear-btn");

const cashBtn =
document.querySelector(".cash-btn");

const cardBtn =
document.querySelector(".card-btn");

const orderNote =
document.querySelector(".order-note");

const printBtn =
document.querySelector(".print-btn");


// FIREBASE

const ordersRef =
ref(db,"orders");


// TÜM MASALAR

let tableOrders = {};




// KATEGORİ SEÇ

categoryButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        categoryButtons.forEach(btn=>{
            btn.classList.remove("active");
        });

        button.classList.add("active");

        currentCategory =
        button.dataset.category;

        renderProducts();

    });

});




// ÜRÜNLERİ ÇİZ

function renderProducts(){

    productsGrid.innerHTML = "";

    let filteredProducts = products;

    if(currentCategory !== "all"){

        filteredProducts =
        products.filter(product =>
            product.group.toUpperCase() === currentCategory.toUpperCase()
            ||
            product.category.toUpperCase() === currentCategory.toUpperCase()
        );

    }



    // MENÜLER İÇİN BAŞLIKLI GÖSTERİM

    if(currentCategory === "Menüler"){

        const menuGroups = {

            "Küçük Boy":[],
            "Orta Boy":[],
            "Büyük Boy":[],
            "İkili Menü":[]

        };



        filteredProducts.forEach(product=>{

            if(product.menuType){

                menuGroups[product.menuType].push(product);

            }

        });



        Object.keys(menuGroups).forEach(group=>{

            if(menuGroups[group].length <= 0){

                return;

            }

            productsGrid.innerHTML += `

            <div class="menu-title">
                ${group} Menüleri
            </div>

            `;



            menuGroups[group].forEach(product=>{

                productsGrid.innerHTML += `

                <div class="product-card">

                    <h3>${product.name}</h3>

                    <div class="size-list">

                        <button
                            class="size-btn"
                            data-name="${product.name}"
                            data-price="${product.price}"
                        >

                            <span>Menü</span>

                            <b>${product.price} TL</b>

                        </button>

                    </div>

                </div>

                `;

            });

        });

        return;

    }



    // NORMAL ÜRÜNLER

    filteredProducts.forEach(product => {

        productsGrid.innerHTML += `

        <div class="product-card">

            <h3>${product.name}</h3>

            <div class="size-list">

                ${
                    product.sizes
                    ?

                    product.sizes.map(size => `

                        <button 
                            class="size-btn"
                            data-name="${product.name} ${size.size}"
                            data-price="${size.price}"
                        >

                            <span>${size.size}</span>

                            <b>${size.price} TL</b>

                        </button>

                    `).join("")

                    :

                    `

                    <button
                        class="size-btn"
                        data-name="${product.name}"
                        data-price="${product.price}"
                    >

                        <span>Ürün</span>

                        <b>${product.price} TL</b>

                    </button>

                    `
                }

            </div>

        </div>

        `;

    });

}

renderProducts();




// MASA SEÇ

tableButtons.forEach(button => {

    button.addEventListener("click",()=>{

        tableButtons.forEach(btn=>{
            btn.classList.remove("active");
        });

        button.classList.add("active");

        currentTable =
        button.querySelector("span").innerText;

        renderCart();

    });

});




// ÜRÜN EKLE

document.addEventListener("click",(e)=>{

    const productCard =
    e.target.closest(".size-btn");

    if(productCard){

        if(!currentTable){

            alert("Önce masa seç");

            return;

        }

        const name =
        productCard.dataset.name;

        const price =
        parseInt(productCard.dataset.price);

        if(!tableOrders[currentTable]){

            tableOrders[currentTable] = [];

        }

        addToCart(
            tableOrders[currentTable],
            name,
            price
        );

        renderCart();

        updateTableStatus();

        saveOrders();

    }

});




// SEPETE EKLE

function addToCart(cart,name,price){

    const existing =
    cart.find(item => item.name === name);

    if(existing){

        existing.qty++;

    }else{

        cart.push({
            name,
            price,
            qty:1
        });

    }

}




// ADİSYON ÇİZ

function renderCart(){

    orderList.innerHTML = "";

    if(!currentTable){

        totalText.innerText = "0 TL";

        return;

    }

    const cart =
    tableOrders[currentTable] || [];

    let total = 0;

    cart.forEach((item,index)=>{

        total += item.price * item.qty;

        orderList.innerHTML += `

        <div class="order-item">

            <div class="order-left">

                <h4>${item.name}</h4>

                <span>
                    ${item.price} TL
                </span>

            </div>

            <div class="order-right">

<div class="qty-controls">

    <button onclick="decreaseQty(${index})">
        -
    </button>

    <span>${item.qty}</span>

    <button onclick="increaseQty(${index})">
        +
    </button>

    <button onclick="changePrice(${index})">

        💰

    </button>

</div>

                <strong>
                    ${item.price * item.qty} TL
                </strong>

            </div>

        </div>

        `;

    });

    totalText.innerText =
    total + " TL";

}




// FIREBASE KAYDET

function saveOrders(){

    set(ordersRef,tableOrders);

}




// MİKTAR ARTIR

window.increaseQty = function(index){

    const cart =
    tableOrders[currentTable];

    cart[index].qty++;

    renderCart();

    updateTableStatus();

    saveOrders();

}

window.changePrice = function(index){

    const cart =
    tableOrders[currentTable];

    const newPrice =
    prompt(
        "Yeni fiyat gir",
        cart[index].price
    );

    if(!newPrice){

        return;

    }

const parsedPrice =
parseInt(newPrice);

if(isNaN(parsedPrice) || parsedPrice < 0){

    alert("Geçerli fiyat gir");

    return;

}

cart[index].price =
parsedPrice;

    renderCart();

    saveOrders();

}


// MİKTAR AZALT

window.decreaseQty = function(index){

    const cart =
    tableOrders[currentTable];

    cart[index].qty--;

    if(cart[index].qty <= 0){

        cart.splice(index,1);

    }

    renderCart();

    updateTableStatus();

    saveOrders();

}




// ADİSYONU TEMİZLE

clearBtn.addEventListener("click",()=>{

    if(!currentTable){

        return;

    }

    tableOrders[currentTable] = [];

    renderCart();

    updateTableStatus();

    saveOrders();

});




// MASA DURUMU

function updateTableStatus(){

    tableButtons.forEach(button=>{

        const tableName =
        button.querySelector("span").innerText;

        const cart =
        tableOrders[tableName] || [];

        if(cart.length > 0){

            button.style.background =
            "linear-gradient(135deg,#ff2d2d,#ba2828)";

            button.querySelector("small")
            .innerText = "Dolu";

        }else{

            if(button.classList.contains("order-table")){

                button.style.background =
                "linear-gradient(135deg,#ff9800,#ff6f00)";

            }else{

                button.style.background =
                "linear-gradient(135deg,#16a34a,#22c55e)";

            }

            button.querySelector("small")
            .innerText = "Boş";

        }

    });

}




// SATIŞ TAMAMLAMA

function completePayment(type){

    if(!currentTable){

        return;

    }

    const cart =
    tableOrders[currentTable] || [];

    if(cart.length <= 0){

        return;

    }

    let total = 0;

    cart.forEach(item=>{

        total += item.price * item.qty;

    });

    const salesRef =
    ref(db,"sales/" + Date.now());

set(salesRef,{

    table:currentTable,

    total:total,

    type:type,

    items:cart,

    date:new Date().toISOString()

});


    // MASAYI TEMİZLE

    tableOrders[currentTable] = [];

    renderCart();

    updateTableStatus();

    saveOrders();

}



// NAKİT ÖDEME

cashBtn.addEventListener("click",()=>{

    completePayment("cash");

});



// KART ÖDEME

cardBtn.addEventListener("click",()=>{

    completePayment("card");

});




// FIREBASE'DEN ÇEK

onValue(ordersRef,(snapshot)=>{

    const data = snapshot.val();

    if(data){

        tableOrders = data;

    }

    updateTableStatus();

    renderCart();

});

printBtn.addEventListener("click",()=>{

    if(!currentTable){

        return;

    }

    const cart =
    tableOrders[currentTable] || [];

    if(cart.length <= 0){

        return;

    }

    let total = 0;

    cart.forEach(item=>{

        total += item.price * item.qty;

    });

    const encodedItems =
    encodeURIComponent(
        JSON.stringify(cart)
    );

    const encodedNote =
encodeURIComponent(
    orderNote.value
);

window.open(

    `fis.html?table=${currentTable}
    &total=${total}
    &items=${encodedItems}
    &note=${encodedNote}`,

    "_blank"

);

});