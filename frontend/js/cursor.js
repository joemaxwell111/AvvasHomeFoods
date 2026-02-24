const cursor = document.querySelector(".cursor");

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

let currentX = mouseX;
let currentY = mouseY;

let prevX = mouseX;
let prevY = mouseY;

let angle = 0;

const speed = 0.08; // smoothness

if (cursor) {

    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animate() {

        // Smooth follow
        currentX += (mouseX - currentX) * speed;
        currentY += (mouseY - currentY) * speed;

        // Calculate movement direction
        const dx = currentX - prevX;
        const dy = currentY - prevY;

        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
            // Adjust by -90 because arrow points UP by default
            angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        }

        const rad = angle * (Math.PI / 180);

        const tipDistance = cursor.offsetHeight / 2;

        const offsetX = Math.sin(rad) * tipDistance;
        const offsetY = -Math.cos(rad) * tipDistance;

        cursor.style.transform = `
            translate(${currentX - offsetX}px, ${currentY - offsetY}px)
            rotate(${angle}deg)
        `;

        prevX = currentX;
        prevY = currentY;

        requestAnimationFrame(animate);
    }

    animate();
}
