$(function() {

    var options = {
        playlist: [{
            'url': 'mp3s/z.mp3',
            'lrc': 'mp3s/z.lrc',
            'songName': '算什么男人',
            'singerName': '周杰伦'
        }, {
            'url': 'mp3s/m.mp3',
            'lrc': 'mp3s/m.lrc',
            'songName': '一切安好',
            'singerName': '莫文蔚'
        }, {
            'url': 'mp3s/s.mp3',
            'lrc': 'mp3s/s.lrc',
            'songName': '不该再是旧的',
            'singerName': '孙子涵'
        }]
    };

    player.init(options);

    var parent, ink, d, x, y;

    $('ul').on('click', 'a', function(e) {
        parent = $(this).parent();
        if(parent.find('.ink').length == 0) {
            parent.prepend('<span class="ink"></span>');
        }

        ink = parent.find('.ink');
        ink.removeClass('animate');

        if (!ink.height() && !ink.width()) {
            d = Math.max(parent.outerWidth(), parent.outerHeight());
            ink.css({height: d, width: d});
        };

        d = Math.max(parent.outerWidth(), parent.outerHeight());
        ink.css({height: d, width: d});


        x = e.pageX - parent.offset().left - ink.width()/2;

        y = e.pageY - parent.offset().top - ink.height()/2;

        ink.css({top:y+'px',left:x+'px'}).addClass('animate');
    });

})