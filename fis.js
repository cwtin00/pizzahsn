const receiptTable =
document.getElementById("receipt-table");

const receiptItems =
document.getElementById("receipt-items");

const receiptTotal =
document.getElementById("receipt-total");

const paymentType =
document.getElementById("payment-type");

const receiptDate =
document.getElementById("receipt-date");


// URL VERİLERİ

const params =
new URLSearchParams(window.location.search);

const table =
params.get("table");

const total =
params.get("total");

const payment =
params.get("payment");

const note =
params.get("note");

const items =
JSON.parse(
    decodeURIComponent(
        params.get("items")
    )
);


// MASA

receiptTable.innerText =
table;


// ÜRÜNLER

items.forEach(item=>{

    receiptItems.innerHTML += `

    <div class="item">

        <span>
            ${item.qty}x ${item.name}
        </span>

        <strong>
            ${item.price * item.qty} TL
        </strong>

    </div>

    `;

});


// NOT / ADRES

if(note){

    receiptItems.innerHTML += `

    <div class="line"></div>

    <div class="item">

        <span>
            Sipariş Notu
        </span>

    </div>

    <div class="note">

        ${note}

    </div>

    `;

}


// TOPLAM

receiptTotal.innerText =
total + " TL";


// ÖDEME TİPİ

paymentType.innerText =
payment === "cash"
?
"Nakit Ödeme"
:
"Kart Ödeme";


// TARİH

receiptDate.innerText =
new Date().toLocaleString();


// OTOMATİK YAZDIR

window.onload = ()=>{

    window.print();

};