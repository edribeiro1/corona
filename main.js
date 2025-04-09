var map = {};
var cluster = {}
var zonaSegura = false;

$(function () {
    $(document).ready(function () {
        $(document).on('click', '.template-estado', function (ev) {
            // let self = $(this).closest('li');
            // if (!$(self).hasClass('selecionado')) {
            //     $('.selecionado').removeClass("selecionado");                
            // }
            // $(self).toggleClass("selecionado");
        });
        initMapa();
        buscarCasos((casos) => {
            let markers = [];
            let totalConfirmado = 0;
            let totalMortos = 0;

            for (const i in casos) {
                if (casos.hasOwnProperty(i)) {
                    let caso = casos[i];
                    totalConfirmado += caso.confirmed;
                    totalMortos += caso.deaths;
                    markers.push(createMarker(caso));
                }
            }


            const totalSoma = totalConfirmado + totalMortos
            $('#estadoSelecionadoNome').text("Brasil");
            $('#estadoSelecionadoTotalCasos').text(formatNumber(totalSoma));
            $('#totalCasos').text(formatNumber(totalSoma));
            $('#totalConfirmado').text(formatNumber(totalConfirmado));
            $('#totalMortos').text(formatNumber(totalMortos));
            $('#totalVivos').text(formatNumber(212583750));
            
            // setTotalCountTo('#estadoSelecionadoTotalCasos', totalSoma);
            // setTotalCountTo('#totalCasos', totalSoma);
            // setTotalCountTo('#totalConfirmado', totalConfirmado);
            // setTotalCountTo('#totalMortos', totalMortos);
            // setTotalCountTo('#totalVivos', 212583750);
            
        });

        map.on('zoomend', () => {
            map.invalidateSize();
        });
    });
});

function initMapa() {
    map = L.map('mapa', {minZoom: 1}).setView([-14.2350, -51.9253], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '<a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    }).addTo(map);
    map.zoomControl.setPosition('topright');
}

function createMarker(dado) {

    const somaTotal = dado.confirmed + dado.deaths
    return L.circleMarker([dado.lat, dado.lng], {
        color: '#d60000',
        fillColor: '#d60000',
        fillOpacity: 0.5,
        radius: 10 + (parseInt(somaTotal)/100000)
    }).bindTooltip(templateTooltip(dado)).addTo(map);
}
function templateTooltip(dado) {
    let state = (dado.state)? dado.state : '';
    let totalConfirmado = dado.confirmed;
    let totalMortos = dado.deaths;
    let totalCasos = totalConfirmado + totalMortos;
    
    return `
        <div class="tooltip-info">
            <label>${state}</label>
            <div>
                <div class="total-casos">Total de casos:</div>
                <span>${formatNumber(totalCasos)}</span>
            </div>
            <hr>
            <div>
                <span class="casos-ocorridos">
                    <div class="casos-notificacao confirmado"></div>
                    Confirmados:
                </span>
                <span>${formatNumber(totalConfirmado)}</span>
            </div>
            <div>
                <span class="casos-ocorridos">
                    <div class="casos-notificacao mortos"></div>
                    Mortos:
                </span>
                <span>${formatNumber(totalMortos)}</span>
            </div>
        </div>
    `;
}

function buscarCasos(cb) {
    cb([
        {"lat": -23.5505, "lng": -46.6333, "state": "Sao Paulo, Brazil",  "confirmed": 4119265, "deaths": 140809, "date": "2021-08-10"},
        {"lat": -18.5122, "lng": -44.555, "state": "Minas Gerais, Brazil", "confirmed": 1998878, "deaths": 51343, "date": "2021-08-10"},
        {"lat": -25.2521, "lng": -52.0215, "state": "Parana, Brazil", "confirmed": 1403372, "deaths": 35928, "date": "2021-08-10"},
        {"lat": -30.0346, "lng": -51.2177, "state": "Rio Grande do Sul, Brazil", "confirmed": 1381971, "deaths": 33588, "date": "2021-08-10"},
        {"lat": -12.5797, "lng": -41.7007, "state": "Bahia, Brazil", "confirmed": 1202820, "deaths": 25983, "date": "2021-08-10"},
        {"lat": -27.2423, "lng": -50.2189, "state": "Santa Catarina, Brazil", "confirmed": 1124632, "deaths": 18204, "date": "2021-08-10"},
        {"lat": -22.9068, "lng": -43.1729, "state": "Rio de Janeiro, Brazil", "confirmed": 1061793, "deaths": 59990, "date": "2021-08-10"},
        {"lat": -5.4984, "lng": -39.3206, "state": "Ceara, Brazil", "confirmed": 923331, "deaths": 23692, "date": "2021-08-10"},
        {"lat": -15.827, "lng": -49.8362, "state": "Goias, Brazil", "confirmed": 761655, "deaths": 21304, "date": "2021-08-10"},
        {"lat": -8.8137, "lng": -36.9541, "state": "Pernambuco, Brazil", "confirmed": 595942, "deaths": 19028, "date": "2021-08-10"},
        {"lat": -1.9981, "lng": -54.9306, "state": "Para, Brazil", "confirmed": 575680, "deaths": 16169, "date": "2021-08-10"},
        {"lat": -19.1834, "lng": -40.3089, "state": "Espirito Santo, Brazil", "confirmed": 547282, "deaths": 11989, "date": "2021-08-10"},
        {"lat": -12.6819, "lng": -56.9211, "state": "Mato Grosso, Brazil", "confirmed": 496059, "deaths": 12800, "date": "2021-08-10"},
        {"lat": -15.7998, "lng": -47.8645, "state": "Distrito Federal, Brazil", "confirmed": 455682, "deaths": 9741, "date": "2021-08-10"},
        {"lat": -7.24, "lng": -36.782, "state": "Paraiba, Brazil", "confirmed": 425425, "deaths": 9065, "date": "2021-08-10"},
        {"lat": -3.4168, "lng": -65.8561, "state": "Amazonas, Brazil", "confirmed": 419744, "deaths": 13591, "date": "2021-08-10"},
        {"lat": -5.4026, "lng": -36.9541, "state": "Rio Grande do Norte, Brazil", "confirmed": 361034, "deaths": 7188, "date": "2021-08-10"},
        {"lat": -20.7722, "lng": -54.7852, "state": "Mato Grosso do Sul, Brazil", "confirmed": 360499, "deaths": 9082, "date": "2021-08-10"},
        {"lat": -4.9609, "lng": -45.2744, "state": "Maranhao, Brazil", "confirmed": 340477, "deaths": 9752, "date": "2021-08-10"},
        {"lat": -7.7183, "lng": -42.7289, "state": "Piaui, Brazil", "confirmed": 311784, "deaths": 6877, "date": "2021-08-10"},
        {"lat": -10.5741, "lng": -37.3857, "state": "Sergipe, Brazil", "confirmed": 275776, "deaths": 5938, "date": "2021-08-10"},
        {"lat": -11.5057, "lng": -63.5806, "state": "Rondonia, Brazil", "confirmed": 259832, "deaths": 6407, "date": "2021-08-10"},
        {"lat": -9.5713, "lng": -36.782, "state": "Alagoas, Brazil", "confirmed": 231783, "deaths": 5905, "date": "2021-08-10"},
        {"lat": -10.1753, "lng": -48.2982, "state": "Tocantins, Brazil", "confirmed": 212851, "deaths": 3569, "date": "2021-08-10"},
        {"lat": 0.902, "lng": -52.003, "state": "Amapa, Brazil", "confirmed": 121725, "deaths": 1926, "date": "2021-08-10"},
        {"lat": -2.7376, "lng": -62.0751, "state": "Roraima, Brazil", "confirmed": 121043, "deaths": 1890, "date": "2021-08-10"},
        {"lat": -9.0238, "lng": -70.812, "state": "Acre, Brazil", "confirmed": 87422, "deaths": 1804,"date": "2021-08-10"}
    ])

    // $.ajax({
    //     url: "http://ec2-54-196-120-46.compute-1.amazonaws.com/api-corona/",
    //     type: 'get',
    //     dataType: 'json',
    //     processData: false,
    //     contentType: "application/x-www-form-urlencodedy",
    //     success: function(resultado) {
    //         if (typeof cb == "function") {
    //             cb(resultado)
    //         }
    //     }
    // });         
}

function setTotalCountTo(element, data, cb) {
    $(element).countTo({
        from: 0,
        to: data,
        speed: 1000,
        refreshInterval: 50,
        onComplete: function() {
          if (typeof cb == "function") {
              cb();
          }
        }
    });
}

function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
