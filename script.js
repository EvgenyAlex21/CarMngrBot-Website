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

    // Создаем оверлей, если его нет
    function ensureOverlayExists() {
        if (!document.querySelector('.sidebar-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
            
            // Добавляем слушатель на оверлей для закрытия меню
            overlay.addEventListener('click', function() {
                if (DOM.menu && DOM.menu.classList.contains('active')) {
                    toggleMenu();
                }
                
                const sidebar = document.querySelector('.corporate-sidebar');
                if (sidebar && sidebar.classList.contains('active')) {
                    toggleSidebar();
                }
            });
        }
        return document.querySelector('.sidebar-overlay');
    }

    // Инициализация при загрузке
    function init() {
        ensureOverlayExists();
        if (DOM.hamburger && DOM.menu) setupMobileMenu();
        setupSmoothScroll();
        if (DOM.scrollToTopBtn) setupScrollToTop();
        if (DOM.sections.length) setupSectionObserver();
        if (DOM.featureCards.length) setupFeatureCards();
        if (document.querySelectorAll('.instruction-block').length) {
            setupCollapsibleBlocks();
        }
        animateOnScroll();
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

    // Мобильное меню - исправлено
    function setupMobileMenu() {
        if (DOM.hamburger) {
            DOM.hamburger.addEventListener('click', function(e) {
                e.stopPropagation(); // Предотвращаем всплытие события
                toggleMenu();
            });
        }

        if (DOM.menu) {
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
    }

    function toggleMenu() {
        // Упрощенная версия без лишних проверок
        const overlay = ensureOverlayExists();
        
        if (DOM.menu) {
            DOM.menu.classList.toggle('active');
            if (DOM.hamburger) {
                DOM.hamburger.classList.toggle('active');
            }
            overlay.classList.toggle('active');
            document.body.style.overflow = DOM.menu.classList.contains('active') ? 'hidden' : '';
        }
    }

    // Переключение боковой панели
    function toggleSidebar() {
        const sidebar = document.querySelector('.corporate-sidebar');
        const overlay = ensureOverlayExists();
        
        if (sidebar) {
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
                        // Прокрутка к элементу
                        scrollToElement(targetElement);
                        
                        // Проверяем видимость после прокрутки
                        setTimeout(() => {
                            ensureElementVisible(targetElement);
                            highlightElement(targetElement);
                        }, 700); // Увеличиваем задержку для завершения прокрутки
                    }
                });
            });
        }
    }

    // Новая функция для проверки видимости элемента
    function ensureElementVisible(element) {
        const rect = element.getBoundingClientRect();
        const header = document.querySelector('.corporate-header');
        const headerHeight = header ? header.offsetHeight + 20 : 70; // Добавляем запас
        
        // Если верхняя часть элемента не видна, дополнительно прокручиваем
        if (rect.top < headerHeight) {
            window.scrollBy({
                top: rect.top - headerHeight,
                behavior: 'smooth'
            });
        }
    }

    // Новая функция для подсветки элемента
    function highlightElement(element) {
        // Удаляем класс подсветки с любых ранее подсвеченных элементов
        document.querySelectorAll('.highlight-pulse').forEach(el => {
            el.classList.remove('highlight-pulse');
        });
        
        // Определяем, какой элемент подсвечивать
        let targetElement = element;
        
        // Если это заголовок внутри блока, подсвечиваем весь блок
        if (element.tagName === 'H2' || element.tagName === 'H3' || element.tagName === 'H4') {
            const parentBlock = element.closest('.feature-card, .instruction-block, .agreement-block, .privacy-block');
            if (parentBlock) {
                targetElement = parentBlock;
            }
        }
        
        // Для карточек функций (feature-card) делаем особую обработку
        if (targetElement.classList.contains('feature-card')) {
            // Если есть активная карточка и это не текущая, делаем её неактивной
            if (state.activeCard && state.activeCard !== targetElement) {
                state.activeCard.classList.remove('active');
            }
            
            // Делаем текущую карточку активной
            targetElement.classList.add('active');
            state.activeCard = targetElement;
        }
        
        // Добавляем класс подсветки
        targetElement.classList.add('highlight-pulse');
        
        // Удаляем класс после завершения анимации (3 моргания)
        setTimeout(() => {
            targetElement.classList.remove('highlight-pulse');
        }, 3000);
    }

    // Улучшенная функция прокрутки к элементу
    function scrollToElement(element, customOffset = null) {
        if (!element) return;
        
        // Получаем высоту шапки
        const header = document.querySelector('.corporate-header');
        const headerHeight = header ? header.offsetHeight : 0;
        
        // Настройка отступа в зависимости от типа элемента
        let offset = customOffset;
        if (offset === null) {
            // Базовое значение отступа
            offset = 120; // Увеличиваем с 90 до 120
            
            // Дополнительные отступы для определенных элементов
            if (element.classList.contains('feature-card')) {
                offset = 150; // Больший отступ для карточек функций
            } else if (element.id === 'function' || element.closest('.section-header')) {
                offset = 160; // Еще больший отступ для заголовков секций
            }
        }
        
        // Рассчитываем конечную позицию с учетом шапки
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - offset;
        
        // Плавная прокрутка
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
        
        // Сохраняем позицию прокрутки для корректного определения направления
        state.lastScrollPosition = window.scrollY;
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