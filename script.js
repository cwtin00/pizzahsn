document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.nav-item');
    const products = document.querySelectorAll('.product-card');
    const title = document.getElementById('active-title');
    

    const wrapper = document.getElementById('nav-wrapper');
    const leftArrow = document.getElementById('scroll-left');
    const rightArrow = document.getElementById('scroll-right');
    const scrollAmount = 200; 


    rightArrow.addEventListener('click', () => {
        wrapper.scrollLeft += scrollAmount;
    });

    leftArrow.addEventListener('click', () => {
        wrapper.scrollLeft -= scrollAmount;
    });


    wrapper.addEventListener('scroll', () => {
   
        if (wrapper.scrollLeft <= 5) {
            leftArrow.style.display = 'none';
        } else {
            leftArrow.style.display = 'flex';
        }

     
        let maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
        if (wrapper.scrollLeft >= maxScroll - 5) {
            rightArrow.style.display = 'none';
        } else {
            rightArrow.style.display = 'flex';
        }
    });


    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Aktif Tab Değişimi
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Başlık Güncelleme
            title.innerText = tab.innerText.toUpperCase();

            // Filtreleme
            const category = tab.getAttribute('data-target');
            products.forEach(product => {
                if (product.getAttribute('data-cat') === category) {
                    product.style.display = 'flex';
                } else {
                    product.style.display = 'none';
                }
            });
        });
    });
});