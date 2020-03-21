var map = {};
var cluster = {}
var zonaSegura = false;

$(function () {
    $(document).ready(function () {
        initMapa();
        buscarCasos((casos) => {
            let markers = [];
            for (const i in casos) {
                if (casos.hasOwnProperty(i)) {
                    let caso = casos[i];
                    markers.push(createMarker(caso));
                }
            }
            getLocation(casos);
        });

        map.on('zoomend', () => {
            initAnimationZona();
            map.invalidateSize();
        });
    });
});

function getLocation(casos) {
    map.locate({setView: true, maxZoom: 16});
    map.on('locationfound', (e) => {        
        casos.forEach(caso => {
            zonaSegura = (parseInt(map.distance(e.latlng, [caso.lat, caso.lng])) > 300);
        });

        let icon = L.AwesomeMarkers.icon({
            'markerColor': (zonaSegura)? "green" : "red"
        });
        L.marker(e.latlng, {'icon': icon}).addTo(map);
        initAnimationZona()
    });
}

function initMapa() {
    map = L.map('mapa', {minZoom: 1}).setView([-14.2350, -51.9253], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '<a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
        }
    ).addTo(map);
}
function initAnimationZona() {
    $('div.awesome-marker-shadow.awesome-marker.leaflet-zoom-animated').addClass((zonaSegura)? 'pulseOutZonaSegura': 'pulseOutZonaPerigo');
}

function createMarker(dado) {
    return L.circleMarker([dado.lat, dado.lng], {
        color: '#ff4e4e',
        fillColor: '#ff4e4e',
        fillOpacity: 0.5,
        radius: 6 + (6 * (parseInt(dado.qtde_confirmado)/50))
    }).bindTooltip(`
        Cidade: ${dado.cidade}<br>
        Casos confirmados: ${dado.qtde_confirmado}
    `).addTo(map);
}

function buscarCasos(cb) {
    $.ajax({
        url: "http://ec2-54-196-120-46.compute-1.amazonaws.com/api-corona/",
        type: 'get',
        dataType: 'json',
        processData: false,
        contentType: "application/x-www-form-urlencodedy",
        success: function(resultado) {
            if (typeof cb == "function") {
                cb(resultado)
            }
        }
    });         
}