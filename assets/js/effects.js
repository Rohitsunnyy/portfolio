document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas-animation');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Metaball parameters - adjusted for faster movement
    const metaballs = [];
    const numMetaballs = 8;  // Increased number for smoother effect
    const minRadius = 80;    // Slightly smaller radius
    const maxRadius = 160;
    const speed = 0.8;      // Increased speed

    // Create metaballs with faster initial velocity
    for (let i = 0; i < numMetaballs; i++) {
        metaballs.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: 0,
            vy: 0,
            radius: minRadius + Math.random() * (maxRadius - minRadius),
            delay: i * 0.1  // Add delay for trailing effect
        });
    }

    const drawMetaballs = () => {
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;

        for (let x = 0; x < canvas.width; x++) {
            for (let y = 0; y < canvas.height; y++) {
                let sum = 0;

                for (let m = 0; m < metaballs.length; m++) {
                    const mb = metaballs[m];
                    const dx = x - mb.x;
                    const dy = y - mb.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    sum += (mb.radius * mb.radius) / (distance * distance);
                }

                const index = (x + y * canvas.width) * 4;
                if (sum >= 1) {
                    const intensity = Math.min(sum, 2) - 1;
                    data[index] = 255;     // R
                    data[index + 1] = 120 + intensity * 60; // G
                    data[index + 2] = 0;   // B
                    data[index + 3] = 255 * intensity; // A
                } else {
                    data[index + 3] = 0;
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);
    };

    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    let lastMouseX = mouseX;
    let lastMouseY = mouseY;
    let mouseVelX = 0;
    let mouseVelY = 0;

    const animate = () => {
        // Update mouse velocity
        mouseVelX = mouseX - lastMouseX;
        mouseVelY = mouseY - lastMouseY;
        lastMouseX = mouseX;
        lastMouseY = mouseY;

        // Clear canvas with less fade for smoother motion
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Update metaball positions with faster response
        metaballs.forEach((mb, i) => {
            const target = i === 0 ? 
                { x: mouseX, y: mouseY } : 
                metaballs[i - 1];

            // Direct movement to target with leading prediction
            const dx = target.x - mb.x + (i === 0 ? mouseVelX * 10 : 0);
            const dy = target.y - mb.y + (i === 0 ? mouseVelY * 10 : 0);
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Faster acceleration and less damping
            if (distance > 1) {
                const force = Math.min(distance * 0.2, 20);
                mb.vx += (dx / distance) * force;
                mb.vy += (dy / distance) * force;
            }

            // Less damping for quicker response
            mb.vx *= 0.85;
            mb.vy *= 0.85;

            // Update position with delay based on index
            mb.x += mb.vx * (1 - mb.delay);
            mb.y += mb.vy * (1 - mb.delay);
        });

        drawMetaballs();

        // Add glow effect
        ctx.globalCompositeOperation = 'screen';
        metaballs.forEach(mb => {
            const gradient = ctx.createRadialGradient(
                mb.x, mb.y, 0,
                mb.x, mb.y, mb.radius
            );
            gradient.addColorStop(0, 'rgba(255, 150, 0, 0.4)');
            gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(mb.x, mb.y, mb.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.globalCompositeOperation = 'source-over';
        requestAnimationFrame(animate);
    };

    // Track mouse movement with immediate response
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Start animation
    animate();

    const initTypewriter = () => {
        const texts = ['Machine Learning Engineer', 'Data Engineering Specialist', 'Data Analysis Expert', 'Generative AI Developer'];
        const typingSpeed = 100; // Milliseconds per character
        const backspaceSpeed = 50; // Milliseconds per character
        const delayAfterTyping = 2000; // Pause when text is fully typed
        const typingContainer = document.querySelector('.rotating-text');
        
        // Create element for typed text
        const typedElement = document.createElement('span');
        typedElement.classList.add('typed-text');
        typingContainer.innerHTML = ''; // Clear existing spans
        typingContainer.appendChild(typedElement);
        
        let currentTextIndex = 0;
        let currentText = '';
        let isTyping = true;
        
        const typeCharacter = async () => {
            const targetText = texts[currentTextIndex];
            
            if (isTyping) {
                if (currentText.length < targetText.length) {
                    // Type next character
                    currentText += targetText.charAt(currentText.length);
                    typedElement.textContent = currentText;
                    setTimeout(typeCharacter, typingSpeed);
                } else {
                    // Finished typing
                    setTimeout(() => {
                        isTyping = false;
                        typeCharacter();
                    }, delayAfterTyping);
                }
            } else {
                if (currentText.length > 0) {
                    // Backspace
                    currentText = currentText.slice(0, -1);
                    typedElement.textContent = currentText;
                    setTimeout(typeCharacter, backspaceSpeed);
                } else {
                    // Move to next text
                    isTyping = true;
                    currentTextIndex = (currentTextIndex + 1) % texts.length;
                    setTimeout(typeCharacter, typingSpeed);
                }
            }
        };
        
        // Start the typing animation
        typeCharacter();
    };

    // Remove the old text rotation code and use only the new typewriter
    initTypewriter();

    // Skills Filter Functionality
    const filterBtns = document.querySelectorAll('.filter-btn');
    const skillItems = document.querySelectorAll('.hexagon-wrapper');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            skillItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });

    // Add hover effect for skill details
    skillItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'scale(1.1)';
        });

        item.addEventListener('mouseleave', () => {
            item.style.transform = 'scale(1)';
        });
    });
});