
    /*
        (c) 2015 Brayden Strasen
        https://creativecommons.org/licenses/by-nc-sa/4.0/
    */

    var players = [],
        joined = 0,
        track = 5,
        scale = 1,
        anit = 400,
        currentGame = "HaloOnline",
        servers;

    function isset(val,other) {return (val !== undefined) ? val : other;}
    function randomNum(n) {return Math.floor(Math.random()*n);}

    function randomServers(num) {
        var b,r;
        servers = [];
        for(i=0; i < num; i++) {
            b = Object.keys(maps)[randomNum(Object.keys(maps).length)];
            r = (randomNum(7)+1)*2;
            servers[i] = {
                "name" : "Random Server #"+(i+1),
                "gametype" : gametypes[randomNum(gametypes.length)],
                "map" : Object.keys(maps[b])[randomNum(Object.keys(maps[b]).length)],
                "players" : {
                    "max" : r,
                    "current" : randomNum(r)+1
                }
            };
            if(servers[i].map == "name") {servers[i].map = "EDGE";}
        }
    }

    function initalize() {
        var set,b,g,i,e;
        for(i=0; i < Object.keys(settings).length; i++) {
            set = Object.keys(settings)[i];
            if(settings[set].typeof == "select") {
                $('#dewrito-options').children('.options-select').append("<div data-option='"+set+"' class='selection'><span class='label'>"+settings[set].name+"</span><span class='left'></span><span class='value'>...</span><span class='right'></span></div>");
            }
            if(settings[set].typeof == "input") {
                $('#dewrito-options').children('.options-select').append("<div data-option='"+set+"' class='selection'><span class='label'>"+settings[set].name+"</span><span class='input'><input type='text' maxlength=24 /></span></div>");
            }
            if(settings[set].typeof == "color") {
                $('#dewrito-options').children('.options-select').append("<div data-option='"+set+"' class='selection'><span class='label'>"+settings[set].name+"</span><span class='input'><input id='option-"+set+"'/></span></div>");
                $('#option-'+set).spectrum({
                    color: settings[set].current,
                    preferredFormat: "hex",
                    showInput: true,
                    showPalette: true,
                    showSelectionPalette: false,
                    palette: [
                        ["#fb8b9f", "#cf3e3e","#e97339"],
                        ["#ffdb41","#2f703d","#375799"],
                        ["#41aaa9","#d4d4d4","#5a5a5a"]
                    ],
                    change: function(color) {changeSetting(set,color.toHexString()); console.log(color.toHexString());}
                });
            }
            settings[set].update();
        }
        for(i=0; i < Object.keys(maps).length; i++) {
            b = Object.keys(maps)[i];
            $('#choosemap').children('.map-select').append("<div data-game='"+b+"' class='selection'><span class='label'>"+maps[b].name+"</span></div>");
            $('#choosemap').append("<div class='map-select2 animated' id='maps-"+b+"'></div>");
            $(".map-select2").mousewheel(function(event, delta) {
                this.scrollTop -= (delta*5);
                event.preventDefault();
            });
            for(e=1; e < Object.keys(maps[b]).length; e++) {
                g = Object.keys(maps[b])[e];
                $('#maps-'+b).append("<div data-map='"+g+"' class='selection'><span class='label'>"+g+"</span></div>");
            }
        }
    }

    function changeSetting(s,by) {
        $('#click')[0].currentTime = 0;
        $('#click')[0].play();
        var e = settings[s];
        if(e.typeof == "select") {
            if(by == 1) {
                if(e.current < e.max) {e.current+=e.increment;}
                else {e.current=e.min;}
            }
            else if(by === 0) {
                if(e.current > e.min) {e.current-=e.increment;}
                else {e.current=e.max;}
            }
        }
        if(e.typeof == "input" || e.typeof == "color") {e.current = by;}
        settings[s] = e;
        e.update();
        $.cookie(s,e.current);
    }

    $(document).ready(function() {
        initalize();
        var e = ((window.innerHeight-$('#menu').height())/2)-40;
        $('#menu').css('margin-top',(e < 0) ? '0px' : e+'px');
        $('#music')[0].volume = settings.musicvolume.current;
        $('#click')[0].volume = settings.sfxvolume.current;
        $('#start').click(function() {startgame();});
        $('.selection').hover(function() {
            $('#click')[0].currentTime = 0;
            $('#click')[0].play();
        });
        $('.map-select .selection').click(function() {changeMap1($(this).attr('data-game'));});
        $('.map-select2 .selection').click(function() {
            changeMap2($(this).attr('data-map'),0);
            changeMenu("options-custom");
        });
        $('.map-select2 .selection').hover(function() {changeMap2($(this).attr('data-map'));});
        $('.right').click(function() {
            var c = $(this).parent('.selection').attr('data-option');
            changeSetting(c,1);
        });
        $('.left').click(function() {
            var c = $(this).parent('.selection').attr('data-option');
            changeSetting(c,0);
        });
        $('input').focusout(function() {
            var c = $(this).parent('.input').parent('.selection').attr('data-option'), val = $(this).val();
            changeSetting(c,val);
        });
        $("[data-action='menu']").click(function() {changeMenu($(this).attr('data-menu'));});
        $('#back').click(function() { changeMenu($(this).attr('data-action')); });
        $("#lobby-container").mousewheel(function(event, delta) {
            this.scrollTop -= (delta*34);
            event.preventDefault();
        });
        $("#browser").mousewheel(function(event, delta) {
            this.scrollTop -= (delta*70);
            event.preventDefault();
        });
    });

    String.prototype.toTitleCase = function() {return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});};

    function acr(s){
        var words, acronym, nextWord;
        words = s.split(' ');
        acronym= "";
        index = 0;
        while (index<words.length) {
            nextWord = words[index];
            acronym = acronym + nextWord.charAt(0);
            index = index + 1;
        }
        return acronym.toUpperCase();
    }

    function loadServers() {
        $('#browser').empty();
        randomServers(randomNum(12)+6);
        for(var i=0; i<servers.length; i++) {
            var p = (servers[i].map.toLowerCase()).toTitleCase(),
                gt = servers[i].gametype;
            if(servers[i].gametype.length > 12) {gt = acr(servers[i].gametype);}
            $('#browser').append("<div class='server' id='server"+i+"' data-server="+i+"><div class='thumb'><img src='img/maps/"+servers[i].map+".png'></div><div class='info'><span class='name'>"+servers[i].name+"</span><span class='settings'>"+gt+" on "+p+"</span></div><div class='players'>"+servers[i].players.current+"/"+servers[i].players.max+"</div></div>");
            $('#server'+i).css("display","none");
            $('#server'+i).delay(Math.floor(Math.random()*1000)+anit).fadeIn(anit);
        }
        $('.server').hover(function() {
            $('#click')[0].currentTime = 0;
            $('#click')[0].play();
        });
        $('.server').click(function() {changeMenu("serverbrowser-custom",$(this).attr('data-server'));});
    }

    function hexToRgb(hex,opacity) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return "rgba("+parseInt(result[1], 16)+","+parseInt(result[2], 16)+","+parseInt(result[3], 16)+","+opacity+")";
    }

    function brighter(color) {
        var colorhex = (color.split("#")[1]).match(/.{2}/g);
        for(var i=0; i < 3; i++) {
            var e = parseInt(colorhex[i],16);
            e+= 30;
            colorhex[i] = ((e > 255) ? 255 : e).toString(16);
        }
        return "#"+colorhex[0]+colorhex[1]+colorhex[2];
    }

    function playersJoin(number,max,time) {
        joined = 1;
        $('#lobby').empty();
        $('#lobby').append("<tr class='top'><td class='info' colspan='2'>Current Lobby <span id='joined'>1</span>/<span id='maxplayers'>0</span></td></tr>");
        $('#maxplayers').text(max);
        $.getJSON( "players.json", function( data ) {
            function shuffle(array) {
                var currentIndex = array.length, temporaryValue, randomIndex ;
                while (0 !== currentIndex) {
                    randomIndex = Math.floor(Math.random() * currentIndex);
                    currentIndex -= 1;
                    temporaryValue = array[currentIndex];
                    array[currentIndex] = array[randomIndex];
                    array[randomIndex] = temporaryValue;
                }
                return array;
            }
            players = shuffle(data);
            $('#lobby').append("<tr id='user' data-color='"+hexToRgb(user.color,0.5)+"' style='background:"+hexToRgb(user.color,0.5)+";'><td class='name'>"+user.name+"</td><td class='rank'><img src='img/ranks/"+user.rank+".png'</td></tr>");
            for(var i=0; i<number; i++) {
                $('#lobby').append("<tr id='player"+i+"' data-color='"+hexToRgb(players[i].color,0.5)+"' style='background:"+hexToRgb(players[i].color,0.5)+";'><td class='name'>"+players[i].name+"</td><td class='rank'><img src='img/ranks/"+players[i].rank+".png'</td></tr>");
                $('#player'+i).css("display","none");
                $('#player'+i).delay(Math.floor(Math.random()*time)).fadeIn(anit,callback);
            }
            function callback() {joined++; $('#joined').text(joined);}
            $('#lobby tr').hover(function() {
                $('#click')[0].currentTime = 0;
                $('#click')[0].play();
            });
            $("#lobby tr").mouseover(function() {
                var n = $(this).attr('id'),
                    nn = parseInt(n.split("r")[1],10),
                    hexes = (n == "user") ? user.color : players[nn].color,
                    bright = brighter(hexes);
                $(this).css("background-color",hexToRgb(bright,0.75));
            }).mouseout(function() {
                var n = $(this).attr('id'),
                    nn = parseInt(n.split("r")[1],10);
                $(this).css("background-color",(n == "user") ? hexToRgb(user.color,0.5) : hexToRgb(players[nn].color,0.5));
            });
            $('#lobby tr').click(function() {
                var e = $(this).children('.name').text(),
                    n = $(this).attr('id'),
                    nn = parseInt(n.split("r")[1],10),
                    hexes = (n == "user") ? user.color : players[nn].color,
                    bright = brighter(hexes);
                changeMenu("custom-player",e);
                $('#lobby tr').each(function() {
                    var color = $(this).attr('data-color');
                    $(this).css('background',color);
                    $(this).children('.rank').css('background','rgba(0,0,0,0.15)');
                });
                $(this).css("background-color",hexToRgb(bright,0.75));
                $(this).children('.rank').css('background','transparent');
            });
        });
    }

    function changeMenu(menu,details) {
        var f;
        if(menu == "main-custom") {
            $('#customgame').attr('data-from','main');
            $('#dewrito').css({"opacity":0, "top":"920px"});
            $('#back').fadeIn(anit);
            $('#back').attr('data-action','custom-main');
            $('#customgame').css({"top":"0px"});
            $('#main').css({"top":"720px"});
            playersJoin(15,16,10000);
        }
        if(menu == "custom-main") {
            $('#dewrito').css({"opacity":0.95, "top":"240px","-webkit-transition-timing-function":"400ms","-webkit-transition-delay":"0ms"});
            $('#customgame').css({"top":"-720px"});
            $('#main').css({"top":"0px"});
            $('#back').attr('data-action','main-main2');
        }
        if(menu == "serverbrowser-custom" && details) {
            var d = servers[details];
            if(d.players.current != d.players.max) {
                changeMap2(d.map);
                $('#subtitle').text(d.name);
                $('#gametype-display').text(d.gametype);
                $('#gametype-icon').css('background',"url('img/gametypes/"+d.gametype+".png') no-repeat 0 0/cover");
                $('#serverbrowser').css({"top":"720px"});
                $('#customgame').css({"top":"0px"});
                $('#back').attr('data-action','custom-serverbrowser');
                $('#customgame').attr('data-from','serverbrowser');
                playersJoin(d.players.current,d.players.max,3000);
            }
        }
        if(menu == "custom-serverbrowser") {
            $('#customgame').css({"top":"-720px"});
            $('#serverbrowser').css({"top":"0px"});
            $('#back').attr('data-action','serverbrowser-main');
            $('#browser').empty();
            loadServers();
        }
        if(menu == "main-serverbrowser") {
            $('#dewrito').css({"opacity":0, "top":"920px"});
            $('#back').fadeIn(anit);
            $('#back').attr('data-action','serverbrowser-main');
            $('#serverbrowser').css({"top":"0px"});
            $('#main').css({"top":"720px"});
            $('#browser').empty();
            loadServers();
        }
        if(menu == "serverbrowser-main") {
            $('#dewrito').css({"opacity":0.95, "top":"240px","-webkit-transition-timing-function":"400ms","-webkit-transition-delay":"0ms"});
            $('#serverbrowser').css({"top":"-720px"});
            $('#main').css({"top":"0px"});
            $('#back').attr('data-action','main-main2');
        }
        if(menu == "main2-main") {
            $('#back').fadeIn(anit);
            $('#back').attr('data-action','main-main2');
            $('#main').css({"top":"0px"});
            $('#main2').css({"top":"720px"});
        }
        if(menu == "main-main2") {
            $('#back').fadeOut(anit);
            $('#main').css({"top":"-720px"});
            $('#main2').css({"top":"0px"});
        }
        if(menu == "custom-options") {
            $('#customgame-options').show();
            $('#back').attr('data-action','options-custom');
            $('#customgame').fadeOut(anit);
            $('#options').fadeIn(anit);
            $('#dewrito').css('top','400px');
            $('#dewrito').css({"opacity":0.9,"top":"400px","-webkit-transition-timing-function":"200ms","-webkit-transition-delay":"200ms"});
        }
        if(menu == "custom-map") {
            $('#choosemap').show();
            $('#back').attr('data-action','options-custom');
            $('#customgame').fadeOut(anit);
            $('#options').fadeIn(anit);
            $('#dewrito').css('top','400px');
            $('#dewrito').css({"opacity":0.9,"top":"400px","-webkit-transition-timing-function":"200ms","-webkit-transition-delay":"200ms"});
        }
        if(menu == "options-custom") {
            $('.options-section').hide();
            f = $('#customgame').attr('data-from');
            $('#back').attr('data-action','custom-'+f);
            $('#customgame').fadeIn(anit);
            $('#options').fadeOut(anit);
            $('#dewrito').css({"opacity":0,"top":"920px","-webkit-transition-timing-function":"200ms","-webkit-transition-delay":"0ms"});
        }
        if(menu == "main-options") {
            $('#dewrito-options').show();
            $('#back').fadeIn(anit);
            $('#back').attr('data-action','options-main');
            $('#main2').fadeOut(anit);
            $('#options').fadeIn(anit);
            $('#dewrito').css({"top":"400px"});
        }
        if(menu == "options-main") {
            $('.options-section').hide();
            $('#back').fadeOut(anit);
            $('#main2').fadeIn(anit);
            $('#options').fadeOut(anit);
            $('#dewrito').css({"top":"240px","-webkit-transition-delay":"0ms"});
        }
        if(menu == "custom-player" && details) {
            $('#customgame').css({"left" : "-800px"});
            $('#playerinfo').css({"right" : "100px"});
            $('#back').attr('data-action','player-custom');
            $('#playermodel').css('background-image',"url('img/players/"+details+".png')");
        }
        if(menu == "player-custom") {
            $('#customgame').css({"left" : "0px"});
            $('#playerinfo').css({"right" : "-700px"});
            f = $('#customgame').attr('data-from');
            $('#back').attr('data-action','custom-'+f);
        }
        $('#slide')[0].currentTime = 0;
        $('#slide')[0].play();
    }

    function startgame() {
        $('#beep')[0].play();
        $('#music')[0].pause();
        $('#black').fadeIn(3500).delay(5000).fadeOut(1000, function() {$('#music')[0].play();});
    }

    function changeMap1(game) {
        $('.map-select .selection').removeClass('selected');
        $("[data-game='"+game+"']").addClass('selected');
        $('.map-select').css({"left":"100px"});
        $('#maps-'+currentGame).hide().css({"left":"310px", "opacity":0});
        $('#maps-'+game).css('display', 'block');
        $('#maps-'+game).animate({"left":"360px", "opacity":1},anit/8);
        currentGame = game;
        $('#slide')[0].currentTime = 0;
        $('#slide')[0].play();
    }

    function changeMap2(map) {
        $('#map-thumb').css({"background-image":"url('img/maps/"+map+".png')"});
        $('#map-thumb-options').css({"background-image":"url('img/maps/"+map+".png')"});
        $('#currentmap').text(map);
        $('#map-name-options').text(map);
        $('#map-info-options').text(maps[currentGame][map]);
        $('.map-select2 .selection').removeClass('selected');
        $("[data-map='"+map+"']").addClass('selected');
  }
