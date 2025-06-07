const professionals = [
    {name: "Ing. Juan Pérez", lat: -31.64, lon: -60.71},
    {name: "Ing. María Gómez", lat: -32.95, lon: -60.67},
    {name: "Ing. Carlos López", lat: -34.61, lon: -58.38}
];

let map;
let markers = [];
function toRad(value) {
    return value * Math.PI / 180;
}

function distance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function showMap(userLat, userLon, pros) {
    if (!map) {
        map = L.map("map").setView([userLat, userLon], 8);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap"
        }).addTo(map);
    } else {
        map.setView([userLat, userLon], 8);
        markers.forEach(m => map.removeLayer(m));
        markers = [];
    }
    markers.push(L.marker([userLat, userLon]).addTo(map).bindPopup("Tu ubicación"));
    pros.forEach(p => {
        markers.push(L.marker([p.lat, p.lon]).addTo(map).bindPopup(p.name));
    });
}
$("#find").on("click", function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(pos) {
            const userLat = pos.coords.latitude;
            const userLon = pos.coords.longitude;
            const nearby = professionals.filter(p => distance(userLat, userLon, p.lat, p.lon) <= 200);
            const list = $("#results");
            list.empty();
            if (nearby.length === 0) {
                list.append("<li class='list-group-item'>No se encontraron profesionales en un radio de 200 km.</li>");
            } else {
                nearby.forEach(p => {
                    const km = distance(userLat, userLon, p.lat, p.lon).toFixed(1);
                    list.append(`<li class='list-group-item'>${p.name} - ${km} km</li>`);
                });
            }
            showMap(userLat, userLon, nearby);
        });
    } else {
        alert("Geolocalización no soportada");
    }
});

$("#startCall").on("click", function() {
    const room = "ingenieria-" + Math.random().toString(36).substring(2, 8);
    const iframe = `<iframe allow='camera; microphone; fullscreen' style='width:100%; height:400px' src='https://meet.jit.si/${room}'></iframe>`;
    $("#callContainer").html(iframe);
});

$("#budgetForm").on("submit", function(e) {
    e.preventDefault();
    const desc = $("#desc").val();
    const rate = parseFloat($("#rate").val());
    const hours = parseFloat($("#hours").val());
    if (isNaN(rate) || isNaN(hours)) return;
    const total = rate * hours;
    const invoice = `<h3>Factura</h3><p>${desc}</p><p><strong>Total: $${total.toFixed(2)}</strong></p>`;
    $("#invoice").html(invoice);
});

