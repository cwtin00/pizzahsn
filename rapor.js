import {
    db,
    ref,
    onValue,
    set
} from "./firebase.js";

// ELEMENTLER
const totalSalesText = document.getElementById("total-sales");
const cashSalesText = document.getElementById("cash-sales");
const cardSalesText = document.getElementById("card-sales");
const orderCountText = document.getElementById("order-count");
const resetBtn = document.getElementById("reset-sales-btn");
const reportTabs = document.querySelectorAll(".report-tab");
const liveTime = document.getElementById("live-time");
const reportTitle = document.getElementById("report-title");
const reportDesc = document.getElementById("report-desc");
const salesList = document.querySelector(".sales-list");

// TARİH FİLTRE
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const filterBtn = document.getElementById("filter-btn");

// PDF
const pdfBtn = document.getElementById("pdf-btn");

// FIREBASE
const salesRef = ref(db, "sales");

// AKTİF RAPOR
let currentRange = "daily";
let customFilter = false;

// CANLI SAAT
function updateClock(){
    const now = new Date();
    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");
    liveTime.innerText = `${hour}:${minute}`;
}
updateClock();
setInterval(updateClock, 1000);

// TAB DEĞİŞTİR
reportTabs.forEach(tab => {
    tab.addEventListener("click", () => {
        reportTabs.forEach(btn => {
            btn.classList.remove("active");
        });
        tab.classList.add("active");
        currentRange = tab.dataset.range;
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
        reportTitle.innerText = "BUGÜNKÜ TOPLAM CİRO";
        reportDesc.innerText = "Günlük PİZZHSN satış performansı";
    }
    if(currentRange === "weekly"){
        reportTitle.innerText = "HAFTALIK TOPLAM CİRO";
        reportDesc.innerText = "Haftalık PİZZHSN satış performansı";
    }
    if(currentRange === "monthly"){
        reportTitle.innerText = "AYLIK TOPLAM CİRO";
        reportDesc.innerText = "Aylık PİZZHSN satış performansı";
    }
    if(currentRange === "yearly"){
        reportTitle.innerText = "YILLIK TOPLAM CİRO";
        reportDesc.innerText = "Yıllık PİZZHSN satış performansı";
    }
    if(customFilter){
        reportTitle.innerText = "ÖZEL TARİH RAPORU";
        reportDesc.innerText = "Seçilen tarihler arası satış performansı";
    }
}

// TARİH FİLTRELE
filterBtn.addEventListener("click", () => {
    if(startDateInput.value && endDateInput.value){
        currentRange = "";
        customFilter = true;
        updateReportTitle();
        loadSales();
    }
});

// BİR MİLİSANİYE DEĞERİNİN ESNAF GÜNÜ BAŞLANGICINI BULUR (Gece 04:00 kuralına göre local tarih string verir)
function getEsnafDateStringFromMs(ms) {
    const d = new Date(Number(ms));
    // Gece 00:00 - 04:00 arası ise esnaf mantığıyla teknik olarak düne aittir
    if (d.getHours() < 4) {
        d.setDate(d.getDate() - 1);
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// TARİH KONTROL FONKSİYONU (Kayıtların Firebase anahtarındaki milisaniyeyi veya sale.date'i kullanır)
// TARİH KONTROL FONKSİYONU (Kayıtların Firebase anahtarındaki milisaniyeyi veya sale.date'i kullanır)
function isInRange(saleKey, saleDateStr) {
    let timestamp;

    // 1. ADIM: Firebase Key Milisaniye mi? (En güvenli yöntem)
    if (!isNaN(Number(saleKey)) && String(saleKey).length >= 12) {
        timestamp = Number(saleKey);
    } 
    // 2. ADIM: Key sayı değilse sale.date string'ini parse et
    else if (saleDateStr) {
        // Eğer ISO string (T harfi veya boşluk içerir) ise direkt parse et
        if (saleDateStr.includes("T") || saleDateStr.includes(" ")) {
            timestamp = new Date(saleDateStr).getTime();
        } else {
            // Eğer "YYYY-MM-DD" ise öğle 12:00'ye sabitle (UTC saat farkı hatasını önler)
            const [year, month, day] = saleDateStr.split("-").map(Number);
            timestamp = new Date(year, month - 1, day, 12, 0, 0).getTime();
        }
    } else {
        return false;
    }

    const saleEsnafDateStr = getEsnafDateStringFromMs(timestamp);
    const todayEsnafDateStr = getEsnafDateStringFromMs(Date.now());

    // KULLANICININ TAKVİMDEN SEÇTİĞİ TARİH (ÖZEL FİLTRE)
    if (customFilter) {
        const startStr = startDateInput.value; // "YYYY-MM-DD"
        const endStr = endDateInput.value;     // "YYYY-MM-DD"
        return saleEsnafDateStr >= startStr && saleEsnafDateStr <= endStr;
    }

    // GÜNLÜK SEKMESİ (BUGÜNKÜ CİRO)
    if (currentRange === "daily") {
        return saleEsnafDateStr === todayEsnafDateStr;
    }

    // HAFTALIK FİLTRE
    if (currentRange === "weekly") {
        const saleEsnafObj = new Date(saleEsnafDateStr);
        const todayEsnafObj = new Date(todayEsnafDateStr);
        const diff = todayEsnafObj - saleEsnafObj;
        const days = diff / (1000 * 60 * 60 * 24);
        return days <= 7 && days >= 0;
    }

    // AYLIK FİLTRE
    if (currentRange === "monthly") {
        const saleEsnafObj = new Date(saleEsnafDateStr);
        const todayEsnafObj = new Date(todayEsnafDateStr);
        return saleEsnafObj.getMonth() === todayEsnafObj.getMonth() && saleEsnafObj.getFullYear() === todayEsnafObj.getFullYear();
    }

    // YILLIK FİLTRE
    if (currentRange === "yearly") {
        const saleEsnafObj = new Date(saleEsnafDateStr);
        const todayEsnafObj = new Date(todayEsnafDateStr);
        return saleEsnafObj.getFullYear() === todayEsnafObj.getFullYear();
    }

    return true;
}

// SATIŞLARI YÜKLE
function loadSales(){
    onValue(salesRef, (snapshot) => {
        const data = snapshot.val();
        let totalSales = 0;
        let cashSales = 0;
        let cardSales = 0;
        let orderCount = 0;

        salesList.innerHTML = "";

        if(data){
            // Firebase'deki key'leri (milisaniyeleri) ve içeriği beraber alıyoruz
            const salesEntries = Object.entries(data).reverse(); // [[key, sale], [key, sale]]

            salesEntries.forEach(([key, sale]) => {
                if(!sale.date || !isInRange(key, sale.date)){
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

            // SON 5 SATIŞI LİSTELE
            const filteredEntries = salesEntries.filter(([key, sale]) => sale.date && isInRange(key, sale.date));
            
            filteredEntries.slice(0, 5).forEach(([key, sale]) => {
                // Kayıt zaman damgasından yerel saati alıyoruz
                const timestamp = isNaN(Number(key)) ? new Date(sale.date).getTime() : Number(key);
                const time = new Date(timestamp).toLocaleTimeString("tr-TR", {
                    hour: "2-digit",
                    minute: "2-digit"
                });

                salesList.innerHTML += `
                <div class="sale-item">
                    <div class="sale-left">
                        <strong>${sale.table}</strong>
                        <span>
                            ${
                            sale.type === "cash"
                            ? "Nakit Ödeme"
                            : sale.type === "card"
                            ? "Kart Ödeme"
                            : "Parçalı Ödeme"
                            }
                            • ${time}
                        </span>
                    </div>
                    <div class="sale-actions">
                        <h4>${sale.total} TL</h4>
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

        // PANEL METİNLERİNİ GÜNCELLE
        totalSalesText.innerText = totalSales + " TL";
        cashSalesText.innerText = cashSales + " TL";
        cardSalesText.innerText = cardSales + " TL";
        orderCountText.innerText = orderCount;
    });
}

loadSales();

// PDF ÇIKTI
if(pdfBtn){
    pdfBtn.addEventListener("click", () => {
        window.print();
    });
}

// FİŞİ TEKRAR YAZDIR
window.reprintReceipt = function(sale){
    const encodedItems = encodeURIComponent(
        JSON.stringify(sale.items || [])
    );
    window.open(
        `fis.html?table=${sale.table}&total=${sale.total}&payment=${sale.type}&items=${encodedItems}`,
        "_blank"
    );
}

// CİROYU SIFIRLA (Geçici olarak devre dışı bıraktık)
/*
resetBtn.addEventListener("click", () => {
    const confirmReset = confirm("Tüm ciro verileri silinsin mi?");
    if(confirmReset){
        set(salesRef, {});
    }
});
*/