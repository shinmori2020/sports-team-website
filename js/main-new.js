/* =============================================
   SONY風デザイン - main-new.js
   reiga0919様 スポーツチーム公式サイト
   ============================================= */

document.addEventListener('DOMContentLoaded', function () {

    /* -----------------------------------------
       ハンバーガーメニュー
       ----------------------------------------- */
    var hamburger = document.querySelector('.hamburger');
    var mobileNav = document.querySelector('.mobile-nav');
    var mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    var mobileNavLinks = document.querySelectorAll('.mobile-nav a');

    function closeMobileNav() {
        hamburger.classList.remove('is-active');
        mobileNav.classList.remove('is-active');
        mobileNavOverlay.classList.remove('is-active');
        document.body.style.overflow = '';
    }

    function toggleMobileNav() {
        hamburger.classList.toggle('is-active');
        mobileNav.classList.toggle('is-active');
        mobileNavOverlay.classList.toggle('is-active');
    }

    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileNav);
    }
    if (mobileNavOverlay) {
        mobileNavOverlay.addEventListener('click', closeMobileNav);
    }
    mobileNavLinks.forEach(function (link) {
        link.addEventListener('click', closeMobileNav);
    });

    /* -----------------------------------------
       ヘッダースクロール検知
       ----------------------------------------- */
    var header = document.querySelector('.header');

    function handleHeaderScroll() {
        if (window.pageYOffset > 10) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    window.addEventListener('scroll', handleHeaderScroll, { passive: true });

    /* -----------------------------------------
       MV スクロール駆動アニメーション
       ----------------------------------------- */
    var mvSection = document.querySelector('.mv');
    var mvSlides = document.querySelectorAll('.mv__slide');
    var mvProgressBars = document.querySelectorAll('.mv__progress-bar');
    var mvProgressFills = document.querySelectorAll('.mv__progress-fill');
    var TOTAL_SLIDES = mvSlides.length;
    var NUM_TRANSITIONS = TOTAL_SLIDES - 1;

    // タイムライン定義: hold(16%) + transition(8%) を繰り返し
    // 4スライド = hold + trans + hold + trans + hold + trans + hold
    // = 4 * 0.16 + 3 * 0.12 = 0.64 + 0.36 = 1.0 (100%)
    var HOLD_RATIO = 0.22;
    var TRANS_RATIO = 0.03;

    // 各スライドの開始位置とトランジション位置を計算
    var slideTimeline = [];
    var pos = 0;
    for (var i = 0; i < TOTAL_SLIDES; i++) {
        var holdStart = pos;
        var holdEnd = pos + HOLD_RATIO;
        var transStart = holdEnd;
        var transEnd = (i < NUM_TRANSITIONS) ? holdEnd + TRANS_RATIO : holdEnd;
        slideTimeline.push({
            holdStart: holdStart,
            holdEnd: holdEnd,
            transStart: transStart,
            transEnd: transEnd
        });
        pos = transEnd;
    }

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function updateMVSlides() {
        if (!mvSection || TOTAL_SLIDES === 0) return;

        var rect = mvSection.getBoundingClientRect();
        var scrollTop = Math.max(0, -rect.top);
        var scrollHeight = mvSection.offsetHeight - window.innerHeight;

        if (scrollHeight <= 0) return;

        var progress = Math.min(1, Math.max(0, scrollTop / scrollHeight));

        // 現在のフェーズを判定
        var currentSlideIndex = 0;
        var transitionProgress = -1; // -1 = hold中
        var nextSlideIndex = -1;

        for (var i = 0; i < TOTAL_SLIDES; i++) {
            var tl = slideTimeline[i];

            if (progress >= tl.holdStart && progress < tl.holdEnd) {
                // Hold フェーズ
                currentSlideIndex = i;
                transitionProgress = -1;
                break;
            } else if (i < NUM_TRANSITIONS && progress >= tl.transStart && progress < tl.transEnd) {
                // Transition フェーズ
                currentSlideIndex = i;
                nextSlideIndex = i + 1;
                var rawProgress = (progress - tl.transStart) / (tl.transEnd - tl.transStart);
                transitionProgress = easeInOutCubic(Math.min(1, Math.max(0, rawProgress)));
                break;
            }
        }

        // 最後のスライドのhold以降（progress === 1付近）
        if (progress >= slideTimeline[TOTAL_SLIDES - 1].holdStart) {
            currentSlideIndex = TOTAL_SLIDES - 1;
            transitionProgress = -1;
        }

        // 各スライドにtransformを適用
        mvSlides.forEach(function (slide, idx) {
            var image = slide.querySelector('.mv__slide-image');
            if (!image) return;

            if (transitionProgress >= 0 && idx === currentSlideIndex) {
                // 現在のスライド: 縮小 + フェードアウト
                var scale = 1 - 0.12 * transitionProgress;
                var opacity = 1 - transitionProgress;
                image.style.transform = 'scale(' + scale + ')';
                image.style.opacity = opacity;
                slide.style.zIndex = 2;
                slide.style.pointerEvents = 'auto';
            } else if (transitionProgress >= 0 && idx === nextSlideIndex) {
                // 次のスライド: 下から浮上 + フェードイン
                var translateY = 8 * (1 - transitionProgress);
                var opacityIn = transitionProgress;
                image.style.transform = 'translateY(' + translateY + '%)';
                image.style.opacity = opacityIn;
                slide.style.zIndex = 3;
                slide.style.pointerEvents = 'auto';
            } else if (idx === currentSlideIndex) {
                // Hold中の現在スライド: 完全表示
                image.style.transform = 'scale(1) translateY(0)';
                image.style.opacity = '1';
                slide.style.zIndex = 2;
                slide.style.pointerEvents = 'auto';
            } else if (idx < currentSlideIndex) {
                // 過去のスライド: 非表示（縮小状態）
                image.style.transform = 'scale(0.88)';
                image.style.opacity = '0';
                slide.style.zIndex = 1;
                slide.style.pointerEvents = 'none';
            } else {
                // 未来のスライド: 非表示（下に待機）
                image.style.transform = 'translateY(8%)';
                image.style.opacity = '0';
                slide.style.zIndex = 1;
                slide.style.pointerEvents = 'none';
            }
        });

        // プログレスバー更新（hold中に0→100%、その後フェード開始）
        mvProgressBars.forEach(function (bar, idx) {
            var fill = bar.querySelector('.mv__progress-fill');
            if (!fill) return;

            var tl = slideTimeline[idx];
            var barProgress;

            if (progress < tl.holdStart) {
                // まだこのスライドに到達していない
                barProgress = 0;
            } else if (progress < tl.holdEnd) {
                // hold中: 0→100%
                barProgress = (progress - tl.holdStart) / (tl.holdEnd - tl.holdStart);
            } else {
                // hold終了後（transition中・完了後）: 100%維持
                barProgress = 1;
            }

            bar.classList.remove('is-active', 'is-past');
            if (progress >= tl.transEnd) {
                bar.classList.add('is-past');
            } else if (barProgress > 0) {
                bar.classList.add('is-active');
            }

            fill.style.height = (barProgress * 100) + '%';
        });
    }

    // requestAnimationFrame でスムーズに更新
    var ticking = false;
    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(function () {
                updateMVSlides();
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // 初期状態を設定
    updateMVSlides();

    /* -----------------------------------------
       MV 自動スクロール（手動スクロールと共存）
       ----------------------------------------- */
    var autoScrollSpeed = 2;          // 1フレームあたりのスクロール量(px)
    var autoScrollPauseMs = 3000;     // 手動スクロール後の再開待機時間
    var autoScrollPaused = false;     // 一時停止ボタンで停止中か
    var userScrollTimer = null;
    var isUserScrolling = false;
    var autoScrollRaf = null;
    var scrollAccumulator = 0;        // サブピクセル蓄積用

    // ユーザーの手動スクロールを検知して自動スクロールを一時停止
    function onUserScroll() {
        if (autoScrollPaused) return;
        isUserScrolling = true;
        clearTimeout(userScrollTimer);
        userScrollTimer = setTimeout(function () {
            isUserScrolling = false;
        }, autoScrollPauseMs);
    }

    // wheel / touch / keydown で手動スクロールを検知
    window.addEventListener('wheel', onUserScroll, { passive: true });
    window.addEventListener('touchmove', onUserScroll, { passive: true });
    window.addEventListener('keydown', function (e) {
        if ([32, 33, 34, 38, 40].indexOf(e.keyCode) !== -1) {
            onUserScroll();
        }
    });

    // MVセクションが画面内にあるか判定
    function isMVInView() {
        if (!mvSection) return false;
        var rect = mvSection.getBoundingClientRect();
        var scrollTop = Math.max(0, -rect.top);
        var scrollHeight = mvSection.offsetHeight - window.innerHeight;
        return rect.top <= 10 && scrollTop < scrollHeight;
    }

    // 自動スクロールのメインループ
    function autoScrollLoop() {
        if (!autoScrollPaused && !isUserScrolling && isMVInView()) {
            scrollAccumulator += autoScrollSpeed;
            // 1px以上たまったら整数分だけスクロール
            if (scrollAccumulator >= 1) {
                var px = Math.floor(scrollAccumulator);
                window.scrollBy(0, px);
                scrollAccumulator -= px;
            }
        }
        autoScrollRaf = requestAnimationFrame(autoScrollLoop);
    }

    // 自動スクロール開始
    autoScrollRaf = requestAnimationFrame(autoScrollLoop);

    /* -----------------------------------------
       モーション一時停止ボタン
       ----------------------------------------- */
    var pauseBtn = document.querySelector('.mv__pause-btn');
    if (pauseBtn) {
        pauseBtn.addEventListener('click', function () {
            var icon = this.querySelector('i');
            if (icon.classList.contains('fa-pause')) {
                // 一時停止
                icon.classList.remove('fa-pause');
                icon.classList.add('fa-play');
                autoScrollPaused = true;
            } else {
                // 再開
                icon.classList.remove('fa-play');
                icon.classList.add('fa-pause');
                autoScrollPaused = false;
                isUserScrolling = false;
            }
        });
    }

    /* -----------------------------------------
       メンバースライダー（SONY風）
       ----------------------------------------- */
    var membersTrack = document.querySelector('.members__slider-track');
    var membersSlides = document.querySelectorAll('.members__slide');
    var membersPrev = document.querySelector('.members__nav-prev');
    var membersNext = document.querySelector('.members__nav-next');
    var membersProgressFill = document.querySelector('.members__progress-fill');
    var membersCounter = document.querySelector('.members__progress-counter');
    var membersCurrentIndex = 0;
    var membersTotalSlides = membersSlides.length;

    // 画面幅に応じた表示枚数を取得
    function getMembersVisibleCount() {
        if (window.innerWidth <= 480) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }

    function updateMembersSlider() {
        if (!membersTrack || membersTotalSlides === 0) return;

        var visibleCount = getMembersVisibleCount();
        var maxIndex = Math.max(0, membersTotalSlides - visibleCount);
        if (membersCurrentIndex > maxIndex) membersCurrentIndex = maxIndex;

        // 1スライドの幅(%)を計算してオフセット
        var slideWidthPercent = 100 / visibleCount;
        var offsetPercent = membersCurrentIndex * slideWidthPercent;
        membersTrack.style.transform = 'translateX(-' + offsetPercent + '%)';

        // プログレスバー更新
        if (membersProgressFill) {
            var progress;
            if (maxIndex === 0) {
                progress = 100;
            } else {
                progress = ((membersCurrentIndex + visibleCount) / membersTotalSlides) * 100;
            }
            membersProgressFill.style.width = Math.min(100, progress) + '%';
        }

        // カウンター更新
        if (membersCounter) {
            var num = (membersCurrentIndex + 1).toString();
            membersCounter.textContent = num.length < 2 ? '0' + num : num;
        }
    }

    if (membersPrev) {
        membersPrev.addEventListener('click', function () {
            if (membersCurrentIndex > 0) {
                membersCurrentIndex--;
            } else {
                membersCurrentIndex = Math.max(0, membersTotalSlides - getMembersVisibleCount());
            }
            updateMembersSlider();
        });
    }

    if (membersNext) {
        membersNext.addEventListener('click', function () {
            var maxIndex = Math.max(0, membersTotalSlides - getMembersVisibleCount());
            if (membersCurrentIndex < maxIndex) {
                membersCurrentIndex++;
            } else {
                membersCurrentIndex = 0;
            }
            updateMembersSlider();
        });
    }

    // ウィンドウリサイズ時にスライダーを再計算
    window.addEventListener('resize', function () {
        updateMembersSlider();
    });

    // 初期表示
    updateMembersSlider();

    /* -----------------------------------------
       スクロールアニメーション（コンテンツセクション）
       ----------------------------------------- */
    var fadeTargets = document.querySelectorAll(
        '.mission__content, .news__title, .news__content, .members__header, .members__slider, .contact__header, .contact__form, .company-vision__header, .company-vision__grid, .company-business__header, .company-business__grid, .company-info__header, .company-table, .company-access__header, .company-access__map, .project-activities__header, .project-activities__sticky-wrap, .partners-intro__content, .partners-rank__header, .partners-rank__grid, .partners-cta__inner, .members-list__grid .member-card, .member-detail__breadcrumb, .member-detail__grid, .member-detail__back'
    );

    fadeTargets.forEach(function (el) {
        el.classList.add('js-fade-in');
    });

    if ('IntersectionObserver' in window) {
        var fadeObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    fadeObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px'
        });

        fadeTargets.forEach(function (el) {
            fadeObserver.observe(el);
        });
    } else {
        fadeTargets.forEach(function (el) {
            el.classList.add('is-visible');
        });
    }

    /* -----------------------------------------
       プロジェクトページ: スティッキー画像切替
       ----------------------------------------- */
    var activityItems = document.querySelectorAll('.project-activities__text-col .project-activity');
    var activitySlides = document.querySelectorAll('.project-activities__slide');

    if (activityItems.length > 0 && activitySlides.length > 0) {
        // 初期状態: 最初のアイテムをアクティブに
        activityItems[0].classList.add('is-active');

        var activityObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var idx = entry.target.getAttribute('data-index');

                    // テキストのアクティブ切替
                    activityItems.forEach(function (item) {
                        item.classList.remove('is-active');
                    });
                    entry.target.classList.add('is-active');

                    // 画像のクロスフェード切替
                    activitySlides.forEach(function (slide) {
                        slide.classList.remove('is-active');
                    });
                    var targetSlide = document.querySelector('.project-activities__slide[data-index="' + idx + '"]');
                    if (targetSlide) {
                        targetSlide.classList.add('is-active');
                    }
                }
            });
        }, {
            threshold: 0.4,
            rootMargin: '-20% 0px -40% 0px'
        });

        activityItems.forEach(function (item) {
            activityObserver.observe(item);
        });
    }

    /* -----------------------------------------
       スムーススクロール（アンカーリンク）
       ----------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;

            var targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                var headerHeight = document.querySelector('.header').offsetHeight;
                var targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPos,
                    behavior: 'smooth'
                });
            }
        });
    });

});
