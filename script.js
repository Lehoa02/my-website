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

function drawGradientBackground() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "rgba(10, 10, 10, 1)");
    gradient.addColorStop(0.5, "rgba(30, 30, 60, 1)");
    gradient.addColorStop(1, "rgba(5, 5, 20, 1)");

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
    drawGradientBackground();
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
        updateBlobColor(blob);

        drawBlob(blob);
    });
    requestAnimationFrame(animateBlobs);
}

function updateBlobColor(blob) {
    const xFactor = blob.x / canvas.width;
    const yFactor = blob.y / canvas.height;

    const r = Math.floor(160 * (1 - xFactor) + 240 * xFactor);
    const g = Math.floor(32 * (1 - yFactor) + 60 * yFactor);
    const b = Math.floor(240 * (1 - xFactor) + 130 * xFactor);

    blob.color = `rgba(${r}, ${g}, ${b}, 1)`;
    blob.colorTransparent = `rgba(${r}, ${g}, ${b}, 0.7)`;
}

function drawBlob(blob) {
    const gradient = ctx.createRadialGradient(blob.x, blob.y, blob.radius * 0.1, blob.x, blob.y, blob.radius);
    gradient.addColorStop(0, blob.color);
    gradient.addColorStop(0.7, blob.colorTransparent);
    gradient.addColorStop(1, blob.colorTransparent);

    ctx.save();
    ctx.translate(blob.x, blob.y);
    ctx.rotate(blob.angle);
    ctx.translate(-blob.x, -blob.y);

    // Draw shadow
    ctx.fillStyle = `rgba(0, 0, 0, 0.2)`;
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


document.addEventListener("DOMContentLoaded", function() {
    let aboutSection = document.getElementById('about');
    let observer;
    let hasAnimated = false; // Flag to prevent reanimation

    observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                // Start the animations
                document.querySelector('.circle-80').style.strokeDashoffset = '144'; 
                document.querySelector('.circle-75').style.strokeDashoffset = '168';
                document.querySelector('.circle-87').style.strokeDashoffset = '111';
                document.querySelector('.circle-70').style.strokeDashoffset = '198';
                document.querySelector('.circle-65').style.strokeDashoffset = '215';
                document.querySelector('.circle-82').style.strokeDashoffset = '135';

                // Start the counter animation
                startCounters();
                
                hasAnimated = true; // Prevent further animations
                observer.unobserve(aboutSection); // Stop observing after first animation
            }
        });
    }, { threshold: 0.5 });

    observer.observe(aboutSection);

    function startCounters() {
        let pythonCounter = 0;
        let javaCounter = 0;
        let cppCounter = 0;
        let htmlCounter = 0;
        let sqlCounter = 0;
        let awsCounter = 0;

        let intervalPython = setInterval(() => {
            if (pythonCounter == 80) { clearInterval(intervalPython); } 
            else { pythonCounter += 1; document.getElementById("number-python").innerHTML = pythonCounter + "%"; }
        }, 20);

        let intervalJava = setInterval(() => {
            if (javaCounter == 75) { clearInterval(intervalJava); } 
            else { javaCounter += 1; document.getElementById("number-java").innerHTML = javaCounter + "%"; }
        }, 20);

        let intervalCpp = setInterval(() => {
            if (cppCounter == 87) { clearInterval(intervalCpp); } 
            else { cppCounter += 1; document.getElementById("number-cpp").innerHTML = cppCounter + "%"; }
        }, 20);

        let intervalHTML = setInterval(() => {
            if (htmlCounter == 70) { clearInterval(intervalHTML); } 
            else { htmlCounter += 1; document.getElementById("number-html").innerHTML = htmlCounter + "%"; }
        }, 20);

        let intervalSQL = setInterval(() => {
            if (sqlCounter == 65) { clearInterval(intervalSQL); } 
            else { sqlCounter += 1; document.getElementById("number-sql").innerHTML = sqlCounter + "%"; }
        }, 20);

        let intervalAWS = setInterval(() => {
            if (awsCounter == 82) { clearInterval(intervalAWS); } 
            else { awsCounter += 1; document.getElementById("number-aws").innerHTML = awsCounter + "%"; }
        }, 20);
    }
});

document.addEventListener("DOMContentLoaded", function() {
    let aboutSection = document.getElementById('about');
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

//animation about section
document.addEventListener("DOMContentLoaded", function() {
    let aboutSection = document.getElementById('about');

    let observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                aboutSection.classList.add('visible');
                aboutSection.classList.remove('hidden');
            } else {
                aboutSection.classList.remove('visible');
                aboutSection.classList.add('hidden');
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
    let currentIndex = 0;
    const skillsGrid = document.querySelector('.skills-grid');
    const skillBoxes = document.querySelectorAll('.skill-box');
    const leftBtn = document.querySelector('.left-btn');
    const rightBtn = document.querySelector('.right-btn');
    const boxWidth = skillBoxes[0].offsetWidth + 20; // Get the width of one skill box including margin

    const updateCarousel = (direction) => {
        if (direction === 'right' && currentIndex < skillBoxes.length - 3) {
            currentIndex++;
        } else if (direction === 'left' && currentIndex > 0) {
            currentIndex--;
        }

        // Move the skill boxes
        skillsGrid.style.transform = `translateX(-${currentIndex * boxWidth}px)`;

        // Adjust visibility for the first and last boxes
        skillBoxes.forEach((box, index) => {
            if (index >= currentIndex && index < currentIndex + 3) {
                box.style.opacity = 1;
                box.style.visibility = 'visible';
            } else {
                box.style.opacity = 0;
                box.style.visibility = 'hidden';
            }
        });
    };

    rightBtn.addEventListener('click', () => {
        updateCarousel('right');
    });

    leftBtn.addEventListener('click', () => {
        updateCarousel('left');
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const elements = document.querySelectorAll('.jump-i');
    elements.forEach((el, index) => {
        el.style.animation = `jump 0.6s ease-out ${index * 0.2 + 1}s`; // Set animation to infinite
    });

    setTimeout(() => {
        document.querySelector('.fade-text').classList.add('light-up');
    }, 1500); // Wait for 1.5 seconds to allow the jump animation to complete
   

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


