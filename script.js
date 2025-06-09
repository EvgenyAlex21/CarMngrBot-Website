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
        scrollDirection: 'down',
        currentActiveMenuItem: null // Добавляем отслеживание текущего активного элемента меню
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

        // УБИРАЕМ вызов collapseAllMenuItems() - не сворачиваем меню при загрузке
        // collapseAllMenuItems(); // Закомментировали эту строку
        expandMenuItemByHash(); // Только разворачиваем нужное
    }

    // Функция для сворачивания всех пунктов меню в сайдбаре
    function collapseAllMenuItems() {
        // Сворачиваем все вложенные ul в сайдбаре
        document.querySelectorAll('.sidebar-nav ul ul').forEach(ul => {
            ul.style.display = 'none';
        });
    }

    // Изменяем функцию для работы без предварительного сворачивания
    function expandMenuItemByHash() {
        // Получаем текущий хэш из URL
        const hash = window.location.hash;
        if (!hash) return;
        
        // Ищем ссылку в сайдбаре, соответствующую текущему хэшу
        const targetLink = document.querySelector(`.sidebar-nav a[href="${hash}"]`);
        if (!targetLink) return;
        
        // Сохраняем текущий активный элемент
        if (state.currentActiveMenuItem) {
            state.currentActiveMenuItem.classList.remove('active-menu-item');
        }
        targetLink.classList.add('active-menu-item');
        state.currentActiveMenuItem = targetLink;
        
        // Разворачиваем только родительские ul элементы для целевой ссылки
        let parent = targetLink.parentElement;
        while (parent && !parent.classList.contains('sidebar-nav')) {
            if (parent.tagName === 'LI') {
                const childUl = parent.querySelector(':scope > ul');
                if (childUl) {
                    childUl.style.display = 'block';
                }
            }
            
            if (parent.tagName === 'UL') {
                parent.style.display = 'block';
            }
            
            parent = parent.parentElement;
        }
        
        // Разворачиваем соответствующий блок инструкции в основном контенте
        const targetId = hash.substring(1); // Удаляем символ #
        expandOnlyTargetInstructionBlock(targetId);
    }
    
    // Функция для разворачивания только целевого блока инструкций в основном контенте
    function expandOnlyTargetInstructionBlock(targetId) {
        console.log('Разворачиваем блок:', targetId); // Для отладки
        
        // Сворачиваем все блоки инструкций
        document.querySelectorAll('.instruction-block .instruction-content').forEach(content => {
            content.style.display = 'none';
        });
        
        // Сворачиваем все элементы после заголовков
        document.querySelectorAll('.instruction-block h2, .instruction-block h3, .instruction-block h4').forEach(header => {
            let sibling = header.nextElementSibling;
            while (sibling && !['H2','H3','H4'].includes(sibling.tagName)) {
                sibling.style.display = 'none';
                sibling = sibling.nextElementSibling;
            }
            
            // Поворачиваем стрелки в исходное положение
            const icon = header.querySelector('.toggle-icon');
            if (icon) {
                icon.style.transform = 'rotate(0deg)';
            }
        });
        
        // Находим целевой блок инструкции
        const targetBlock = document.getElementById(targetId);
        if (!targetBlock) {
            console.log('Блок не найден:', targetId);
            return;
        }
        
        console.log('Найден блок:', targetBlock); // Для отладки
        
        // Разворачиваем целевой блок
        if (targetBlock.classList.contains('instruction-content')) {
            targetBlock.style.display = 'block';
            
            // Найдем родительский instruction-block
            const parentBlock = targetBlock.closest('.instruction-block');
            if (parentBlock) {
                const header = parentBlock.querySelector(':scope > h2, :scope > h3, :scope > h4');
                if (header) {
                    const icon = header.querySelector('.toggle-icon');
                    if (icon) {
                        icon.style.transform = 'rotate(90deg)';
                    }
                }
            }
        } else {
            // Если целевой блок - это instruction-block
            const content = targetBlock.querySelector(':scope > .instruction-content');
            if (content) {
                content.style.display = 'block';
            }
            
            // Разворачиваем элементы после заголовка
            const header = targetBlock.querySelector(':scope > h2, :scope > h3, :scope > h4');
            if (header) {
                let sibling = header.nextElementSibling;
                while (sibling && !['H2','H3','H4'].includes(sibling.tagName)) {
                    sibling.style.display = 'block';
                    sibling = sibling.nextElementSibling;
                }
                
                const icon = header.querySelector('.toggle-icon');
                if (icon) {
                    icon.style.transform = 'rotate(90deg)';
                }
            }
        }
        
        // Разворачиваем родительские instruction-block
        let block = targetBlock.parentElement;
        while (block) {
            if (block.classList.contains('instruction-block')) {
                const content = block.querySelector(':scope > .instruction-content');
                if (content) {
                    content.style.display = 'block';
                }
                
                // Разворачиваем элементы после заголовка родительского блока
                const header = block.querySelector(':scope > h2, :scope > h3, :scope > h4');
                if (header) {
                    let sibling = header.nextElementSibling;
                    while (sibling && !['H2','H3','H4'].includes(sibling.tagName)) {
                        sibling.style.display = 'block';
                        sibling = sibling.nextElementSibling;
                    }
                    
                    const icon = header.querySelector('.toggle-icon');
                    if (icon) {
                        icon.style.transform = 'rotate(90deg)';
                    }
                }
            }
            
            // Прерываем цикл, если дошли до section-content или corporate-main
            if (block.classList.contains('section-content') || block.classList.contains('corporate-main')) {
                break;
            }
            
            block = block.parentElement;
        }
        
        // После разворачивания, делаем блок видимым на экране
        setTimeout(() => {
            const element = document.getElementById(targetId);
            if (element) {
                ensureElementVisible(element);
                highlightElement(element);
            }
        }, 100);
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
                    
                    // Обновляем URL, чтобы правильно сработала функция по хэшу
                    window.location.hash = targetId.substring(1);
                    
                    // НЕ сворачиваем все меню, только разворачиваем нужное
                    expandMenuItemByHash();
                    
                    // Прокручиваем к выбранному элементу
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        scrollToElement(targetElement);
                        setTimeout(() => {
                            ensureElementVisible(targetElement);
                            highlightElement(targetElement);
                        }, 700);
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

    function setupClickOutsideHandler() {
        // Пустая функция, если нужна
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
    
                // Найдем родительский instruction-block для текущего заголовка
                const currentBlock = header.closest('.instruction-block');
                // Найдем родительский контейнер всех блоков
                const parentContainer = currentBlock.parentElement;
                // Получим уровень заголовка (h2, h3, h4)
                const headerTag = header.tagName.toLowerCase();
    
                // Определяем, что раскрывать: .instruction-content или элементы после заголовка
                let toToggle = [];
                let sibling = header.nextElementSibling;
                while (sibling && !['H2','H3','H4'].includes(sibling.tagName)) {
                    toToggle.push(sibling);
                    sibling = sibling.nextElementSibling;
                }
                // Если есть .instruction-content прямо под этим блоком — тоже добавим
                const content = currentBlock.querySelector(':scope > .instruction-content');
                if (content) toToggle.push(content);
    
                // Проверяем, открыт ли текущий раздел
                const isOpen = toToggle.some(el => el.style.display === 'block');
    
                // Если мы собираемся открыть раздел, сначала закроем другие блоки на том же уровне
                if (!isOpen) {
                    // Находим все блоки того же уровня, кроме текущего
                    parentContainer.querySelectorAll(`:scope > .instruction-block > ${headerTag}`).forEach(otherHeader => {
                        // Пропускаем текущий заголовок
                        if (otherHeader === header) return;
                        
                        const otherBlock = otherHeader.closest('.instruction-block');
                        
                        // Закрываем контент других блоков
                        const otherContent = otherBlock.querySelector(':scope > .instruction-content');
                        if (otherContent) {
                            otherContent.style.display = 'none';
                        }
                        
                        // Закрываем элементы после заголовка
                        let otherSibling = otherHeader.nextElementSibling;
                        while (otherSibling && !['H2','H3','H4'].includes(otherSibling.tagName)) {
                            otherSibling.style.display = 'none';
                            otherSibling = otherSibling.nextElementSibling;
                        }
                        
                        // Возвращаем стрелку в исходное положение
                        const otherIcon = otherHeader.querySelector('.toggle-icon');
                        if (otherIcon) {
                            otherIcon.style.transform = 'rotate(0deg)';
                        }
                    });
                }
    
                // Переключаем видимость текущего раздела
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
    
    // Добавляем обработчик изменения хэша в URL
    window.addEventListener('hashchange', function() {
        // НЕ сворачиваем все, только разворачиваем нужное
        expandMenuItemByHash();
    });
    
    // Сразу вызываем функцию для первоначального разворачивания блоков
    if (window.location.hash) {
        setTimeout(() => {
            expandMenuItemByHash();
        }, 100);
    }
});