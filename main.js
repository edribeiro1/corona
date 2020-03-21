var map = {};
var cluster = {}
$(function () {
    $(document).ready(function () {
        initMapa();
        getLocation();   

        buscarCasos((casos) => {
            cluster = L.markerClusterGroup({
                spiderfyOnMaxZoom :  false ,
                showCoverageOnHover :  false ,
                zoomToBoundsOnClick :  true,
                disableClusteringAtZoom: 17,
            });
            let markers = [];

            for (const i in casos) {
                if (casos.hasOwnProperty(i)) {
                    let caso = casos[i];
                    markers.push(createMarker(caso));
                }
            }
            // cluster.addLayers(markers);
            // map.addLayer(cluster);
        });
    });
});

function getLocation() {
    map.locate({setView: true, maxZoom: 16});
    map.on('locationfound', (e) => L.marker(e.latlng).addTo(map));
}

function initMapa() {
    map = L.map('mapa', {minZoom: 1}).setView([-14.2350, -51.9253], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '<a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
        }
    ).addTo(map);
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
        // url: "172.19.254.180/api-corona/casos",
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