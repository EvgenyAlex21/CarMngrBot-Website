document.addEventListener('DOMContentLoaded', function() {
    // Константы для элементов с проверкой на существование
    const DOM = {
        menu: document.querySelector('.corporate-nav ul.menu'),
        hamburger: document.querySelector('.hamburger'),
        scrollToTopBtn: document.getElementById('scrollToTop'),
        sections: document.querySelectorAll('.corporate-section'),
        navLinks: document.querySelectorAll('.sidebar-nav a'),
        featureCards: document.querySelectorAll('.feature-card'),
        instructionBlocks: document.querySelectorAll('.instruction-block, .agreement-block, .privacy-block')
    };

    // Состояние приложения
    const state = {
        activeCard: null,
        lastScrollPosition: 0,
        scrollDirection: 'down'
    };

    // Инициализация при загрузке
    function init() {
        if (DOM.hamburger && DOM.menu) setupMobileMenu();
        setupSmoothScroll();
        if (DOM.scrollToTopBtn) setupScrollToTop();
        if (DOM.sections.length) setupSectionObserver();
        if (DOM.featureCards.length) setupFeatureCards();
        if (document.querySelectorAll('.instruction-block').length) {
            setupCollapsibleBlocks();
        }
        animateOnScroll();
        // highlightActiveSection(); // Закомментировано
        setupClickOutsideHandler();

        const sidebarToggle = document.querySelector('.sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', toggleSidebar);
        }
    }

    // Обработчик кликов вне элементов
    function setupClickOutsideHandler() {
        document.addEventListener('click', function(e) {
            const sidebar = document.querySelector('.corporate-sidebar');
            const menu = document.querySelector('.corporate-nav ul.menu');
            const hamburger = document.querySelector('.hamburger');
            const overlay = document.querySelector('.sidebar-overlay');

            if (menu && hamburger && overlay && sidebar) {
                if (
                    !e.target.closest('.corporate-sidebar') &&
                    !e.target.closest('.corporate-nav ul.menu') &&
                    !e.target.closest('.hamburger') &&
                    !e.target.closest('.sidebar-toggle')
                ) {
                    if (menu.classList.contains('active')) {
                        menu.classList.remove('active');
                        hamburger.classList.remove('active');
                        overlay.classList.remove('active');
                    }
                    if (sidebar.classList.contains('active')) {
                        sidebar.classList.remove('active');
                        overlay.classList.remove('active');
                    }
                    document.body.style.overflow = '';
                }
            }
        });
    }

    // Мобильное меню
    function setupMobileMenu() {
        DOM.hamburger.addEventListener('click', toggleMenu);

        const links = DOM.menu.querySelectorAll('a');
        if (links.length) {
            links.forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 1024) {
                        toggleMenu();
                    }
                });
            });
        }
    }

    function toggleMenu() {
        if (DOM.menu && DOM.hamburger && document.querySelector('.sidebar-overlay')) {
            DOM.menu.classList.toggle('active');
            DOM.hamburger.classList.toggle('active');
            document.querySelector('.sidebar-overlay').classList.toggle('active');
            document.body.style.overflow = DOM.menu.classList.contains('active') ? 'hidden' : '';
        }
    }

    // Переключение боковой панели
    function toggleSidebar() {
        const sidebar = document.querySelector('.corporate-sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        if (sidebar && overlay) {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
            document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
        }
    }

    // Плавная прокрутка
    function setupSmoothScroll() {
        const anchors = document.querySelectorAll('a[href^="#"]');
        if (anchors.length) {
            anchors.forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href');
                    const targetElement = document.querySelector(targetId);

                    if (targetElement) {
                        scrollToElement(targetElement);
                    }
                });
            });
        }
    }

    function scrollToElement(element, offset = 90) {
        window.scrollTo({
            top: element.offsetTop - offset,
            behavior: 'smooth'
        });
    }

    // Кнопка "Наверх"
    function setupScrollToTop() {
        if (DOM.scrollToTopBtn) {
            window.addEventListener('scroll', throttle(handleScroll, 100));
            DOM.scrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    function handleScroll() {
        const currentScrollPosition = window.pageYOffset;
        state.scrollDirection = currentScrollPosition > state.lastScrollPosition ? 'down' : 'up';
        state.lastScrollPosition = currentScrollPosition;

        if (DOM.scrollToTopBtn) {
            if (currentScrollPosition > 300) {
                DOM.scrollToTopBtn.classList.add('show');
            } else {
                DOM.scrollToTopBtn.classList.remove('show');
            }
        }
    }

    // Intersection Observer для секций
    function setupSectionObserver() {
        const options = {
          root: null,
          rootMargin: '0px',
          threshold: 0.05 // Уменьшил порог срабатывания
        };
      
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view');
              observer.unobserve(entry.target); // Прекращаем наблюдение после появления
            }
          });
        }, options);
      
        // Наблюдаем за всеми секциями, включая инструкции
        document.querySelectorAll('.corporate-section').forEach(section => {
          observer.observe(section);
        });
      }

    // Подсветка активного раздела
    /* Закомментировано
    function highlightActiveSection() {
        window.addEventListener('scroll', throttle(() => {
            let current = '';

            DOM.sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;

                if (pageYOffset >= (sectionTop - 150)) {
                    current = section.getAttribute('id');
                }
            });

            DOM.navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        }, 100));
    }
    */

    // Карточки функций
    function setupFeatureCards() {
        DOM.featureCards.forEach(card => {
            const instructionContent = card.querySelector('.instruction-content');
            if (instructionContent) {
                card.addEventListener('click', function(e) {
                    e.stopPropagation();

                    if (state.activeCard && state.activeCard !== this) {
                        state.activeCard.classList.remove('active');
                    }

                    this.classList.toggle('active');
                    state.activeCard = this.classList.contains('active') ? this : null;

                    if (this.classList.contains('active')) {
                        setTimeout(() => {
                            this.scrollIntoView({
                                behavior: 'smooth',
                                block: 'nearest',
                                inline: 'nearest'
                            });
                        }, 100);
                    }
                });
            } else {
                console.warn('Instruction content not found in card:', card);
            }
        });

        document.addEventListener('click', () => {
            if (state.activeCard) {
                state.activeCard.classList.remove('active');
                state.activeCard = null;
            }
        });
    }

    // Сворачиваемые блоки
    function setupCollapsibleBlocks() {
        // Добавляем стрелки ко всем h2, h3, h4
        document.querySelectorAll('.instruction-block h2, .instruction-block h3, .instruction-block h4').forEach(header => {
            // Удаляем существующую стрелку, если она есть
            const existingIcon = header.querySelector('.toggle-icon');
            if (existingIcon) existingIcon.remove();
    
            // Создаем новую стрелку с правильным позиционированием
            const toggleIcon = document.createElement('i');
            toggleIcon.className = 'fas fa-chevron-right toggle-icon';
            toggleIcon.style.cssText = 'margin-left: 10px; transition: transform 0.3s ease; float: right;';
            header.appendChild(toggleIcon);
        });
    
        // Скрываем все .instruction-content и все элементы после h3/h4/h2 до следующего такого же или выше уровня
        document.querySelectorAll('.instruction-block').forEach(block => {
            // Скрываем .instruction-content если есть
            const content = block.querySelector(':scope > .instruction-content');
            if (content) content.style.display = 'none';
    
            // Скрываем всё после h3/h4/h2 до следующего такого же или выше уровня
            ['h2','h3','h4'].forEach(tag => {
                const header = block.querySelector(':scope > ' + tag);
                if (header) {
                    let sibling = header.nextElementSibling;
                    while (sibling && !['H2','H3','H4'].includes(sibling.tagName)) {
                        sibling.style.display = 'none';
                        sibling = sibling.nextElementSibling;
                    }
                }
            });
        });
    
        // Обработка клика по заголовкам
        document.querySelectorAll('.instruction-block h2, .instruction-block h3, .instruction-block h4').forEach(header => {
            header.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
    
                // Определяем, что раскрывать: .instruction-content или элементы после заголовка
                let toToggle = [];
                let sibling = header.nextElementSibling;
                while (sibling && !['H2','H3','H4'].includes(sibling.tagName)) {
                    toToggle.push(sibling);
                    sibling = sibling.nextElementSibling;
                }
                // Если есть .instruction-content прямо под этим блоком — тоже добавим
                const parentBlock = header.closest('.instruction-block');
                const content = parentBlock.querySelector(':scope > .instruction-content');
                if (content) toToggle.push(content);
    
                // Переключаем видимость
                const isOpen = toToggle.some(el => el.style.display === 'block');
                toToggle.forEach(el => el.style.display = isOpen ? 'none' : 'block');
    
                // Поворачиваем стрелку
                const icon = header.querySelector('.toggle-icon');
                if (icon) icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(90deg)';
            });
        });
    }
    // Анимация карточек при прокрутке
    function animateOnScroll() {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) return; // Пропускаем анимацию на мобильных
    
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
    
        DOM.featureCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
            observer.observe(card);
        });
    }

    // Вспомогательные функции
    function throttle(func, limit) {
        let lastFunc;
        let lastRan;
        return function() {
            const context = this;
            const args = arguments;
            if (!lastRan) {
                func.apply(context, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function() {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    }

    window.addEventListener('resize', function() {
        const menu = document.querySelector('.corporate-nav ul.menu');
        const sidebar = document.querySelector('.corporate-sidebar');
        const hamburger = document.querySelector('.hamburger');
        if (window.innerWidth > 1024 && menu && sidebar && hamburger) {
            menu.classList.remove('active');
            hamburger.classList.remove('active');
            sidebar.classList.remove('active');
        }
    });

    // Запуск приложения
    init();
});