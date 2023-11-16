// Inicijalizacija vremena
var startTime = new Date().getTime();
var currentTime;

// Dohvaćanje canvasa i postavljanje dimenzija
var canvas = document.getElementById("game")
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Postavljanje konteksta za crtanje
var ctx = canvas.getContext("2d")

// Dohvaćanje najboljeg vremena iz lokalnog pohranjivanja
var bestTime = localStorage.getItem("bestTime") || 0;

// Inicijalizacija broda, broj je inicijalno u sredini canvasa, vrijednosti iz stupnjeva pretvorene su u radijane
var ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 15,
    angle: 90 / 180 * Math.PI,
    rotation: 0,
    speeding: false,
    speed: {
        x: 0,
        y: 0
    }
}

// Inicijalizacija polja u kojem će biti asteroidi
var asteroids = []

// Stvaranje asteroida
createAsteroids();

// Dodavanje event listenera za tipke
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

// Postavljanje intervala za ažuriranje
setInterval(update, 1000 / 30)

// Funkcija za dodavanje vodećih nula
function pad(number, length) {
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

// Funkcija za formatiranje vremena
function formatTime(time) {
    var elapsedSeconds = Math.floor(time / 1000);
    var elapsedMinutes = Math.floor(elapsedSeconds / 60);
    var remainingSeconds = elapsedSeconds % 60;
    var elapsedMillis = time % 1000;

    return pad(elapsedMinutes, 2) + ":" + pad(remainingSeconds, 2) + "." + pad(elapsedMillis, 3);
}

// Funkcija za stvaranje asteroida
// Svi asteroidi imaju slučajne početne vrijednosti x i y te se te vrijednosti nalaze izvan margina canvasa
function createAsteroids() {
    asteroids = []
    for (var i = 0; i < 30; i++) {

        var initialX, initialY;
        var canvasasMargin = 200;

        // Određivanje strane s koje asteroid ulazi
        var side = Math.floor(Math.random() * 4);

        switch (side) {
            case 0:
                initialX = Math.random() * canvas.width;
                initialY = -canvasasMargin;
                break;
            case 1:
                initialX = canvas.width + canvasasMargin;
                initialY = Math.random() * canvas.height;
                break;
            case 2:
                initialX = Math.random() * canvas.width;
                initialY = canvas.height + canvasasMargin;
                break;
            case 3:
                initialX = -canvasasMargin;
                initialY = Math.random() * canvas.height;
                break;
        }
        asteroids.push(newAsteroid(initialX, initialY));
    }
}

// Funkcija za stvaranje broda
function createShip() {
    ship = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 15,
        angle: 90 / 180 * Math.PI,
        rotation: 0,
        speeding: false,
        speed: {
            x: 0,
            y: 0
        }
    }
}

// Funkcija za udaljenost između točaka
function dist(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Funkcija za provjeru kolizije
// Asteroidi su aproksimirani na kružnicu da bi se lakše odredila kolizija
function checkCollision() {
    for (var i = 0; i < asteroids.length; i++) {
        if (dist(ship.x, ship.y, asteroids[i].x, asteroids[i].y) < ship.radius + asteroids[i].radius) {
            return true
        }
    }
    return false
}

// Funkcija za pritisak tipke
function keyDown(ev) {
    if (ev.keyCode === 37) {
        ship.rotation = 2 * Math.PI / 30;
    } else if (ev.keyCode === 38) {
        ship.speeding = true;
    } else if (ev.keyCode === 39) {
        ship.rotation = -2 * Math.PI / 30;
    }
}

// Funkcija za otpuštanje tipke
function keyUp(ev) {
    if (ev.keyCode === 37 || ev.keyCode === 39) {
        ship.rotation = 0;
    } else if (ev.keyCode === 38) {
        ship.speeding = false;
    }
}

// Funkcija za stvaranje novog asteroida
// Svaki asteroid ima slučajnu vrijednost brzine u x i y smjeru te slučajan broj bridova
function newAsteroid(x, y) {
    var roid = {
        x: x,
        y: y,
        x_speed: Math.random() * 100 / 30 * (Math.random() < 0.5 ? 1 : -1),
        y_speed: Math.random() * 100 / 30 * (Math.random() < 0.5 ? 1 : -1),
        radius: 100 / 2,
        angle: Math.random() * Math.PI * 2,
        edge: Math.floor(Math.random() * (10 + 1) + 5)
    };

    return roid
}

// Funkcija za crtanje asteroida
function drawAsteroid(ctx, asteroid) {
    const { x, y, radius, angle, edge } = asteroid;

    ctx.beginPath();
    ctx.moveTo(
        x + radius * Math.cos(angle),
        y + radius * Math.sin(angle)
    );

    for (let j = 0; j < edge; j++) {
        ctx.lineTo(
            x + radius * Math.cos(angle + j * Math.PI * 2 / edge),
            y + radius * Math.sin(angle + j * Math.PI * 2 / edge)
        );
    }

    ctx.closePath();
    ctx.stroke();
}

// Funkcija za ažuriranje pozicije asteroida
function updateAsteroidPosition(asteroid, canvas) {
    asteroid.x += asteroid.x_speed;
    asteroid.y += asteroid.y_speed;

    if (asteroid.x < 0 - asteroid.radius) {
        asteroid.x = canvas.width + asteroid.radius;
    } else if (asteroid.x > canvas.width + asteroid.radius) {
        asteroid.x = 0 - asteroid.radius;
    }

    if (asteroid.y < 0 - asteroid.radius) {
        asteroid.y = canvas.height + asteroid.radius;
    } else if (asteroid.y > canvas.height + asteroid.radius) {
        asteroid.y = 0 - asteroid.radius;
    }
}

// Funkcija za provjeru nalazi li se broj izvan canvasa te ako da onda prelazi na suprotnu stranu
const checkOutside = (coord, limit, radius) => {
    if (coord < 0 - radius) {
        return limit + radius;
    } else if (coord > limit + radius) {
        return 0 - radius;
    }
    return coord;
};

// Funkcija za crtanje broda
function drawShip(ctx, ship) {
    const { x, y, radius, angle } = ship;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(
        x + (4 / 3) * radius * cosA,
        y - (4 / 3) * radius * sinA
    );

    ctx.lineTo(
        x - radius * (cosA + sinA),
        y + radius * (sinA - cosA)
    );

    ctx.lineTo(
        x - radius * (cosA - sinA),
        y + radius * (sinA + cosA)
    );

    ctx.closePath();

    ctx.fillStyle = "white";
    ctx.fill();
}

// Funkcija za ažuriranje igre
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    currentTime = new Date().getTime();
    var time = currentTime - startTime;

    ctx.fillStyle = "red";
    ctx.font = "30px Verdana";
    ctx.fillText("Vrijeme: " + formatTime(time), 20, 50);

    ctx.fillText("Najbolje Vrijeme: " + formatTime(bestTime), 20, 80);


    // Ukoliko je pritisnuta tipka prema gore, brod ubrzava
    // Kada tipka nije pritisnuta brod usporava
    if (ship.speeding) {
        ship.speed.x += 5 * Math.cos(ship.angle) / 30
        ship.speed.y -= 5 * Math.sin(ship.angle) / 30
    }
    else {
        ship.speed.x -= 0.7 * ship.speed.x / 30
        ship.speed.y -= 0.7 * ship.speed.y / 30
    }

    ctx.strokeStyle = "white"
    ctx.lineWidth = 30 / 20;

    drawShip(ctx, ship);

    ctx.lineWidth = 5

    if (checkCollision()) {
        createAsteroids()
        createShip()
        // Ažuriranje najboljeg vremena
        if (time > bestTime) {
            bestTime = time
            localStorage.setItem("bestTime", bestTime);
        }

        startTime = currentTime;
    }


    // Pomicanje broda
    ship.angle = ship.angle + ship.rotation

    ship.x = ship.x + ship.speed.x
    ship.y = ship.y + ship.speed.y

    // Provjera je li brod izvan canvasa
    ship.x = checkOutside(ship.x, canvas.width, ship.radius);
    ship.y = checkOutside(ship.y, canvas.height, ship.radius);

    // Ažuriranje pozicija asteroida i crtanje asteroida
    for (const asteroid of asteroids) {
        drawAsteroid(ctx, asteroid);
        updateAsteroidPosition(asteroid, canvas);
    }
}
