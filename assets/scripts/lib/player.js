(function($) {
    var options = {
            playlist: [],
            loop: true,
        },
        $mainContainer,
        currentPlay = 0,
        loadFlag = [],
        timer,
        lrcTimer,
        volume = 80;

    var init = function (opts) {
        $.extend(options, opts);

        createDOM();
        initPlayer(options);
        bindEvents();
    };

    var select = function (index) {
        playByIndex(index);
    };

    var add = function (playlist) {
        initList(playlist);
        addSourceByIndex(options.playlist.length, playlist);
        options.playlist = options.playlist.concat(playlist);
    };

    function createDOM() {
        var PLAYER_TEMPLATE = 
            '<div id="audio">' +   
            '<div class="music-info">' + 
            '<div class="image-wrapper-s">' +
            '<img src="images/musician-default-cover.png" class="image-present-s">' +
            '</div>' +
            '<div class="music-info-main ml-10">' + 
            '<p class="music-name mt-10"></p>' +
            '<p class="singer-name mt-10"></p>' +
            '<p class="duration mt-10"></p>' +
            '</div>' + 
            '</div>' +
            '<div class="controller">'+
            '<a href="javascript:void(0);" class="prev-btn mr-20">' +
            '<i class="fa fa-step-backward fa-lg"></i>' +
            '</a>' +
            '<a href="javascript:void(0);" id="playBtn">' +
            '<i class="fa fa-play fa-2x"></i>' +
            '</a>' +
            '<a href="javascript:void(0);" class="next-btn ml-20">' +
            '<i class="fa fa-step-forward fa-lg"></i>' +
            '</a>' +
            '<p class="volume-control">' +
            '<a href="javascript:void(0);" title="点击关闭声音">' +
            '<i class="fa fa-volume-down fa-lg"></i>' +
            '</a>' +
            '<span class="volume-regulate" title="调节音量大小">' +
            '<span class="volumebar">' + 
            '</span>' +
            '<span class="volumeop">' +
            '</span>' +
            '</span>' +
            '</p>' +
            '</div>' +
            '<div>' +
            '</div>' +
            '<a href="javascript:void(0);" class="open-list" title="展开播放列表">' +
            '<i class="fa fa-list fa-lg"></i>' +
            '</a>' +
            '<a href="javascript:void(0);" title="显示歌词" id="btn-lyc">词</a>' +
            '<p class="play-bar">' +
            '<span class="play-bar-bg"></span>' +
            '<span class="play-current"></span>' +
            '<span class="progress_op"></span>' +
            '</p>' +
            '<a href="javascript:void(0);" class="fold-btn" title="收起">' +
            '<i class="fa fa-angle-left fa-lg"></i>' +
            '</a>' +
            '<div class="playlist-box">' + 
            '<nav class="list-title">播放列表</nav>' + 
            '<ul class="playlist">' +
            '</ul>' +
            '</div>' + 
            '<div class="lyric-list">' + 
            '</div>' +      
            '</div>';

        // $('body').append($(PLAYER_TEMPLATE));

        $mainContainer = $('#audio');
    }

    function initPlayer(options) {
        initList(options.playlist); 
        addSource(options.playlist);
    }

    function bindEvents() {
        /* 播放器收起和打开 */
        $mainContainer.on('click', '.fold-btn', function() {
            if ($(this).attr('title') == '收起') {
                $("#audio").animate({
                    'left': '-400px'
                }, 300);
                $(this).attr('title', '展开');
                $(this).find('i').removeClass('fa-angle-left').addClass('fa-angle-right');
            } else {
                $("#audio").animate({
                    'left': '0px'
                }, 300);
                $(this).attr('title', '收起');
                $(this).find('i').removeClass('fa-angle-right').addClass('fa-angle-left');
            }
        });

        /* 播放列表展开和收起*/
        $mainContainer.on('click','.open-list', function() {
            $('.playlist-box').toggle();
        });

        /* 歌曲播放和暂停 */
        $mainContainer.on('click', '#playBtn', function(){
            if ($(this).find('.fa-play').length) {
                $(this).find('.fa-play').removeClass('fa-play').addClass('fa-pause');
                //载入歌曲
                if (!loadFlag[currentPlay]) {
                    initPlayerInfo(0);
                    $mainContainer.find('.single-song').eq(currentPlay).jWebAudio('load', function() {
                        console.log('load');
                        $mainContainer.find('.single-song').eq(currentPlay).jWebAudio('play');
                        loadFlag[currentPlay] = 1;
                        /* Update position */
                        var total = $mainContainer.find('.single-song').eq(currentPlay).jWebAudio('duration');
                        formatTime(total);
                        timer = setInterval(function() {
                            var pos = 0;
                            if (total !== 0) {
                                pos = $mainContainer.find('.single-song').eq(currentPlay).jWebAudio('seek') / total * 400;
                            }
                            $mainContainer.find('.play-current').css('width', pos);
                            $mainContainer.find('.progress_op').css('left', pos - 3);
                        }, 100);
                    });
                    //载入歌词
                    initLrcData();
                } else {
                    $mainContainer.find('.single-song').eq(currentPlay).jWebAudio('play');
                }
            } else {
                $(this).find('.fa-pause').removeClass('fa-pause').addClass('fa-play');
                $mainContainer.find('.single-song').eq(currentPlay).jWebAudio('pause');
            }
        });

        /* 播放下一首 */
        $mainContainer.on('click', '.next-btn', function() {
            $mainContainer.find('.fa-pause').removeClass('fa-pause').addClass('fa-play');
            try {
                $mainContainer.find('.single-song').eq(currentPlay).jWebAudio('stop');
            } catch (err) {}
            if (currentPlay == options.playlist.length -1) {
                currentPlay = 0;
            } else {
                currentPlay ++ ;
            }
            playByIndex(currentPlay);
        });

        /* 播放上一首 */
        $mainContainer.on('click', '.prev-btn', function() {
            $mainContainer.find('.fa-pause').removeClass('fa-pause').addClass('fa-play');
            try {
                $mainContainer.find('.single-song').eq(currentPlay).jWebAudio('stop');
            } catch (err) {}
            if (currentPlay == 0) {
                currentPlay = options.length -1 ;
            } else {
                currentPlay --;
            }
            playByIndex(currentPlay);
        });

        /* 进度拖动滑块 */
        $mainContainer.on('click', '.progress_op', function(e){
            e.stopPropagation();
        });

        /* 歌曲播放进度调整 */
        $mainContainer.on('click','.play-bar', function(e) {
            var percent = e.offsetX / $(this).width(),
                total;
            if (loadFlag[currentPlay]) {
                var total = $mainContainer.find('.single-song').eq(currentPlay).jWebAudio('duration');
                $mainContainer.find('.single-song').eq(currentPlay).jWebAudio('seek', percent * total);
                icrJump(percent * total);
            };
        });

        /* 关闭声音以及打开 */
        $mainContainer.on('click', '.volume-control a', function(){
            if ($(this).find('.fa-volume-down').length) {
                $(this).find('.fa-volume-down').removeClass('fa-volume-down').addClass('fa-volume-off');
                $mainContainer.find('.single-song').eq(currentPlay).jWebAudio('options',{
                    volume: 0
                });
            } else {
                $(this).find('.fa-volume-off').removeClass('fa-volume-off').addClass('fa-volume-down');
                volume = parseInt($(this).parent('.volume-control').find('.volumebar').width()) * 2;
                $mainContainer.find('.single-song').eq(currentPlay).jWebAudio('options',{
                    volume: volume
                });
            }
        });

        /* 调整音量大小 */
        $mainContainer.on('click', '.volume-regulate', function(e) {
            var width = e.offsetX;
            console.log(width);
            volume = parseInt(width) * 2;
            $(this).parent('.volume-control').find('.fa-volume-off').removeClass('.fa-volume-off').addClass('fa-volume-down');
            $mainContainer.find('.volumebar').width(width);
            $mainContainer.find('.volumeop').css('left', (width - 3) + 'px');
            $mainContainer.find('.single-song').eq(currentPlay).jWebAudio('options',{
                volume: volume
            });
        });

        /* 点击列表里面歌曲播放 */
        $mainContainer.on('click', '.single-song', function(e) {
            $mainContainer.find('.fa-pause').removeClass('fa-pause').addClass('fa-play');
            $mainContainer.find('.single-song').eq(currentPlay).jWebAudio('stop');
            currentPlay = $(this).index();
            playByIndex(currentPlay);
        });

        $(document).on('player.error',function(){
            console.log('加载出错啦，即将播放下一首');
            $mainContainer.find('.next-btn').click();
        });

        /* 点击显示歌词 */
        $mainContainer.on('click', '#btn-lyc', function(){
            $mainContainer.find('.lyric-list').toggle();
        });

        var isPress = false;

        /* 进度拖动滑块 */
        $mainContainer.on('mousedown', '.progress_op', function(e){
            isPress = true;
            var $progress_op = $(this);
            var objWidth = $(this).width;
            var objLeft = $(this).parent('.play-bar').offset().left;
            var maxPathway = $(this).parent('.play-bar').width - $(this).width;
            var pointX = e.clientX; //鼠标坐标x,距浏览器
            var blockX = $(this).offset().left; //滑块的left
            var pointInBlockW = pointX - blockX; //鼠标在滑块的横向位置  
            $mainContainer.addClass('select-unable');
            $mainContainer.on('mousemove', function(e){
                pointX = e.clientX;
                blockX = $progress_op.offset().left;
                var nowX = pointX - pointInBlockW - objLeft;
                clearInterval(timer);
                if(pointX>=(objWidth+objLeft)){//如果鼠标超出滑道的最右边,取最大值
                    setAddress(maxPathway);
                }
                else if(pointX<=objLeft)//如果鼠标超出滑道最左边,取最小值
                {
                    setAddress(0);
                }
                else  if (nowX >= maxPathway) {//如果滑块的当前距离大于等于有效滑道距离,不运动
                    return;
                }
                else if (nowX <= 0) {//如果滑块的当前距离小于0,不运动
                    return;
                }
                else {
                    setAddress(nowX);
                }
            });
        });

        $(document).mouseup(function(){
            $mainContainer.off('mousemove');
            $mainContainer.removeClass('select-unable');
            if (isPress) {
                isPress = false;
                var percent = $mainContainer.find('.play-current').width() / $mainContainer.find('.play-bar').width(),
                    total;
                if (loadFlag[currentPlay]) {
                    total = $mainContainer.find('.single-song').eq(currentPlay).jWebAudio('duration');
                    $mainContainer.find('.single-song').eq(currentPlay).jWebAudio('seek', percent * total);
                    icrJump($mainContainer.find('.single-song').eq(currentPlay).jWebAudio('seek'));
                    initTimer();
                };
                
            };
        });
    }

    function initTimer() {
        var total = $mainContainer.find('.single-song').eq(currentPlay).jWebAudio('duration');
        timer = setInterval(function() {
                    var pos = 0;
                    if (total !== 0) {
                        pos = $mainContainer.find('.single-song').eq(currentPlay).jWebAudio('seek') / total * 400;
                    }
                    $mainContainer.find('.play-current').css('width', pos);
                    $mainContainer.find('.progress_op').css('left', pos - 3);
                }, 100);
    }

    function setAddress(now) {
        $mainContainer.find('.progress_op').css({'left': now + 'px'});
        $mainContainer.find('.play-current').css({'width': now + 'px'});
    }

    //初始化歌词数据
    function initLrcData() {
        $mainContainer.find('.lyric-list').append('<p class="line-null" >&nbsp;</p><p>歌词载入中……</p>');
        $.ajax({
            url: options.playlist[currentPlay].lrc,
            type: 'get',
            dataType: 'html',
            success: function(res) {
                var arr = parseLrc(res),
                    current,
                    _html = '<p class="line-null" >&nbsp;</p>';
                for (var i = 0; i < arr.length; i++) {
                    _html += '<p class="lrc-line" data-time="'+ arr[i][0] +'">'+ (arr[i][1] || '……')  +'</p>'
                };
                clearInterval(lrcTimer);
                $mainContainer.find('.lyric-list').empty().append(_html);
                $mainContainer.find('.lyric-list').scrollTop(0);
                lrcTimer = setInterval(function(){
                    try {
                        current = $mainContainer.find('.single-song').eq(currentPlay).jWebAudio('seek');
                    } catch (err) {}
                    ircMove(current);
                }, 800);
            },
            error: function (){
                $mainContainer.find('.lyric-list').empty().append('<p class="line-null" >&nbsp;</p><p class="line-null" >暂无歌词数据</p>');
            }
        });
    }

    //解析LRC文件返回歌词数组
    function parseLrc(text){
        var lyric = text.split('\r\n');
        var l = lyric.length;
        var lrc = [];
        for (i = 0; i < l; i++) {
            var d = lyric[i].match(/\[\d{2}:\d{2}((\.|\:)\d{2})\]/g);
            var t = lyric[i].split(d);
            if(d != null) { //过滤掉空行等非歌词正文部分
                //换算时间，保留两位小数
                var dt = String(d).split(':'); 
                var _t = parseInt(dt[0].split('[')[1])*60+parseFloat(dt[1].split(']')[0]); 
                lrc.push([_t, t[1]]);
            }
        };
        return lrc;
    }

    //歌词滚动
    function ircMove(currentT) {
        var $icrBox = $mainContainer.find('.lyric-list'),
            $list = $icrBox.find('p'),
            timer,
            index,
            s;

        for (var i = 0; i < $list.length; i++) {
            var dataTime = parseInt($($list[i]).attr('data-time'));

            if ( dataTime > 0 && dataTime === parseInt(currentT) ) {
                index = i;
                if (s != i) {
                    s = i;
                    $($list).removeClass('current');
                    $($list[i]).addClass('current');
                    var scrollHeight = 24 * (i - 1);
                    $icrBox.animate({
                        scrollTop: scrollHeight
                    }, 1000);
                };
            }
        };
    }

    //歌词跳到指定时间点
    function icrJump(currentT) {
        var $icrBox = $mainContainer.find('.lyric-list'),
            $list = $icrBox.find('p'),
            timer,
            index,
            s;

        for (var i = 0; i < $list.length; i++) {
            var dataTime = parseInt($($list[i]).attr('data-time')),
                nextTime = parseInt($($list[i+1]).attr('data-time'));

            if ( dataTime > 0 && dataTime <= parseInt(currentT) && nextTime >= parseInt(currentT)) {
                    $($list).removeClass('current');
                    $($list[i]).addClass('current');
                    var scrollHeight = 24 * (i - 1);
                    $icrBox.scrollTop(scrollHeight);
                    console.log(i);
            }
        };
    }

    //载入播放列表
    function initList(playlist) {
        var html = '';
        for (var i = 0; i < playlist.length; i++) {
            html  += '<li class="single-song">'+
                    '<span class="song-name">'+playlist[i].songName+'</span>'+
                    '<span class="singer-name">'+playlist[i].singerName+'</span>'+
                    '</li>'
        }
        $mainContainer.find('.playlist').append($(html));
    }

    //添加歌曲资源
    function addSource(playlist) {
        $mainContainer.find('.single-song').each(function(index) {
            var url = playlist[index].url;
            $(this).jWebAudio('addSoundSource', {
                'url': url,
                'finish': function() {
                    $mainContainer.find('.fa-pause').removeClass('fa-pause').addClass('fa-play');
                    $mainContainer.find('.next-btn').click();
                }
            });
        });
    }

    //从指定位置添加歌曲资源
    function addSourceByIndex(indexFrom, playlist) {
        $mainContainer.find('.single-song').filter(function(index) {
            return index >= indexFrom;
        }).each(function(index) {
            var url = playlist[index].url;
            $(this).jWebAudio('addSoundSource', {
                'url': url,
                'finish': function() {
                    $mainContainer.find('.fa-pause').removeClass('fa-pause').addClass('fa-play');
                    $mainContainer.find('.next-btn').click();
                }
            });
        });
    }

    function playByIndex(index) {
        $mainContainer.find('.play-current').css('width', '0px');
        $mainContainer.find('.progress_op').css('left', '-3px');
        if (!loadFlag[index]) {
            clearInterval(timer);
            initPlayerInfo(index);
            $mainContainer.find('.single-song').eq(index).jWebAudio('load', function() {
                $mainContainer.find('.single-song').eq(index).jWebAudio('play');
                loadFlag[index] = 1;
                /* Update position */
                var total = $('.single-song').eq(index).jWebAudio('duration');
                formatTime(total);
                timer = setInterval(function() {
                    var pos = 0;
                    if (total !== 0) {
                        pos = $mainContainer.find('.single-song').eq(index).jWebAudio('seek') / total * 400;
                    }
                    $mainContainer.find('.play-current').css('width', pos);
                    $mainContainer.find('.progress_op').css('left', pos - 3);
                }, 100);
            });
        } else {
            $mainContainer.find('.single-song').eq(index).jWebAudio('play');
            clearInterval(timer);
            initPlayerInfo(index);
            var total = $mainContainer.find('.single-song').eq(index).jWebAudio('duration');
                formatTime(total);
                timer = setInterval(function() {
                    var pos = 0;
                    if (total !== 0) {
                        pos = $mainContainer.find('.single-song').eq(index).jWebAudio('seek') / total * 400;
                    }
                    $mainContainer.find('.play-current').css('width', pos);
                    $mainContainer.find('.progress_op').css('left', pos - 3);
                }, 100);
        }
        $mainContainer.find('.fa-play').removeClass('fa-play').addClass('fa-pause');
        initLrcData();
    }

    function initPlayerInfo(index) {
        $mainContainer.find('.music-name').text(options.playlist[index].songName);
        $mainContainer.find('.music-info-main .singer-name').text(options.playlist[index].singerName);
        $mainContainer.find('.playlist').find('li').removeClass('current');
        $mainContainer.find('.playlist').find('li').eq(index).addClass('current');
    }

    /* 格式化时间 */
    function formatTime(duration) {
        var time = parseInt(duration/60)+ ':'+ parseInt(duration%60);
        $mainContainer.find('.duration').text(time);
    }

    window.player = {
        init: init,
        select: select,
        add: add
    }

})(jQuery);