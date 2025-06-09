document.addEventListener("DOMContentLoaded", () => {
    console.log("Сайт бота успешно загружен.");

    // Показ кнопки "Наверх"
    const scrollToTopButton = document.getElementById('scrollToTop');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopButton.style.display = 'block';
        } else {
            scrollToTopButton.style.display = 'none';
        }
    });

    scrollToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Плавный переход по ссылкам меню
    document.querySelectorAll('#content-block nav a').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                highlightMenuLink(link); // Подсветить активный пункт меню
            }
        });
    });

    // Подсветка активного раздела
    const sections = document.querySelectorAll('section');
    const menuLinks = document.querySelectorAll('#content-block nav a');

    window.addEventListener('scroll', () => {
        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100; // Задержка для более точного определения
            const sectionHeight = section.offsetHeight;

            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        menuLinks.forEach(link => {
            link.classList.remove('active'); // Убрать подсветку со всех ссылок
            if (link.getAttribute('href').substring(1) === currentSection) {
                link.classList.add('active'); // Добавить подсветку текущей ссылке
            }
        });
    });

    // Обработчик для гамбургер-меню
    const hamburger = document.querySelector('.hamburger');
    const menu = document.querySelector('.menu');

    hamburger.addEventListener('click', () => {
        menu.classList.toggle('active');
    });

    menu.addEventListener('click', (event) => {
        if (event.target.tagName === 'A') {
            menu.classList.remove('active');
        }
    });
});

// Подсветка активного пункта меню
function highlightMenuLink(activeLink) {
    document.querySelectorAll('#content-block nav a').forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}