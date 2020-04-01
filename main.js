var map = {};
var cluster = {}
var zonaSegura = false;

$(function () {
    $(document).ready(function () {
        $(document).on('click', '.template-cidade', function (ev) {
            let self = $(this);
            map.setView([self.data('lat'),self.data('lng')], ($(self).closest('li').hasClass('brasil'))? 4 : 12);

            if ($('.container-cities-list').hasClass("selecionar-cidade")) {
                $('.selecionar-cidade').removeClass('selecionar-cidade');
                let totalConfirmado = self.data("confirmado");
                let totalSuspeito = self.data("suspeito");
                let totalMortos = self.data("mortos");
                let cidade = self.data("cidade");

                $('#cidadeSelecionadaNome').text(cidade);
                $('#cidadeSelecionadaTotalCasos').text((totalConfirmado + totalSuspeito + totalMortos));
                setTotalCountTo('#totalCasos', (totalConfirmado + totalSuspeito + totalMortos));
                setTotalCountTo('#totalConfirmado', totalConfirmado);
                setTotalCountTo('#totalSuspeito', totalSuspeito);
                setTotalCountTo('#totalMortos', totalMortos);
                setTotalCountTo('#totalVivos', parseFloat(209), ()=> $('#totalVivos').text(`${$('#totalVivos').text()}.3 milhões`));
            }
        });
        $(document).on('click', '.template-estado', function (ev) {
            let self = $(this).closest('li');
            if (!$(self).hasClass('selecionado')) {
                $('.selecionado').removeClass("selecionado");                
            }
            $(self).toggleClass("selecionado");
        });
        $(document).on('click', '.template-cidade-selecionada', function (params) {
           $('.container-cities-list').addClass("selecionar-cidade");
        });
        
        initMapa();
        buscarCasos((casos) => {
            let markers = [];
            let totalConfirmado = 0;
            let totalSuspeito = 0;
            let totalMortos = 0;
            let agrupamentoEstado = {};

            for (const i in casos) {
                if (casos.hasOwnProperty(i)) {
                    let caso = casos[i];
                    caso = validarDados(caso);

                    totalConfirmado += caso.qtde_confirmado;
                    totalSuspeito += caso.qtde_suspeito;
                    totalMortos += caso.qtde_mortes;

                    if (Array.isArray(agrupamentoEstado[caso.estado])) {
                        agrupamentoEstado[caso.estado].push(templateCities(caso))
                        agrupamentoEstado[caso.estado].totalCasos += (caso.qtde_confirmado + caso.qtde_suspeito + caso.qtde_mortes);
                    } else {
                        agrupamentoEstado[caso.estado] = [templateCities(caso)];
                        agrupamentoEstado[caso.estado].totalCasos = (caso.qtde_confirmado + caso.qtde_suspeito + caso.qtde_mortes);
                    }

                    markers.push(createMarker(caso));
                }
            }

            for (const estado in agrupamentoEstado) {
                if (agrupamentoEstado.hasOwnProperty(estado)) {
                    let cidades = agrupamentoEstado[estado];
                    let total = agrupamentoEstado[estado].totalCasos;
                    $('.cities-list').append(templateStates(estado, total, cidades));
                }
            }
            $('.cities-list').prepend($(templateCities({
                'cidade':"Brasil",
                'qtde_confirmado': totalConfirmado,
                'qtde_suspeito': totalSuspeito,
                'qtde_mortes': totalMortos,
                'lat': -14.2350,
                'lng': -51.9253
            })).addClass('brasil'));

            $('#cidadeSelecionadaNome').text("Brasil");
            $('#cidadeSelecionadaTotalCasos').text((totalConfirmado + totalSuspeito + totalMortos));

            setTotalCountTo('#totalCasos', (totalConfirmado + totalSuspeito + totalMortos));
            setTotalCountTo('#totalConfirmado', totalConfirmado);
            setTotalCountTo('#totalSuspeito', totalSuspeito);
            setTotalCountTo('#totalMortos', totalMortos);
            setTotalCountTo('#totalVivos', parseFloat(209), ()=> $('#totalVivos').text(`${$('#totalVivos').text()}.3 milhões`));
            
            getLocation(casos);
        });
        buscarNews((result) => {
            let noticias_buscadas = [];
            result.noticias.forEach(noticia => {
                noticias_buscadas.push(convertXmlToJSon(noticia));
            });
            if (!noticias_buscadas.length) {
                return;
            }
            noticias_buscadas.forEach(noticia_buscada => {
                if (noticia_buscada) {
                    let noticias = {};
                    noticias = noticia_buscada.rss.channel;
                    noticias.item.forEach(noticia => {
                        if (noticia.title.toLocaleLowerCase().search('coronavirus') > -1 || noticia.title.toLocaleLowerCase().search('covid-19') > -1 ) {
                            $('.news').append(templateNews(noticia));
                        }
                    });
                }
            });
            $('.news').removeClass('none');
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
        color: '#d60000',
        fillColor: '#d60000',
        fillOpacity: 1,
        radius: 4 + (parseInt(dado.qtde_confirmado)/100)
    }).bindTooltip(templateTooltip(dado)).addTo(map);
}
function templateTooltip(dado) {
    let cidade = (dado.cidade)? dado.cidade : '';
    let totalConfirmado = dado.qtde_confirmado;
    let totalSuspeito = dado.qtde_suspeito;
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
    let totalSuspeito = dado.qtde_suspeito;
    let totalMortos = dado.qtde_mortes;
    let lat = dado.lat;
    let lng = dado.lng;
    let totalCasos = totalConfirmado + totalSuspeito + totalMortos;

    return `
        <li>
            <div class="template-cidade"
                data-lat="${lat}" 
                data-lng="${lng}" 
                data-confirmado="${totalConfirmado}"
                data-suspeito="${totalSuspeito}"
                data-mortos="${totalMortos}"
                data-cidade="${cidade}">

                <span style="margin: 0px 0px 0px 25px">${cidade}</span>
                <span class="total-casos" style="margin: 0px 25px 0px 0px; font-weight: bold;">${totalCasos}</span>
            </div>
        </li>
    `;
}
function templateStates(estado, totalCasos, cidades) {
    let li = `
        <li>
            <div class="template-estado">
                <span style="margin: 0px 0px 0px 25px; max-width: 245px;">${estado}</span>
                <span class="total-casos" style="margin: 0px 25px 0px 0px; font-weight: bold;">
                    ${totalCasos}
                    <i class="fa fa-chevron-down" style="color: rgba(255, 255, 255, 0.7);"></i>
                </span>
            </div>            
        </li>
    `;

    li = $(li).append($('<div class="estado-lista-cidades"></div>').append(cidades.map((cidade) => cidade)));
    return li;
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
function buscarNews(cb) {
    $.ajax({
        // url: "http://ec2-54-196-120-46.compute-1.amazonaws.com/api-corona/noticias",
        // url: "http://[::1]/corona/noticias.php/",
        type: 'get',
        dataType: 'json',
        processData: false,
        contentType: "application/x-www-form-urlencodedy",
        success: function(resultado) {
            if (typeof cb == "function") {
                cb(resultado);
            }
        }
    });
}
function convertXmlToJSon(xml) {
    let x2js = new X2JS();
    return x2js.xml_str2json(xml);
}
function templateNews(news) {
    let imagens_substitutas = ["coronavirus-img-noticia-default.jpg", "coronavirus-img-noticia-default-2.jpg", "coronavirus-img-noticia-default-3.jpg"]

    let linkImage = (news.description.__cdata)? news.description.__cdata : news.description;
    linkImage = linkImage.slice(linkImage.search('https:'), linkImage.search('.jpg') + 5);
    if (!linkImage) {
        linkImage = imagens_substitutas[Math.floor(Math.random() * (3 - 0))];
    }
    let link = news.link;
    let title = news.title;

    return `
        <a href="${link}" class="template-noticia">
            <img class="news-image" src="${linkImage}">
            <div> ${title} </div>
        </a>
    `;
}

function setTotalCountTo(element, data, cb) {
    $(element).countTo({
        from: 0,
        to: data,
        speed: 3000,
        refreshInterval: 50,
        onComplete: function() {
          if (typeof cb == "function") {
              cb();
          }
        }
    });
}

function validarDados(dado) {
    dado.qtde_confirmado = $.isNumeric(dado.qtde_confirmado)? parseInt(dado.qtde_confirmado) : 0;
    dado.qtde_suspeito = $.isNumeric(dado.qtde_suspeito)? parseInt(dado.qtde_suspeito) : 0;
    dado.qtde_mortes = $.isNumeric(dado.qtde_mortes)? parseInt(dado.qtde_mortes) : 0;
    dado.lat = $.isNumeric(dado.lat)? dado.lat : 0;
    dado.lng = $.isNumeric(dado.lng)? dado.lng : 0;

    return dado;
}