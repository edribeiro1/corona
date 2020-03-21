var map = {};
var cluster = {}
var zonaSegura = false;

$(function () {
    $(document).ready(function () {
        $(document).on('click', '.template-cidade', function (ev) {
            let self = $(this);
            map.setView([self.data('lat'),self.data('lng')], 15);            
        });
        
        initMapa();
        buscarCasos((casos) => {
            let markers = [];
            let totalConfirmado = 0;
            let totalSuspeito = 0;
            let totalMortos = 0;
            for (const i in casos) {
                if (casos.hasOwnProperty(i)) {
                    let caso = casos[i];
                    caso = validarDados(caso);

                    totalConfirmado += caso.qtde_confirmado;
                    totalSuspeito += caso.qtd_suspeitos;
                    totalMortos += caso.qtde_mortes;

                    markers.push(createMarker(caso));
                    $('.cities-list').append(templateCities(caso));
                }
            }
            $('#totalCasos').text(totalConfirmado + totalSuspeito + totalMortos);
            $('#totalConfirmado').text(totalConfirmado);
            $('#totalSuspeito').text(totalSuspeito);
            $('#totalMortos').text(totalMortos);
            
            getLocation(casos);
        });

        map.on('zoomend', () => {
            initAnimationZona();
            map.invalidateSize();
        });
    });
});

function getLocation(casos) {
    map.locate({setView: true, maxZoom: 5});
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
    }).addTo(map);
    map.zoomControl.setPosition('topright');
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
    }).bindTooltip(templateTooltip(dado)).addTo(map);
}
function templateTooltip(dado) {
    let cidade = (dado.cidade)? dado.cidade : '';
    let totalConfirmado = dado.qtde_confirmado;
    let totalSuspeito = dado.qtd_suspeitos;
    let totalMortos = dado.qtde_mortes;
    let totalCasos = totalConfirmado + totalSuspeito + totalMortos;
    
    return `
        <div class="tooltip-info">
            <label>${cidade}</label>
            <div>
                <div class="total-casos">Total de casos:</div>
                <span>${totalCasos}</span>
            </div>
            <hr>
            <div>
                <span class="casos-ocorridos">
                    <div class="casos-notificacao confirmado"></div>
                    Confirmados:
                </span>
                <span>${totalConfirmado}</span>
            </div>
            <div>
                <span class="casos-ocorridos">
                    <div class="casos-notificacao suspeito"></div>
                    Suspeitas:
                </span>
                <span>${totalSuspeito}</span>
            </div>
            <div>
                <span class="casos-ocorridos">
                    <div class="casos-notificacao mortos"></div>
                    Mortos:
                </span>
                <span>${totalMortos}</span>
            </div>
        </div>
    `;
}
function templateCities(dado) {
    let cidade = (dado.cidade)? dado.cidade : '';
    let totalConfirmado = dado.qtde_confirmado;
    let totalSuspeito = dado.qtd_suspeitos;
    let totalMortos = dado.qtde_mortes;
    let lat = dado.lat;
    let lng = dado.lng;
    let totalCasos = totalConfirmado + totalSuspeito + totalMortos;

    return `
        <li>
            <div class="template-cidade" data-lat="${lat}" data-lng="${lng}">
                <span style="margin: 0px 0px 0px 25px">${cidade}</span>
                <span class="total-casos" style="margin: 0px 25px 0px 0px; font-weight: bold;">${totalCasos}</span>
            </div>
        </li>
    `;
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

function validarDados(dado) {
    dado.qtde_confirmado = $.isNumeric(dado.qtde_confirmado)? parseInt(dado.qtde_confirmado) : 0;
    dado.qtd_suspeitos = $.isNumeric(dado.qtd_suspeitos)? parseInt(dado.qtd_suspeitos) : 0;
    dado.qtde_mortes = $.isNumeric(dado.qtde_mortes)? parseInt(dado.qtde_mortes) : 0;
    dado.lat = $.isNumeric(dado.lat)? dado.lat : 0;
    dado.lng = $.isNumeric(dado.lng)? dado.lng : 0;

    return dado;
}