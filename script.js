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

    // Обеспечиваем создание оверлея
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

    // Функция для настройки формы входа администратора
    function setupAdminLogin() {
        const adminLoginBtn = document.getElementById('adminLoginBtn');
        const adminLoginModal = document.getElementById('adminLoginModal');
        const closeModalBtn = adminLoginModal.querySelector('.close-modal');
        const loginForm = document.getElementById('adminLoginForm');
        const loginError = document.getElementById('loginError');
        
        // Открытие модального окна
        adminLoginBtn.addEventListener('click', function() {
            adminLoginModal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Запрет прокрутки страницы
        });
        
        // Закрытие модального окна по клику на крестик
        closeModalBtn.addEventListener('click', function() {
            adminLoginModal.style.display = 'none';
            document.body.style.overflow = ''; // Восстановление прокрутки
            loginError.textContent = ''; // Очистка ошибок
            loginForm.reset(); // Очистка формы
        });
        
        // Закрытие модального окна по клику вне его содержимого
        window.addEventListener('click', function(event) {
            if (event.target === adminLoginModal) {
                adminLoginModal.style.display = 'none';
                document.body.style.overflow = '';
                loginError.textContent = '';
                loginForm.reset();
            }
        });
        
        // Обработка отправки формы
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Проверка учетных данных
            if (username === 'EACMB' && password === 'EA!04!CMB!25') {
                // Успешный вход
                loginError.textContent = '';
                loginError.style.color = 'var(--success-color)';
                loginError.textContent = 'Вход выполнен успешно! Перенаправление...';
                
                // Сохранение состояния авторизации в localStorage
                localStorage.setItem('adminLoggedIn', 'true');
                
                // Перенаправление на страницу админа через 1 секунду
                setTimeout(function() {
                    window.location.href = 'admin.html';
                }, 1000);
            } else {
                // Неверные учетные данные
                loginError.style.color = 'var(--danger-color)';
                loginError.textContent = 'Неверный логин или пароль!';
                
                // Анимация ошибки
                loginForm.classList.add('error-shake');
                setTimeout(function() {
                    loginForm.classList.remove('error-shake');
                }, 500);
            }
        });
    }

    // Инициализация при загрузке
    function init() {
        ensureOverlayExists();
        setupAdminLogin(); // Перемещаем сюда вызов setupAdminLogin
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
        
        // Добавляем глобальный обработчик для всех ссылок с якорями
        setupGlobalAnchorLinks();
    }
    
    // Новая функция для обработки всех якорных ссылок глобально
    function setupGlobalAnchorLinks() {
        // Ищем все якорные ссылки в футере и других частях сайта (кроме меню)
        document.querySelectorAll('a[href^="#"]:not(.sidebar-nav a):not(.corporate-nav a)').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                
                // Проверяем, не пустой ли якорь
                if (targetId === '#') return;
                
                // Обновляем URL
                window.location.hash = targetId.substring(1);
                
                // Находим целевой элемент
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Прокручиваем к элементу
                    scrollToElement(targetElement);
                    
                    // Подсвечиваем и убеждаемся, что элемент видим
                    setTimeout(() => {
                        ensureElementVisible(targetElement);
                        highlightElement(targetElement);
                    }, 700);
                }
            });
        });
    }
    
    // Функция для сворачивания всех пунктов меню в сайдбаре
    function collapseAllMenuItems() {
        // Сворачиваем все вложенные ul в сайдбаре
        document.querySelectorAll('.sidebar-nav ul ul').forEach(ul => {
            ul.style.display = 'none';
        });
    }

    // Улучшенная функция для работы с сайдбаром - добавляем кликабельность к родительским элементам
    function setupSidebarNavigation() {
        const sidebarLinks = document.querySelectorAll('.sidebar-nav > ul > li > a');
        
        sidebarLinks.forEach(link => {
            const parentLi = link.parentElement;
            const nestedUl = parentLi.querySelector('ul');
            
            if (nestedUl) {
                // Добавляем стрелку для обозначения раскрывающегося меню
                if (!link.querySelector('.expand-arrow')) {
                    const arrow = document.createElement('i');
                    arrow.className = 'fas fa-chevron-right expand-arrow';
                    arrow.style.marginLeft = 'auto';
                    arrow.style.transition = 'transform 0.3s ease';
                    link.appendChild(arrow);
                }
                
                // Изначально скрываем вложенные меню
                nestedUl.style.display = 'none';
                
                // Добавляем обработчик клика
                link.addEventListener('click', function(e) {
                    if (window.innerWidth <= 1024) { // Только на мобильных
                        e.preventDefault();
                        
                        const arrow = this.querySelector('.expand-arrow');
                        const isExpanded = nestedUl.style.display === 'block';
                        
                        if (isExpanded) {
                            nestedUl.style.display = 'none';
                            if (arrow) arrow.style.transform = 'rotate(0deg)';
                        } else {
                            // Сворачиваем другие открытые меню
                            document.querySelectorAll('.sidebar-nav ul ul').forEach(ul => {
                                if (ul !== nestedUl) {
                                    ul.style.display = 'none';
                                    const otherArrow = ul.parentElement.querySelector('a .expand-arrow');
                                    if (otherArrow) otherArrow.style.transform = 'rotate(0deg)';
                                }
                            });
                            
                            nestedUl.style.display = 'block';
                            if (arrow) arrow.style.transform = 'rotate(90deg)';
                        }
                    }
                });
            }
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
    
    // Мобильное меню - улучшенная версия с отладкой
    function setupMobileMenu() {
        console.log('🔧 Инициализация мобильного меню...');
        
        if (DOM.hamburger) {
            DOM.hamburger.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleMenu();
            });
            console.log('✅ Гамбургер меню настроено');
        }

        // Добавляем обработку выпадающих меню для мобильных устройств
        const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
        console.log(`🔍 Найдено ${dropdownToggles.length} выпадающих меню`);
        
        dropdownToggles.forEach((toggle, index) => {
            console.log(`📋 Настройка меню ${index + 1}: ${toggle.textContent.trim()}`);
            
            toggle.addEventListener('click', function(e) {
                console.log(`📱 Клик по меню: ${this.textContent.trim()}, ширина: ${window.innerWidth}px`);
                
                // Только для мобильных устройств
                if (window.innerWidth <= 1024) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const parent = this.parentElement;
                    const dropdownMenu = parent.querySelector('.dropdown-menu');
                    
                    console.log(`🎯 Родительский элемент:`, parent);
                    console.log(`📋 Выпадающее меню:`, dropdownMenu);
                    
                    if (!dropdownMenu) {
                        console.warn('⚠️ Выпадающее меню не найдено!');
                        return;
                    }
                    
                    // Закрываем другие открытые выпадающие меню с анимацией
                    dropdownToggles.forEach(otherToggle => {
                        if (otherToggle !== toggle) {
                            const otherParent = otherToggle.parentElement;
                            const otherMenu = otherParent.querySelector('.dropdown-menu');
                            if (otherMenu && otherParent.classList.contains('mobile-active')) {
                                console.log('🔒 Закрываем другое меню');
                                otherParent.classList.remove('mobile-active');
                                // Плавное закрытие
                                otherMenu.style.maxHeight = '0';
                            }
                        }
                    });
                    
                    // Переключаем текущее выпадающее меню с анимацией
                    const wasActive = parent.classList.contains('mobile-active');
                    parent.classList.toggle('mobile-active');
                    
                    if (parent.classList.contains('mobile-active')) {
                        console.log('🔓 Открываем меню');
                        // Плавное открытие
                        setTimeout(() => {
                            dropdownMenu.style.maxHeight = dropdownMenu.scrollHeight + 'px';
                        }, 10);
                    } else {
                        console.log('🔒 Закрываем меню');
                        // Плавное закрытие
                        dropdownMenu.style.maxHeight = '0';
                    }
                } else {
                    console.log('🖥️ Десктопная версия - стандартное поведение');
                }
            });
        });

        // Обрабатываем клики по ВСЕМ ссылкам в мобильном меню
        if (DOM.menu) {
            const links = DOM.menu.querySelectorAll('a');
            console.log(`🔗 Настройка ${links.length} ссылок в меню`);
            
            links.forEach(link => {
                link.addEventListener('click', function(e) {
                    if (window.innerWidth <= 1024) {
                        const href = this.getAttribute('href');
                        
                        // Если это выпадающее меню, пропускаем обработку
                        if (this.classList.contains('dropdown-toggle')) {
                            return;
                        }
                        
                        // Если это кнопка "Содержание"
                        if (this.classList.contains('sidebar-menu-toggle')) {
                            e.preventDefault();
                            console.log('📋 Открываем боковую панель');
                            
                            // Закрываем мобильное меню
                            toggleMenu();
                            
                            // Открываем боковую панель через небольшую задержку
                            setTimeout(() => {
                                toggleSidebar();
                            }, 300);
                            return;
                        }
                        
                        // Если это якорная ссылка
                        if (href && href.startsWith('#')) {
                            e.preventDefault();
                            
                            // Запоминаем целевую секцию
                            const targetId = href.substring(1);
                            console.log(`🎯 Переход к секции: ${targetId}`);
                            
                            // Сначала закрываем меню
                            toggleMenu();
                            
                            // Ждем завершения анимации закрытия меню и потом скроллим
                            setTimeout(() => {
                                const targetElement = document.getElementById(targetId);
                                if (targetElement) {
                                    // Обновляем хеш
                                    window.location.hash = href;
                                    
                                    // Разворачиваем меню сайдбара если нужно
                                    expandMenuItemByHash();
                                    
                                    // Прокручиваем к элементу
                                    scrollToElement(targetElement);
                                    
                                    // Обеспечиваем видимость элемента
                                    setTimeout(() => {
                                        ensureElementVisible(targetElement);
                                        highlightElement(targetElement);
                                    }, 700);
                                }
                            }, 300); // Ждем завершения анимации закрытия меню
                        }
                    }
                });
            });
        }
        
        console.log('✅ Мобильное меню полностью настроено');
    }

    function toggleMenu() {
        const overlay = ensureOverlayExists();
        
        if (DOM.menu) {
            DOM.menu.classList.toggle('active');
            if (DOM.hamburger) {
                DOM.hamburger.classList.toggle('active');
            }
            overlay.classList.toggle('active');
            
            if (DOM.menu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
                // При закрытии меню сбрасываем состояния выпадающих подменю
                resetDropdowns();
            }
        }
    }

    // Функция для сброса всех выпадающих меню с анимацией
    function resetDropdowns() {
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            dropdown.classList.remove('active');
            dropdown.classList.remove('mobile-active');
            const menu = dropdown.querySelector('.dropdown-menu');
            if (menu) {
                // Плавное закрытие
                menu.style.maxHeight = '0';
            }
        });
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
        const anchors = document.querySelectorAll('.sidebar-nav a[href^="#"]');
        if (anchors.length) {
            anchors.forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href');
                    
                    // Обновляем URL, чтобы правильно сработала функция по хэшу
                    if (targetId !== "#") {
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
    
    // Если футер виден, останавливаем автоматическую анимацию секций
    const footer = document.querySelector('.corporate-footer');
    if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        if (footerRect.top <= windowHeight) {
            document.querySelectorAll('.corporate-section:not(.in-view)').forEach(section => {
                section.classList.add('in-view');
            });
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

    // Хэндлер для закрытия активных элементов при клике вне меню
    function setupClickOutsideHandler() {
        document.addEventListener('click', function(e) {
            // Закрываем меню и сайдбар если клик был вне их области
            const isMenuClick = e.target.closest('.corporate-nav') || e.target.closest('.hamburger');
            const isSidebarClick = e.target.closest('.corporate-sidebar') || e.target.closest('.sidebar-toggle');
            
            if (!isMenuClick && DOM.menu && DOM.menu.classList.contains('active')) {
                toggleMenu();
            }
            
            if (!isSidebarClick) {
                const sidebar = document.querySelector('.corporate-sidebar');
                if (sidebar && sidebar.classList.contains('active')) {
                    toggleSidebar();
                }
            }
            
            // Закрываем активную карточку
            if (state.activeCard && !e.target.closest('.feature-card')) {
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

        // Изначально скрываем все содержимое
        hideAllContent();

        // Переменная для отслеживания текущего открытого раздела верхнего уровня
        let currentOpenTopLevel = null;

        // Обработка клика по заголовкам
        document.querySelectorAll('.instruction-block h2, .instruction-block h3, .instruction-block h4').forEach(header => {
            header.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                const currentBlock = header.closest('.instruction-block');
                const headerLevel = getHeaderLevel(header);
                
                // Если это заголовок верхнего уровня (h2 или первый уровень в иерархии)
                if (isTopLevelHeader(header)) {
                    // Если кликнули по уже открытому разделу верхнего уровня - закрываем его
                    if (currentOpenTopLevel === currentBlock) {
                        hideAllContent();
                        currentOpenTopLevel = null;
                        return;
                    }
                    
                    // Закрываем все содержимое
                    hideAllContent();
                    
                    // Открываем новый раздел верхнего уровня
                    showBlockContent(currentBlock);
                    currentOpenTopLevel = currentBlock;
                } else {
                    // Для подразделов - применяем улучшенный аккордеон-эффект
                    handleAdvancedAccordion(currentBlock, header);
                }
            });
        });

        // Улучшенная функция для обработки аккордеона подразделов любого уровня
        function handleAdvancedAccordion(currentBlock, clickedHeader) {
            const clickedLevel = getHeaderLevel(clickedHeader);
            
            // Находим все блоки на том же уровне вложенности
            const siblingBlocks = findSameLevelSiblings(currentBlock, clickedLevel);
            
            // Закрываем все сиблинги на том же уровне
            siblingBlocks.forEach(sibling => {
                if (sibling !== currentBlock) {
                    hideBlockContentRecursively(sibling);
                }
            });

            // Переключаем текущий блок
            toggleBlockContent(currentBlock);
        }

        // Функция для поиска блоков на том же уровне вложенности
        function findSameLevelSiblings(currentBlock, targetLevel) {
            const siblings = [];
            
            // Определяем контейнер для поиска (родительский блок или секция)
            let container = currentBlock.parentElement;
            
            // Ищем подходящий контейнер (instruction-content или section-content)
            while (container && !container.classList.contains('instruction-content') && 
                   !container.classList.contains('section-content')) {
                container = container.parentElement;
            }
            
            if (!container) return siblings;
            
            // Находим все instruction-block в этом контейнере
            const allBlocks = container.querySelectorAll('.instruction-block');
            
            allBlocks.forEach(block => {
                const header = block.querySelector(':scope > h2, :scope > h3, :scope > h4');
                if (header && getHeaderLevel(header) === targetLevel) {
                    // Проверяем, что блок находится на том же уровне вложенности
                    if (isOnSameNestingLevel(currentBlock, block)) {
                        siblings.push(block);
                    }
                }
            });
            
            return siblings;
        }

        // Функция для проверки, находятся ли блоки на одном уровне вложенности
        function isOnSameNestingLevel(block1, block2) {
            const parent1 = findDirectParentInstructionBlock(block1);
            const parent2 = findDirectParentInstructionBlock(block2);
            
            return parent1 === parent2;
        }

        // Функция для поиска прямого родительского instruction-block
        function findDirectParentInstructionBlock(block) {
            let parent = block.parentElement;
            
            while (parent && !parent.classList.contains('section-content')) {
                if (parent.classList.contains('instruction-block') && parent !== block) {
                    return parent;
                }
                parent = parent.parentElement;
            }
            
            return null; // Если нет родительского instruction-block
        }

        // Функция для рекурсивного скрытия содержимого блока и всех вложенных блоков
        function hideBlockContentRecursively(block) {
            // Скрываем содержимое текущего блока
            hideBlockContent(block);
            
            // Находим и скрываем все вложенные instruction-block
            const nestedBlocks = block.querySelectorAll('.instruction-block');
            nestedBlocks.forEach(nestedBlock => {
                hideBlockContent(nestedBlock);
            });
        }

        // Функция для определения уровня заголовка
        function getHeaderLevel(header) {
            return parseInt(header.tagName.substring(1)); // H2 -> 2, H3 -> 3, etc.
        }

        // Функция для определения, является ли заголовок верхнего уровня
        function isTopLevelHeader(header) {
            // Проверяем, что это прямой дочерний элемент section-content
            const block = header.closest('.instruction-block');
            if (!block) return false;
            
            const parent = block.parentElement;
            return parent && parent.classList.contains('section-content');
        }

        // Функция для скрытия всего содержимого
        function hideAllContent() {
            document.querySelectorAll('.instruction-block').forEach(block => {
                hideBlockContent(block);
            });
        }

        // Функция для скрытия содержимого блока
        function hideBlockContent(block) {
            // Скрываем .instruction-content
            const content = block.querySelector(':scope > .instruction-content');
            if (content) content.style.display = 'none';

            // Скрываем элементы после заголовка
            const header = block.querySelector(':scope > h2, :scope > h3, :scope > h4');
            if (header) {
                let sibling = header.nextElementSibling;
                while (sibling && !['H2','H3','H4'].includes(sibling.tagName)) {
                    sibling.style.display = 'none';
                    sibling = sibling.nextElementSibling;
                }

                // Поворачиваем стрелку в исходное положение
                const icon = header.querySelector('.toggle-icon');
                if (icon) icon.style.transform = 'rotate(0deg)';
            }

            block.classList.remove('active');
        }

        // Функция для показа содержимого блока
        function showBlockContent(block) {
            // Показываем .instruction-content
            const content = block.querySelector(':scope > .instruction-content');
            if (content) content.style.display = 'block';

            // Показываем элементы после заголовка
            const header = block.querySelector(':scope > h2, :scope > h3, :scope > h4');
            if (header) {
                let sibling = header.nextElementSibling;
                while (sibling && !['H2','H3','H4'].includes(sibling.tagName)) {
                    sibling.style.display = 'block';
                    sibling = sibling.nextElementSibling;
                }

                // Поворачиваем стрелку
                const icon = header.querySelector('.toggle-icon');
                if (icon) icon.style.transform = 'rotate(90deg)';
            }

            block.classList.add('active');
        }

        // Функция для переключения видимости содержимого блока
        function toggleBlockContent(block) {
            const isVisible = block.classList.contains('active');
            
            if (isVisible) {
                hideBlockContentRecursively(block);
            } else {
                showBlockContent(block);
            }
        }
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

    // Обработчик изменения размера окна
    window.addEventListener('resize', function() {
        const menu = document.querySelector('.corporate-nav ul.menu');
        const sidebar = document.querySelector('.corporate-sidebar');
        const hamburger = document.querySelector('.hamburger');
        const overlay = document.querySelector('.sidebar-overlay');
        
        if (window.innerWidth > 1024) {
            if (menu) menu.classList.remove('active');
            if (hamburger) hamburger.classList.remove('active');
            if (sidebar) sidebar.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
            
            // Сбрасываем стили выпадающих меню при переходе к десктопной версии
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.style.maxHeight = '';
            });
            
            document.querySelectorAll('.dropdown').forEach(dropdown => {
                dropdown.classList.remove('active');
                dropdown.classList.remove('mobile-active');
            });
        }
    });

    // Запуск приложения
    init();
    
    // Добавляем обработчик изменения хэша в URL
    window.addEventListener('hashchange', function() {
        // НЕ сворачиваем все, только разворачиваем нужное
        expandMenuItemByHash();
        
        // Добавляем прокрутку к элементу по хэшу
        const hash = window.location.hash;
        if (hash) {
            const targetElement = document.querySelector(hash);
            if (targetElement) {
                setTimeout(() => {
                    scrollToElement(targetElement);
                    setTimeout(() => {
                        ensureElementVisible(targetElement);
                        highlightElement(targetElement);
                    }, 400);
                }, 200);
            }
        }
    });
    
    // Сразу вызываем функцию для первоначального разворачивания блоков
    if (window.location.hash) {
        setTimeout(() => {
            expandMenuItemByHash();
            // Также добавляем прокрутку к начальному хэшу
            const targetElement = document.querySelector(window.location.hash);
            if (targetElement) {
                scrollToElement(targetElement);
                setTimeout(() => {
                    ensureElementVisible(targetElement);
                    highlightElement(targetElement);
                }, 600);
            }
        }, 300);
    }
});