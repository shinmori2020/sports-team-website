// main.js

document.addEventListener('DOMContentLoaded', function() {
    // ================================
    // クロスフェードスライダー
    // ================================
    function initCrossfadeSlider() {
        const sliders = document.querySelectorAll('.hero__slider');
        const slideInterval = 5000; // 5秒間隔

        sliders.forEach(slider => {
            const slides = slider.querySelectorAll('.hero__slide');
            if (slides.length <= 1) return;

            let currentIndex = 0;

            function showNextSlide() {
                // 現在のスライドを非アクティブに
                slides[currentIndex].classList.remove('is-active');

                // 次のスライドへ
                currentIndex = (currentIndex + 1) % slides.length;

                // 新しいスライドをアクティブに
                slides[currentIndex].classList.add('is-active');
            }

            // 自動再生開始
            setInterval(showNextSlide, slideInterval);
        });
    }

    // スライダー初期化
    initCrossfadeSlider();

    // ハンバーガーメニュー
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    const body = document.body;

    function toggleMobileMenu() {
        hamburger.classList.toggle('active');
        if (mobileNav) {
            mobileNav.classList.toggle('active');
        }
        if (mobileNavOverlay) {
            mobileNavOverlay.classList.toggle('active');
        }
        body.classList.toggle('menu-open');
    }

    function closeMobileMenu() {
        hamburger.classList.remove('active');
        if (mobileNav) {
            mobileNav.classList.remove('active');
        }
        if (mobileNavOverlay) {
            mobileNavOverlay.classList.remove('active');
        }
        body.classList.remove('menu-open');
    }

    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }

    // オーバーレイクリックでメニューを閉じる
    if (mobileNavOverlay) {
        mobileNavOverlay.addEventListener('click', closeMobileMenu);
    }

    // スクロール時のヘッダー制御
    const header = document.querySelector('.header');
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // スムーススクロール
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');

    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // モバイルメニューを閉じる
                if (hamburger && hamburger.classList.contains('active')) {
                    hamburger.classList.remove('active');
                    if (mobileNav) {
                        mobileNav.classList.remove('active');
                    }
                    body.classList.remove('menu-open');
                }
            }
        });
    });
});
