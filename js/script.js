// Константы для элементов с проверкой на существование
document.addEventListener('DOMContentLoaded', function() {
    const DOM = {
        menu: document.querySelector('.corporate-nav ul.menu'),
        hamburger: document.querySelector('.hamburger'),
        scrollToTopBtn: document.getElementById('scrollToTop'),
        sections: document.querySelectorAll('.corporate-section'),
        navLinks: document.querySelectorAll('.sidebar-nav a'),
        featureCards: document.querySelectorAll('.feature-card'),
        instructionBlocks: document.querySelectorAll('.instruction-block, .agreement-block, .privacy-block')
    };

    const state = {
        activeCard: null,
        lastScrollPosition: 0,
        scrollDirection: 'down',
        currentActiveMenuItem: null 
    };

    // Обеспечиваем создание оверлея
    function ensureOverlayExists() {
        if (!document.querySelector('.sidebar-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
            
            overlay.addEventListener('click', function() {
                const menu = document.querySelector('.corporate-nav ul.menu');
                const sidebar = document.querySelector('.corporate-sidebar');
                
                if (menu && menu.classList.contains('active')) {
                    toggleMenu();
                }
                
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
        
        adminLoginBtn.addEventListener('click', function() {
            adminLoginModal.style.display = 'block';
            document.body.style.overflow = 'hidden'; 
        });
        
        closeModalBtn.addEventListener('click', function() {
            adminLoginModal.style.display = 'none';
            document.body.style.overflow = ''; 
            loginError.textContent = ''; 
            loginForm.reset(); 
        });
        
        window.addEventListener('click', function(event) {
            if (event.target === adminLoginModal) {
                adminLoginModal.style.display = 'none';
                document.body.style.overflow = '';
                loginError.textContent = '';
                loginForm.reset();
            }
        });
        
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (username === 'EACMB' && password === 'EA!04!CMB!25') {
                loginError.textContent = '';
                loginError.style.color = 'var(--success-color)';
                loginError.textContent = 'Вход выполнен успешно! Перенаправление...';
                
                localStorage.setItem('adminLoggedIn', 'true');
                
                setTimeout(function() {
                    window.location.href = 'admin.html';
                }, 1000);
            } else {
                loginError.style.color = 'var(--danger-color)';
                loginError.textContent = 'Неверный логин или пароль!';
                
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
        setupAdminLogin(); 
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

        expandMenuItemByHash(); 
        
        setupGlobalAnchorLinks();
    }
    
    // Новая функция для обработки всех якорных ссылок глобально
    function setupGlobalAnchorLinks() {
        document.querySelectorAll('a[href^="#"]:not(.sidebar-nav a):not(.corporate-nav a)').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                
                if (targetId === '#') return;
                
                window.location.hash = targetId.substring(1);
                
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
    
    // Функция для сворачивания всех пунктов меню в сайдбаре
    function collapseAllMenuItems() {
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
                if (!link.querySelector('.expand-arrow')) {
                    const arrow = document.createElement('i');
                    arrow.className = 'fas fa-chevron-right expand-arrow';
                    arrow.style.marginLeft = 'auto';
                    arrow.style.transition = 'transform 0.3s ease';
                    link.appendChild(arrow);
                }
                
                nestedUl.style.display = 'none';
                
                link.addEventListener('click', function(e) {
                    if (window.innerWidth <= 1024) { 
                        e.preventDefault();
                        
                        const arrow = this.querySelector('.expand-arrow');
                        const isExpanded = nestedUl.style.display === 'block';
                        
                        if (isExpanded) {
                            nestedUl.style.display = 'none';
                            if (arrow) arrow.style.transform = 'rotate(0deg)';
                        } else {
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
        const hash = window.location.hash;
        if (!hash) return;
        
        const targetLink = document.querySelector(`.sidebar-nav a[href="${hash}"]`);
        if (!targetLink) return;
        
        if (state.currentActiveMenuItem) {
            state.currentActiveMenuItem.classList.remove('active-menu-item');
        }
        targetLink.classList.add('active-menu-item');
        state.currentActiveMenuItem = targetLink;
        
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
        
        const targetId = hash.substring(1); 
        expandOnlyTargetInstructionBlock(targetId);
    }
    
    // Функция для разворачивания только целевого блока инструкций в основном контенте
    function expandOnlyTargetInstructionBlock(targetId) {
        
        document.querySelectorAll('.instruction-block .instruction-content').forEach(content => {
            content.style.display = 'none';
        });
        
        document.querySelectorAll('.instruction-block h2, .instruction-block h3, .instruction-block h4').forEach(header => {
            let sibling = header.nextElementSibling;
            while (sibling && !['H2','H3','H4'].includes(sibling.tagName)) {
                sibling.style.display = 'none';
                sibling = sibling.nextElementSibling;
            }
            
            const icon = header.querySelector('.toggle-icon');
            if (icon) {
                icon.style.transform = 'rotate(0deg)';
            }
        });
        
        const targetBlock = document.getElementById(targetId);
        if (!targetBlock) {
            return;
        }
                
        if (targetBlock.classList.contains('instruction-content')) {
            targetBlock.style.display = 'block';
            
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
            const content = targetBlock.querySelector(':scope > .instruction-content');
            if (content) {
                content.style.display = 'block';
            }
            
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

        let block = targetBlock.parentElement;
        while (block) {
            if (block.classList.contains('instruction-block')) {
                const content = block.querySelector(':scope > .instruction-content');
                if (content) {
                    content.style.display = 'block';
                }
                
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
            
            if (block.classList.contains('section-content') || block.classList.contains('corporate-main')) {
                break;
            }
            
            block = block.parentElement;
        }
        
        setTimeout(() => {
            const element = document.getElementById(targetId);
            if (element) {
                ensureElementVisible(element);
                highlightElement(element);
            }
        }, 100);
    }
    
    // Мобильное меню - улучшенная версия
    function setupMobileMenu() {
        if (DOM.hamburger) {
            DOM.hamburger.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault(); 
                toggleMenu();
            });
        }

        const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
        
        dropdownToggles.forEach((toggle, index) => {
            toggle.addEventListener('click', function(e) {
                if (window.innerWidth <= 1024) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const parent = this.parentElement;
                    const dropdownMenu = parent.querySelector('.dropdown-menu');
                    
                    if (!dropdownMenu) {
                        return;
                    }
                    
                    dropdownToggles.forEach(otherToggle => {
                        if (otherToggle !== toggle) {
                            const otherParent = otherToggle.parentElement;
                            const otherMenu = otherParent.querySelector('.dropdown-menu');
                            if (otherMenu && otherParent.classList.contains('mobile-active')) {
                                otherParent.classList.remove('mobile-active');
                                otherMenu.style.maxHeight = '0';
                            }
                        }
                    });
                    
                    const wasActive = parent.classList.contains('mobile-active');
                    parent.classList.toggle('mobile-active');
                    
                    if (parent.classList.contains('mobile-active')) {
                        setTimeout(() => {
                            dropdownMenu.style.maxHeight = dropdownMenu.scrollHeight + 'px';
                        }, 10);
                    } else {
                        dropdownMenu.style.maxHeight = '0';
                    }
                }
            });
        });

        if (DOM.menu) {
            const links = DOM.menu.querySelectorAll('a');
            
            links.forEach(link => {
                link.addEventListener('click', function(e) {
                    if (window.innerWidth <= 1024) {
                        const href = this.getAttribute('href');
                        
                        if (this.classList.contains('dropdown-toggle')) {
                            return;
                        }
                        
                        if (this.classList.contains('sidebar-menu-toggle')) {
                            e.preventDefault();
                            
                            toggleMenu();
                            
                            setTimeout(() => {
                                toggleSidebar();
                            }, 300);
                            return;
                        }
                        
                        if (href && href.startsWith('#')) {
                            e.preventDefault();
                            
                            const targetId = href.substring(1);
                            
                            toggleMenu();
                            
                            setTimeout(() => {
                                const targetElement = document.getElementById(targetId);
                                if (targetElement) {

                                    window.location.hash = href;
                                    
                                    expandMenuItemByHash();
                                    
                                    scrollToElement(targetElement);
                                    
                                    setTimeout(() => {
                                        ensureElementVisible(targetElement);
                                        highlightElement(targetElement);
                                    }, 700);
                                }
                            }, 300); 
                        }
                    }
                });
            });
        }
    }

    // Функция toggleMenu
    function toggleMenu() {
        const overlay = ensureOverlayExists();
        
        if (DOM.menu) {
            const wasActive = DOM.menu.classList.contains('active');
            
            DOM.menu.classList.toggle('active');
            if (DOM.hamburger) {
                DOM.hamburger.classList.toggle('active');
            }
            
            const sidebar = document.querySelector('.corporate-sidebar');
            const sidebarActive = sidebar && sidebar.classList.contains('active');
            
            if (DOM.menu.classList.contains('active')) {
                overlay.classList.add('active', 'menu-overlay');
                document.body.style.overflow = 'hidden';
            } else if (!sidebarActive) {
                overlay.classList.remove('active', 'menu-overlay');
                document.body.style.overflow = '';
            }
            
            if (wasActive) {
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
                menu.style.maxHeight = '0';
            }
        });
    }

    // Переключение боковой панели
    function toggleSidebar() {
        const sidebar = document.querySelector('.corporate-sidebar');
        const overlay = ensureOverlayExists();
        
        if (sidebar) {
            const wasActive = sidebar.classList.contains('active');
            sidebar.classList.toggle('active');
            
            const menu = document.querySelector('.corporate-nav ul.menu');
            const menuActive = menu && menu.classList.contains('active');
            
            if (sidebar.classList.contains('active')) {
                overlay.classList.add('active', 'sidebar-overlay-active');
                document.body.style.overflow = 'hidden';
            } else if (!menuActive) {
                overlay.classList.remove('active', 'sidebar-overlay-active');
                document.body.style.overflow = '';
            }
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
                    
                    if (targetId !== "#") {
                        window.location.hash = targetId.substring(1);
                        
                        expandMenuItemByHash();
                        
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
        const headerHeight = header ? header.offsetHeight + 20 : 70; 
        
        if (rect.top < headerHeight) {
            window.scrollBy({
                top: rect.top - headerHeight,
                behavior: 'smooth'
            });
        }
    }

    // Новая функция для подсветки элемента
    function highlightElement(element) {
        document.querySelectorAll('.highlight-pulse').forEach(el => {
            el.classList.remove('highlight-pulse');
        });
        
        let targetElement = element;
        
        if (element.tagName === 'H2' || element.tagName === 'H3' || element.tagName === 'H4') {
            const parentBlock = element.closest('.feature-card, .instruction-block, .agreement-block, .privacy-block');
            if (parentBlock) {
                targetElement = parentBlock;
            }
        }
        
        if (targetElement.classList.contains('feature-card')) {
            if (state.activeCard && state.activeCard !== targetElement) {
                state.activeCard.classList.remove('active');
            }
            
            targetElement.classList.add('active');
            state.activeCard = targetElement;
        }
        
        targetElement.classList.add('highlight-pulse');

        setTimeout(() => {
            targetElement.classList.remove('highlight-pulse');
        }, 3000);
    }

    // Улучшенная функция прокрутки к элементу
    function scrollToElement(element, customOffset = null) {
        if (!element) return;
        
        const header = document.querySelector('.corporate-header');
        const headerHeight = header ? header.offsetHeight : 0;
        
        let offset = customOffset;
        if (offset === null) {
            
            offset = 120; 
            
            if (element.classList.contains('feature-card')) {
                offset = 150; 
            } else if (element.id === 'function' || element.closest('.section-header')) {
                offset = 160; 
            }
        }
        
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
        
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
          threshold: 0.05 
        };
      
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view');
              observer.unobserve(entry.target); 
            }
          });
        }, options);
      
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
            const isMenuClick = e.target.closest('.corporate-nav') || 
                               e.target.closest('.hamburger') ||
                               e.target === DOM.hamburger;
            const isSidebarClick = e.target.closest('.corporate-sidebar') || 
                                  e.target.closest('.sidebar-toggle');
            const isOverlayClick = e.target.classList.contains('sidebar-overlay');
            
            if ((!isMenuClick || isOverlayClick) && DOM.menu && DOM.menu.classList.contains('active')) {
                toggleMenu();
            }
            
            if ((!isSidebarClick || isOverlayClick)) {
                const sidebar = document.querySelector('.corporate-sidebar');
                if (sidebar && sidebar.classList.contains('active')) {
                    toggleSidebar();
                }
            }
            
            if (state.activeCard && !e.target.closest('.feature-card')) {
                state.activeCard.classList.remove('active');
                state.activeCard = null;
            }
        });
    }

    // Сворачиваемые блоки
    function setupCollapsibleBlocks() {

        document.querySelectorAll('.instruction-block h2, .instruction-block h3, .instruction-block h4, .agreement-block h2, .agreement-block h3, .agreement-block h4, .privacy-block h2, .privacy-block h3, .privacy-block h4').forEach(header => {

            const existingIcon = header.querySelector('.toggle-icon');
            if (existingIcon) existingIcon.remove();

            const toggleIcon = document.createElement('i');
            toggleIcon.className = 'fas fa-chevron-right toggle-icon';
            toggleIcon.style.cssText = 'margin-left: 10px; transition: transform 0.3s ease; float: right;';
            header.appendChild(toggleIcon);
        });

        hideAllContent();

        let currentOpenTopLevel = null;

        // Обработка клика по заголовкам
        document.querySelectorAll('.instruction-block h2, .instruction-block h3, .instruction-block h4, .agreement-block h2, .agreement-block h3, .agreement-block h4, .privacy-block h2, .privacy-block h3, .privacy-block h4').forEach(header => {
            header.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                const currentBlock = header.closest('.instruction-block, .agreement-block, .privacy-block');
                const headerLevel = getHeaderLevel(header);
                
                if (isTopLevelHeader(header)) {
                    if (currentOpenTopLevel === currentBlock) {
                        hideAllContent();
                        currentOpenTopLevel = null;
                        return;
                    }
                    
                    hideAllContent();
                    
                    showBlockContent(currentBlock);
                    currentOpenTopLevel = currentBlock;
                } else {
                    handleAdvancedAccordion(currentBlock, header);
                }
            });
        });

        // Улучшенная функция для обработки аккордеона подразделов любого уровня
        function handleAdvancedAccordion(currentBlock, clickedHeader) {
            const clickedLevel = getHeaderLevel(clickedHeader);
            
            const siblingBlocks = findSameLevelSiblings(currentBlock, clickedLevel);
            
            siblingBlocks.forEach(sibling => {
                if (sibling !== currentBlock) {
                    hideBlockContentRecursively(sibling);
                }
            });

            toggleBlockContent(currentBlock);
        }

        // Функция для поиска блоков на том же уровне вложенности
        function findSameLevelSiblings(currentBlock, targetLevel) {
            const siblings = [];
            
            let container = currentBlock.parentElement;
            
            while (container && !container.classList.contains('instruction-content') && 
              !container.classList.contains('agreement-content') && 
              !container.classList.contains('privacy-content') && 
              !container.classList.contains('section-content')) {
                container = container.parentElement;
            }
            
            if (!container) return siblings;
            
            const allBlocks = container.querySelectorAll('.instruction-block, .agreement-block, .privacy-block');
            
            allBlocks.forEach(block => {
                const header = block.querySelector(':scope > h2, :scope > h3, :scope > h4');
                if (header && getHeaderLevel(header) === targetLevel) {
                    if (isOnSameNestingLevel(currentBlock, block)) {
                        siblings.push(block);
                    }
                }
            });
            
            return siblings;
        }

        // Функция для проверки, находятся ли блоки на одном уровне вложенности
        function isOnSameNestingLevel(block1, block2) {
            const parent1 = findDirectParentBlock(block1);
            const parent2 = findDirectParentBlock(block2);
            
            return parent1 === parent2;
        }

        // Функция для поиска прямого родительского блока
        function findDirectParentBlock(block) {
            let parent = block.parentElement;
            
            while (parent && !parent.classList.contains('section-content')) {
                if ((parent.classList.contains('instruction-block') || 
                    parent.classList.contains('agreement-block') || 
                    parent.classList.contains('privacy-block')) && 
                    parent !== block) {
                    return parent;
                }
                parent = parent.parentElement;
            }
            
            return null; 
        }

        // Функция для рекурсивного скрытия содержимого блока и всех вложенных блоков
        function hideBlockContentRecursively(block) {

            hideBlockContent(block);

            const nestedBlocks = block.querySelectorAll('.instruction-block, .agreement-block, .privacy-block');
            nestedBlocks.forEach(nestedBlock => {
                hideBlockContent(nestedBlock);
            });
        }

        // Функция для определения уровня заголовка
        function getHeaderLevel(header) {
            return parseInt(header.tagName.substring(1)); 
        }

        // Функция для определения, является ли заголовок верхнего уровня
        function isTopLevelHeader(header) {
            const block = header.closest('.instruction-block, .agreement-block, .privacy-block');
            if (!block) return false;
            
            const parent = block.parentElement;
            return parent && parent.classList.contains('section-content');
        }

        // Функция для скрытия всего содержимого
        function hideAllContent() {
            document.querySelectorAll('.instruction-block, .agreement-block, .privacy-block').forEach(block => {
                hideBlockContent(block);
            });
        }

        // Функция для скрытия содержимого блока
        function hideBlockContent(block) {
            let contentClass = '.instruction-content';
            if (block.classList.contains('agreement-block')) {
                contentClass = '.agreement-content';
            } else if (block.classList.contains('privacy-block')) {
                contentClass = '.privacy-content';
            }
            
            const content = block.querySelector(`:scope > ${contentClass}`);
            if (content) content.style.display = 'none';

            const header = block.querySelector(':scope > h2, :scope > h3, :scope > h4');
            if (header) {
                let sibling = header.nextElementSibling;
                while (sibling && !['H2','H3','H4'].includes(sibling.tagName)) {
                    sibling.style.display = 'none';
                    sibling = sibling.nextElementSibling;
                }

                const icon = header.querySelector('.toggle-icon');
                if (icon) icon.style.transform = 'rotate(0deg)';
            }

            block.classList.remove('active');
        }

        // Функция для показа содержимого блока
        function showBlockContent(block) {
            let contentClass = '.instruction-content';
            if (block.classList.contains('agreement-block')) {
                contentClass = '.agreement-content';
            } else if (block.classList.contains('privacy-block')) {
                contentClass = '.privacy-content';
            }
            
            // Показываем содержимое
            const content = block.querySelector(`:scope > ${contentClass}`);
            if (content) content.style.display = 'block';

            // Показываем элементы после заголовка
            const header = block.querySelector(':scope > h2, :scope > h3, :scope > h4');
            if (header) {
                let sibling = header.nextElementSibling;
                while (sibling && !['H2','H3','H4'].includes(sibling.tagName)) {
                    sibling.style.display = 'block';
                    sibling = sibling.nextElementSibling;
                }

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
        if (isMobile) return; 

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        // Анимация для карточек функций
        DOM.featureCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = `opacity 0.4s ease ${index * 0.08}s, transform 0.4s ease ${index * 0.08}s`;
            observer.observe(card);
        });
        
        // Анимация для блоков инструкций, соглашения и политики
        const contentBlocks = document.querySelectorAll('.instruction-block, .agreement-block, .privacy-block');
        contentBlocks.forEach((block, index) => {
            if (block.closest('.instruction-content, .agreement-content, .privacy-content')) {
                return;
            }
            
            block.style.opacity = '0';
            block.style.transform = 'translateY(20px)'; 
            block.style.transition = `opacity 0.4s ease ${index * 0.02}s, transform 0.4s ease ${index * 0.02}s`; 
            observer.observe(block);
        });
        
        // Анимация для основных секций
        const mainSections = document.querySelectorAll('#instructions > .section-header, #agreement > .section-header, #privacy > .section-header');
        mainSections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(15px)'; 
            section.style.transition = 'opacity 0.5s ease, transform 0.5s ease'; 
            observer.observe(section);
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
            if (overlay) {
                overlay.classList.remove('active', 'menu-overlay', 'sidebar-overlay-active');
            }
            document.body.style.overflow = '';
            
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.style.maxHeight = '';
            });
            
            document.querySelectorAll('.dropdown').forEach(dropdown => {
                dropdown.classList.remove('active');
                dropdown.classList.remove('mobile-active');
            });
        }
    });

    init();
    
    // Добавляем обработчик изменения хэша в URL
    window.addEventListener('hashchange', function() {
        expandMenuItemByHash();
        
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