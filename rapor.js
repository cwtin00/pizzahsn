import {
    db,
    ref,
    onValue,
    set
} from "./firebase.js";


// ELEMENTLER

const totalSalesText =
document.getElementById("total-sales");

const cashSalesText =
document.getElementById("cash-sales");

const cardSalesText =
document.getElementById("card-sales");

const orderCountText =
document.getElementById("order-count");

const resetBtn =
document.getElementById("reset-sales-btn");

const reportTabs =
document.querySelectorAll(".report-tab");

const liveTime =
document.getElementById("live-time");

const reportTitle =
document.getElementById("report-title");

const reportDesc =
document.getElementById("report-desc");

const salesList =
document.querySelector(".sales-list");


// TARİH FİLTRE

const startDateInput =
document.getElementById("start-date");

const endDateInput =
document.getElementById("end-date");

const filterBtn =
document.getElementById("filter-btn");


// PDF

const pdfBtn =
document.getElementById("pdf-btn");


// FIREBASE

const salesRef =
ref(db,"sales");


// AKTİF RAPOR

let currentRange = "daily";

let customFilter = false;





// CANLI SAAT

function updateClock(){

    const now =
    new Date();

    const hour =
    String(now.getHours())
    .padStart(2,"0");

    const minute =
    String(now.getMinutes())
    .padStart(2,"0");

    liveTime.innerText =
    `${hour}:${minute}`;

}

updateClock();

setInterval(updateClock,1000);






// TAB DEĞİŞTİR

reportTabs.forEach(tab=>{

    tab.addEventListener("click",()=>{

        reportTabs.forEach(btn=>{

            btn.classList.remove("active");

        });

        tab.classList.add("active");

        currentRange =
        tab.dataset.range;

        customFilter = false;

        startDateInput.value = "";
        endDateInput.value = "";

        updateReportTitle();

        loadSales();

    });

});






// RAPOR BAŞLIK

function updateReportTitle(){

    if(currentRange === "daily"){

        reportTitle.innerText =
        "BUGÜNKÜ TOPLAM CİRO";

        reportDesc.innerText =
        "Günlük PİZZHSN satış performansı";

    }

    if(currentRange === "weekly"){

        reportTitle.innerText =
        "HAFTALIK TOPLAM CİRO";

        reportDesc.innerText =
        "Haftalık PİZZHSN satış performansı";

    }

    if(currentRange === "monthly"){

        reportTitle.innerText =
        "AYLIK TOPLAM CİRO";

        reportDesc.innerText =
        "Aylık PİZZHSN satış performansı";

    }

    if(currentRange === "yearly"){

        reportTitle.innerText =
        "YILLIK TOPLAM CİRO";

        reportDesc.innerText =
        "Yıllık PİZZHSN satış performansı";

    }

    if(customFilter){

        reportTitle.innerText =
        "ÖZEL TARİH RAPORU";

        reportDesc.innerText =
        "Seçilen tarihler arası satış performansı";

    }

}






// TARİH FİLTRELE

filterBtn.addEventListener("click",()=>{

    if(
        startDateInput.value
        &&
        endDateInput.value
    ){

        customFilter = true;

        updateReportTitle();

        loadSales();

    }

});







// TARİH KONTROL

function isInRange(saleDate){

    const now =
    new Date();

    const sale =
    new Date(saleDate);



    // ÖZEL TARİH

    if(customFilter){

        const start =
        new Date(startDateInput.value);

        const end =
        new Date(endDateInput.value);

        end.setHours(23,59,59,999);

        return sale >= start && sale <= end;

    }



    // GÜNLÜK

    if(currentRange === "daily"){

        return (

            sale.getDate() === now.getDate()

            &&

            sale.getMonth() === now.getMonth()

            &&

            sale.getFullYear() === now.getFullYear()

        );

    }



    // HAFTALIK

    if(currentRange === "weekly"){

        const diff =
        now - sale;

        const days =
        diff / (1000 * 60 * 60 * 24);

        return days <= 7;

    }



    // AYLIK

    if(currentRange === "monthly"){

        return (

            sale.getMonth() === now.getMonth()

            &&

            sale.getFullYear() === now.getFullYear()

        );

    }



    // YILLIK

    if(currentRange === "yearly"){

        return (

            sale.getFullYear() === now.getFullYear()

        );

    }

    return true;

}







// SATIŞLARI YÜKLE

function loadSales(){

    onValue(salesRef,(snapshot)=>{

        const data = snapshot.val();

        let totalSales = 0;

        let cashSales = 0;

        let cardSales = 0;

        let orderCount = 0;


        salesList.innerHTML = "";


        if(data){

            const salesArray =
            Object.values(data).reverse();



            salesArray.forEach(sale=>{

                if(!sale.date){

                    return;

                }

                if(!isInRange(sale.date)){

                    return;

                }

                totalSales += sale.total;

                orderCount++;

                if(sale.type === "cash"){

                    cashSales += sale.total;

                }

                if(sale.type === "card"){

                    cardSales += sale.total;

                }

                if(sale.type === "mixed"){

                  cashSales += sale.cash || 0;

                cardSales += sale.card || 0;

                }

            });




            // SON 5 SATIŞ

            salesArray
            .slice(0,5)
            .forEach(sale=>{

                const time =
                new Date(sale.date)
                .toLocaleTimeString("tr-TR",{
                    hour:"2-digit",
                    minute:"2-digit"
                });

                salesList.innerHTML += `

                <div class="sale-item">

                    <div class="sale-left">

                        <strong>
                            ${sale.table}
                        </strong>

                        <span>
                            ${
                            sale.type === "cash"
                            ?
                            "Nakit Ödeme"
                            :
                            sale.type === "card"
                            ?
                            "Kart Ödeme"
                            :
                            "Parçalı Ödeme"
                            }

                            • ${time}
                        </span>

                    </div>

                    <div class="sale-actions">

                        <h4>
                            ${sale.total} TL
                        </h4>

                        <button 
                            class="print-sale-btn"
                            onclick='reprintReceipt(${JSON.stringify(sale)})'
                        >

                            🖨 Yazdır

                        </button>

                    </div>

                </div>

                `;

            });

        }



        // HERO

        totalSalesText.innerText =
        totalSales + " TL";

        cashSalesText.innerText =
        cashSales + " TL";

        cardSalesText.innerText =
        cardSales + " TL";

        orderCountText.innerText =
        orderCount;

    });

}

loadSales();




// PDF ÇIKTI

if(pdfBtn){

    pdfBtn.addEventListener("click",()=>{

        window.print();

    });

}




// FİŞİ TEKRAR YAZDIR

window.reprintReceipt = function(sale){

    const encodedItems =
    encodeURIComponent(
        JSON.stringify(sale.items || [])
    );

    window.open(

        `fis.html?table=${sale.table}
        &total=${sale.total}
        &payment=${sale.type}
        &items=${encodedItems}`,

        "_blank"

    );

}




// CİROYU SIFIRLA

resetBtn.addEventListener("click",()=>{

    const confirmReset =
    confirm("Tüm ciro verileri silinsin mi?");

    if(confirmReset){

        set(salesRef,{});

    }

});