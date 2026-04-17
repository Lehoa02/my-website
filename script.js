const themePalettes = {
    dark: {
        gradientStops: [
            "rgba(10, 10, 10, 1)",
            "rgba(30, 30, 60, 1)",
            "rgba(5, 5, 20, 1)",
        ],
        blobStart: { r: 160, g: 32, b: 240 },
        blobEnd: { r: 240, g: 60, b: 130 },
        shadow: "rgba(0, 0, 0, 0.2)",
    },
    light: {
        gradientStops: [
            "rgba(250, 249, 255, 1)",
            "rgba(238, 240, 255, 1)",
            "rgba(252, 248, 255, 1)",
        ],
        blobStart: { r: 179, g: 148, b: 255 },
        blobEnd: { r: 139, g: 92, b: 246 },
        shadow: "rgba(15, 23, 42, 0.08)",
    },
};

const themeTransitionDuration = 720;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let themeTransition = null;
let themeTransitionTimer = null;

function parseRgbaColor(color) {
    const match = color.match(/rgba?\(([^)]+)\)/);

    if (!match) {
        return { r: 255, g: 255, b: 255, a: 1 };
    }

    const parts = match[1].split(",").map(part => part.trim());
    const [r, g, b] = parts.slice(0, 3).map(Number);
    const a = parts.length > 3 ? Number(parts[3]) : 1;

    return { r, g, b, a };
}

function mixNumber(start, end, amount) {
    return start + (end - start) * amount;
}

function mixColor(startColor, endColor, amount) {
    return {
        r: Math.round(mixNumber(startColor.r, endColor.r, amount)),
        g: Math.round(mixNumber(startColor.g, endColor.g, amount)),
        b: Math.round(mixNumber(startColor.b, endColor.b, amount)),
        a: mixNumber(startColor.a ?? 1, endColor.a ?? 1, amount),
    };
}

function colorToRgba(color) {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a.toFixed(3)})`;
}

function easeInOutCubic(amount) {
    return amount < 0.5 ? 4 * amount * amount * amount : 1 - Math.pow(-2 * amount + 2, 3) / 2;
}

function blendPalette(fromPalette, toPalette, amount) {
    const gradientStops = fromPalette.gradientStops.map((stop, index) => colorToRgba(mixColor(parseRgbaColor(stop), parseRgbaColor(toPalette.gradientStops[index]), amount)));

    return {
        gradientStops,
        blobStart: mixColor(fromPalette.blobStart, toPalette.blobStart, amount),
        blobEnd: mixColor(fromPalette.blobEnd, toPalette.blobEnd, amount),
        shadow: colorToRgba(mixColor(parseRgbaColor(fromPalette.shadow), parseRgbaColor(toPalette.shadow), amount)),
    };
}

function getRenderedPalette(now = performance.now()) {
    if (!themeTransition) {
        return themePalettes[currentTheme];
    }

    const elapsed = now - themeTransition.startedAt;
    const progress = Math.min(elapsed / themeTransition.duration, 1);

    if (progress >= 1) {
        themeTransition = null;
        return themePalettes[currentTheme];
    }

    return blendPalette(themePalettes[themeTransition.fromTheme], themePalettes[themeTransition.toTheme], easeInOutCubic(progress));
}

function triggerThemeTransition(previousTheme, nextTheme) {
    if (prefersReducedMotion) {
        return;
    }

    themeTransition = {
        fromTheme: previousTheme,
        toTheme: nextTheme,
        startedAt: performance.now(),
        duration: themeTransitionDuration,
    };

    document.body.classList.remove("theme-transitioning");
    void document.body.offsetWidth;
    document.body.classList.add("theme-transitioning");

    if (themeTransitionTimer) {
        window.clearTimeout(themeTransitionTimer);
    }

    themeTransitionTimer = window.setTimeout(() => {
        document.body.classList.remove("theme-transitioning");
        themeTransition = null;
    }, themeTransitionDuration);
}

let currentTheme = "dark";

try {
    const storedTheme = localStorage.getItem("portfolio-theme");
    if (storedTheme === "light" || storedTheme === "dark") {
        currentTheme = storedTheme;
    }
} catch (error) {
    console.warn("Theme preference could not be loaded.", error);
}

document.body.dataset.theme = currentTheme;

const themeToggle = document.getElementById("theme-toggle");

function syncThemeToggle(theme) {
    if (!themeToggle) {
        return;
    }

    const isLight = theme === "light";
    themeToggle.checked = isLight;
    themeToggle.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
}

function applyTheme(theme, persist = true) {
    if (theme === currentTheme) {
        syncThemeToggle(theme);
        return;
    }

    const previousTheme = currentTheme;
    currentTheme = theme;
    document.body.dataset.theme = theme;

    if (persist) {
        try {
            localStorage.setItem("portfolio-theme", theme);
        } catch (error) {
            console.warn("Theme preference could not be saved.", error);
        }
    }

    syncThemeToggle(theme);
    triggerThemeTransition(previousTheme, theme);
    drawGradientBackground();
}

syncThemeToggle(currentTheme);

if (themeToggle) {
    themeToggle.addEventListener("change", () => {
        applyTheme(themeToggle.checked ? "light" : "dark");
    });
}

const navToggle = document.getElementById("nav-toggle");
const navBackdrop = document.getElementById("nav-backdrop");
const siteNav = document.getElementById("site-nav");
const mobileNavQuery = window.matchMedia("(max-width: 768px)");

function syncNavState(isOpen) {
    if (!navToggle) {
        return;
    }

    const icon = navToggle.querySelector("i");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");

    if (icon) {
        icon.className = isOpen ? "bx bx-x" : "bx bx-menu";
    }
}

function closeNav() {
    document.body.classList.remove("nav-open");

    if (navBackdrop) {
        navBackdrop.hidden = true;
    }

    syncNavState(false);
}

function openNav() {
    if (!siteNav || !mobileNavQuery.matches) {
        return;
    }

    document.body.classList.add("nav-open");

    if (navBackdrop) {
        navBackdrop.hidden = false;
    }

    syncNavState(true);
}

if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
        if (document.body.classList.contains("nav-open")) {
            closeNav();
        } else {
            openNav();
        }
    });

    navBackdrop?.addEventListener("click", closeNav);

    siteNav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            if (mobileNavQuery.matches) {
                closeNav();
            }
        });
    });

    mobileNavQuery.addEventListener("change", event => {
        if (!event.matches) {
            closeNav();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeNav();
        }
    });

    syncNavState(false);
}

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const blobs = [];
const numBlobs = 17; // Increase number of blobs

window.addEventListener("resize", setupCanvas);
setupCanvas();
initBlobs();

function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawGradientBackground();
}

function drawGradientBackground(palette = getRenderedPalette()) {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, palette.gradientStops[0]);
    gradient.addColorStop(0.5, palette.gradientStops[1]);
    gradient.addColorStop(1, palette.gradientStops[2]);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function initBlobs() {
    for (let i = 0; i < numBlobs; i++) {
        blobs.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 50 + 30,
            dx: (Math.random() - 0.5) * 2,
            dy: (Math.random() - 0.5) * 2,
            dr: (Math.random() - 0.5) * 0.1,
            angle: Math.random() * 2 * Math.PI,
            rotationSpeed: (Math.random() - 0.5) * 0.01,
        });
    }
    animateBlobs();
}

function animateBlobs() {
    const palette = getRenderedPalette();
    drawGradientBackground(palette);
    blobs.forEach(blob => {
        blob.x += blob.dx;
        blob.y += blob.dy;
        blob.radius += blob.dr;
        blob.angle += blob.rotationSpeed;

        if (blob.x - blob.radius < 0 || blob.x + blob.radius > canvas.width) {
            blob.dx *= -1;
        }
        if (blob.y - blob.radius < 0 || blob.y + blob.radius > canvas.height) {
            blob.dy *= -1;
        }
        if (blob.radius < 20 || blob.radius > 50) {
            blob.dr *= -1;
        }

        // Update blob color based on position
        updateBlobColor(blob, palette);

        drawBlob(blob, palette);
    });
    requestAnimationFrame(animateBlobs);
}

function updateBlobColor(blob, palette = getRenderedPalette()) {
    const xFactor = blob.x / canvas.width;
    const yFactor = blob.y / canvas.height;

    const r = Math.floor(palette.blobStart.r * (1 - xFactor) + palette.blobEnd.r * xFactor);
    const g = Math.floor(palette.blobStart.g * (1 - yFactor) + palette.blobEnd.g * yFactor);
    const b = Math.floor(palette.blobStart.b * (1 - xFactor) + palette.blobEnd.b * xFactor);

    blob.color = `rgba(${r}, ${g}, ${b}, 1)`;
    blob.colorTransparent = `rgba(${r}, ${g}, ${b}, 0.7)`;
}

function drawBlob(blob, palette = getRenderedPalette()) {
    const gradient = ctx.createRadialGradient(blob.x, blob.y, blob.radius * 0.1, blob.x, blob.y, blob.radius);
    gradient.addColorStop(0, blob.color);
    gradient.addColorStop(0.7, blob.colorTransparent);
    gradient.addColorStop(1, blob.colorTransparent);

    ctx.save();
    ctx.translate(blob.x, blob.y);
    ctx.rotate(blob.angle);
    ctx.translate(-blob.x, -blob.y);

    // Draw shadow
    ctx.fillStyle = palette.shadow;
    ctx.beginPath();
    ctx.arc(blob.x + 10, blob.y + 10, blob.radius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(blob.x, blob.y, blob.radius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();
}

let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - window.innerHeight / 2; // Adjust this value to trigger earlier
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if (top >= offset && top < offset + height) {
            navLinks.forEach(links => {
                links.classList.remove('active');
                document.querySelector('header nav a[href*=' + id + ']').classList.add('active');
            });
        }
    });
};

document.querySelectorAll('header nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);

        window.scrollTo({
            top: targetSection.offsetTop - (window.innerHeight / 2) + (targetSection.offsetHeight / 2),
            behavior: 'smooth'
        });
    });
})

const projectData = [
    {
        title: 'ExpenseTracker',
        description: 'A full-stack expense tracking application designed to help users manage spending, analyze financial patterns, and stay on budget, featuring real-time dashboards, recurring transactions, and AI-powered insights.',
        image: 'image/expense-tracker.png',
        imageAlt: 'ExpenseTracker screenshot',
        tags: ['React', 'JavaScript', 'Tailwind CSS', 'Node.js', 'JWT', 'MongoDB'],
        link: 'https://github.com/Lehoa02/ExpenseTracker',
        linkLabel: 'Open ExpenseTracker placeholder link',
        demoLink: 'https://expense-tracker-beta-eosin.vercel.app/login',
    },
    {
        title: 'Distributed Audio Processing System',
        description: 'A distributed system for parallel audio processing. The application handles asynchronous file uploads, processes audio data concurrently, and extracts features such as spectral centroid, bandwidth, and loudness.',
        image: 'image/audio2.png',
        imageAlt: 'Audio Processing System screenshot',
        tags: ['Python', 'Redis', 'Celery', 'Audio Processing', 'JavaScript', 'Flask'],
        link: 'https://github.com/Lehoa02/Distributed-Audio-Processing-System',
        linkLabel: 'Open Distributed Audio Processing System on GitHub',
        demoLink: null,
    },
    {
        title: 'Pirate Shooter 3D Game',
        description: 'A 3D action game where players take on the role of a pirate captain, engaging in naval battles and treasure hunts.',
        image: 'image/pirate.png',
        imageAlt: 'Pirate Shooter 3D Game screenshot',
        tags: ['C++', 'Unreal Engine'],
        link: 'https://github.com/Lehoa02/Pirate-Shooter-3D-Game',
        linkLabel: 'Open Project 3 on GitHub',
        demoLink: null,
    },
    {
        title: 'Resume AI Matcher',
        description: 'An AI-driven resume matching system that compares resumes against job descriptions using NLP techniques. It analyzes skill relevance, formatting, and keyword alignment to generate actionable feedback.',
        image: 'image/ai.png',
        imageAlt: 'Project 3 screenshot',
        tags: ['Jupyter Notebook', 'Python', 'Pandas', 'Scikit-learn'],
        link: 'https://github.com/Lehoa02/Resume_AI',
        linkLabel: 'Open Project 3 on GitHub',
        demoLink: null,
    },
    {
        title: 'Celery Calculator',
        description: 'A simple calculator application built with Celery for distributed task processing.',
        image: 'image/image.png',
        imageAlt: 'Celery Calculator screenshot',
        tags: ['Python', 'Celery', 'Flask'],
        link: 'https://github.com/Lehoa02/CeletyCalculator',
        linkLabel: 'Open Celery Calculator on GitHub',
        demoLink: null,
    },
    {
        title: 'Advanced Bank Management System',
        description: 'A comprehensive banking solution that automates core banking operations. The project explores data handling, transaction flow, and a cleaner way to manage repeated financial tasks.',
        image: 'image/pic3.jpg',
        imageAlt: 'Project 3 screenshot',
        tags: ['C++'],
        link: 'https://github.com/AOOD-FinalProject/Advanced-Bank-Management-System',
        linkLabel: 'Open Project 3 on GitHub',
        demoLink: null,
    },
    
    {
        title: 'Mobile App - Magic ToDo Ball',
        description: 'A fun and interactive to-do list app that uses a Magic 8 Ball concept to randomly choose tasks. Developed in Android Studio with Java to make task selection more engaging and less overwhelming.',
        image: 'image/pic2.jpg',
        imageAlt: 'Placeholder project screenshot',
        tags: ['Java', 'HTML', 'CSS'],
        link: 'https://github.com/Lehoa02/Magic_ToDo_Ball',
        linkLabel: 'Open Project 5 placeholder link',
        demoLink: null,
    },
    {
        title: 'Space Invaders Game',
        description: 'A 2D arcade-style Space Invaders game built with Java and JavaFX. Implements player movement, enemy patterns, collision detection, and real-time score updates.',
        image: 'image/pic1.jpg',
        imageAlt: 'Placeholder project screenshot',
        tags: ['TypeScript', 'UI', 'Motion'],
        link: 'https://github.com/Lehoa02/SpaceInveders',
        linkLabel: 'Open Project 6 placeholder link',
        demoLink: null,
    },
];

const mobileProjectLimit = 3;
const mobileProjectsQuery = window.matchMedia('(max-width: 700px)');
let projectsExpanded = false;
let projectsControlsInitialized = false;

function createProjectAction({ href, label, ariaLabel, iconClass, variant = 'demo', disabled = false }) {
    const action = href && !disabled ? document.createElement('a') : document.createElement('button');
    action.className = `project-link project-link--${variant}`;

    if (action.tagName === 'A') {
        action.href = href;
        action.target = '_blank';
        action.rel = 'noreferrer';
    } else {
        action.type = 'button';
        action.disabled = disabled;
        action.setAttribute('aria-disabled', 'true');
    }

    if (ariaLabel) {
        action.setAttribute('aria-label', ariaLabel);
    }

    const icon = document.createElement('i');
    icon.className = iconClass;
    icon.setAttribute('aria-hidden', 'true');

    const text = document.createElement('span');
    text.textContent = label;

    action.append(icon, text);
    return action;
}

function createProjectCard(project) {
    const card = document.createElement('article');
    card.className = 'project-card';

    const imageWrap = document.createElement('div');
    imageWrap.className = 'project-image';

    const image = document.createElement('img');
    image.src = project.image;
    image.alt = project.imageAlt;
    image.loading = 'lazy';
    imageWrap.appendChild(image);

    const title = document.createElement('h4');
    title.textContent = project.title;

    const description = document.createElement('p');
    description.textContent = project.description;

    const languages = document.createElement('div');
    languages.className = 'project-languages';

    project.tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.textContent = tag;
        languages.appendChild(tagElement);
    });

    const actions = document.createElement('div');
    actions.className = 'project-actions';

    const githubButton = createProjectAction({
        href: project.link,
        label: 'Source code',
        ariaLabel: project.linkLabel,
        iconClass: 'bx bxl-github',
        variant: 'code',
    });

    actions.append(githubButton);

    if (project.demoLink) {
        const liveDemoButton = createProjectAction({
            href: project.demoLink,
            label: 'Live demo',
            ariaLabel: `Open ${project.title} live demo`,
            iconClass: 'bx bx-link-external',
            variant: 'demo',
        });

        actions.append(liveDemoButton);
    }

    card.append(imageWrap, title, description, languages, actions);
    return card;
}

function getVisibleProjects() {
    if (!mobileProjectsQuery.matches) {
        return projectData;
    }

    return projectsExpanded ? projectData : projectData.slice(0, mobileProjectLimit);
}

function syncProjectsToggle(toggleButton) {
    if (!toggleButton) {
        return;
    }

    const shouldShowToggle = mobileProjectsQuery.matches && projectData.length > mobileProjectLimit;

    toggleButton.hidden = !shouldShowToggle;
    toggleButton.setAttribute('aria-expanded', String(projectsExpanded));

    if (!shouldShowToggle) {
        toggleButton.textContent = 'Show more projects';
        return;
    }

    toggleButton.textContent = projectsExpanded ? 'Show fewer projects' : 'Show more projects';
}

function renderProjects() {
    const projectsGrid = document.getElementById('projects-grid');
    const previousButton = document.getElementById('projects-prev');
    const nextButton = document.getElementById('projects-next');
    const toggleButton = document.getElementById('projects-toggle');

    if (!projectsGrid) {
        return;
    }

    projectsGrid.replaceChildren(...getVisibleProjects().map(createProjectCard));
    syncProjectsToggle(toggleButton);

    if (!projectsControlsInitialized) {
        const updateButtonState = () => {
            if (!previousButton || !nextButton) {
                return;
            }

            const atStart = projectsGrid.scrollLeft <= 8;
            const atEnd = projectsGrid.scrollLeft + projectsGrid.clientWidth >= projectsGrid.scrollWidth - 8;

            previousButton.disabled = atStart;
            nextButton.disabled = atEnd;
        };

        const scrollStep = () => Math.max(projectsGrid.clientWidth * 0.9, 320);

        if (previousButton && nextButton) {
            previousButton.addEventListener('click', () => {
                projectsGrid.scrollBy({ left: -scrollStep(), behavior: 'smooth' });
            });

            nextButton.addEventListener('click', () => {
                projectsGrid.scrollBy({ left: scrollStep(), behavior: 'smooth' });
            });

            projectsGrid.addEventListener('scroll', updateButtonState, { passive: true });
            window.addEventListener('resize', updateButtonState, { passive: true });
            updateButtonState();
        }

        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                projectsExpanded = !projectsExpanded;
                renderProjects();
            });
        }

        mobileProjectsQuery.addEventListener('change', () => {
            projectsExpanded = false;
            renderProjects();
        });

        projectsControlsInitialized = true;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderProjects);
} else {
    renderProjects();
}


document.addEventListener("DOMContentLoaded", function() {
    let aboutSection = document.getElementById('about-me');

    if (!aboutSection) {
        return;
    }

    let observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                aboutSection.classList.add('visible');
                observer.unobserve(aboutSection); // Stop observing once animation has triggered
            }
        });
    }, { threshold: 0.5 });

    observer.observe(aboutSection);
});

//animation for about sectiion text p
document.addEventListener("DOMContentLoaded", function() {
    let slideInElements = document.querySelectorAll('.slide-in-bottom');

    let observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Unobserve if you only want it to happen once
            }
        });
    }, { threshold: 0.1 }); // Adjust threshold as needed

    slideInElements.forEach(element => {
        observer.observe(element);
    });
});

//waterfall for the expirience

document.addEventListener("DOMContentLoaded", function() {
    let contentBoxes = document.querySelectorAll('.content-box');

    let observer = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 150); // Delay each box by 150ms
            } else {
                entry.target.classList.remove('visible'); // Remove class when out of view to reset
            }
        });
    }, { threshold: 0.1 });

    contentBoxes.forEach(box => {
        observer.observe(box);
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const elements = document.querySelectorAll('.jump-i');
    elements.forEach((el, index) => {
        el.style.animation = `jump 0.6s ease-out ${index * 0.2 + 1}s`; // Set animation to infinite
    });

    const typedTextElement = document.getElementById('typed-text');

    if (!typedTextElement) {
        return;
    }

    const textValues = (typedTextElement.dataset.texts || "")
        .split("|")
        .map(text => text.trim())
        .filter(Boolean);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!textValues.length) {
        return;
    }

    if (reducedMotion) {
        typedTextElement.textContent = textValues[textValues.length - 1];
        return;
    }

    const typeSpeed = 80;
    const deleteSpeed = 42;
    const holdDelay = 1200;
    const startDelay = 650;
    let textIndex = 0;

    function typeText(text, charIndex = 0) {
        typedTextElement.textContent = text.slice(0, charIndex);

        if (charIndex < text.length) {
            window.setTimeout(() => typeText(text, charIndex + 1), typeSpeed);
            return;
        }

        window.setTimeout(() => eraseText(text.length), holdDelay);
    }

    function eraseText(charIndex) {
        typedTextElement.textContent = typedTextElement.textContent.slice(0, charIndex);

        if (charIndex > 0) {
            window.setTimeout(() => eraseText(charIndex - 1), deleteSpeed);
            return;
        }

        textIndex = (textIndex + 1) % textValues.length;
        window.setTimeout(() => typeText(textValues[textIndex]), 120);
    }

    window.setTimeout(() => typeText(textValues[0]), startDelay);

});

// Add scroll effect to footer
document.addEventListener("DOMContentLoaded", function() {
    let footer = document.getElementById('contact');
    let observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                footer.classList.add('visible');
            } else {
                footer.classList.remove('visible'); // Remove class to trigger the animation again
            }
        });
    }, { threshold: 0.5 });

    observer.observe(footer);
});

document.addEventListener("DOMContentLoaded", function() {
    const newsSection = document.getElementById('news');

    if (!newsSection) {
        return;
    }

    const newsItems = newsSection.querySelectorAll('.news-item');
    const toggleButton = newsSection.querySelector('.news-toggle');

    if (!toggleButton || newsItems.length <= 3) {
        if (toggleButton) {
            toggleButton.hidden = true;
        }

        return;
    }

    const collapsedLabel = 'View all updates';
    const expandedLabel = 'Show latest 3';

    function syncNewsState() {
        const isExpanded = newsSection.classList.contains('is-expanded');
        toggleButton.setAttribute('aria-expanded', String(isExpanded));
        toggleButton.textContent = isExpanded ? expandedLabel : collapsedLabel;
    }

    toggleButton.addEventListener('click', function() {
        newsSection.classList.toggle('is-expanded');
        syncNewsState();
    });

    syncNewsState();
});
// Handle form submission
document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    if (name && email && message) {
        // After showing alert, proceed to submit the form
        fetch('https://formspree.io/f/mzzbpgra', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                email: email,
                message: message
            })
        })
        .then(response => {
            if (response.ok) {
                alert(`Thank you, ${name}! Your message has been sent.`);
                document.getElementById('contact-form').reset(); // Clear the form
            } else {
                alert('Oops! There was a problem with your submission.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('There was an error submitting the form.');
        });
    } else {
        alert('Please fill out all fields before submitting.');
    }
});























/*
Type text
document.addEventListener("DOMContentLoaded", function() {
    let aboutSection = document.getElementById('about');
    let text = "";
    let index = 0;
    let typing = false;

    let observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !typing) {
                typing = true;
                typeText();
                aboutSection.classList.add('visible');
                aboutSection.classList.remove('hidden');
            } else if (!entry.isIntersecting) {
                aboutSection.classList.remove('visible');
                aboutSection.classList.add('hidden');
            }
        });
    }, { threshold: 0.5 });

    observer.observe(aboutSection);

    function typeText() {
        if (index < text.length) {
            document.getElementById('typed-text').innerHTML += text.charAt(index);
            index++;
            setTimeout(typeText, 40); // Adjust typing speed
        }
    }
});*/


