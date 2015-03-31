var require = {
    baseUrl: 'assets/scripts',
    waitSeconds: 0,

    paths: {
        // jQuery and plugin
        jquery: 'lib/jquery-1.11.1.min',
        jquery_modal: 'lib/jquery.modal',
        jquery_validate: 'lib/jquery.validate',
        jquery_atwho: 'lib/jquery.atwho.min',
        jquery_caret: 'lib/jquery.caret.min',

        // utils
        md5: 'lib/md5.min',
        locache: 'lib/locache.min',

        // components
        IChanggePlayer: 'lib/ichangge-player',
        Qiniu: 'lib/qiniu',
        socket_io: 'lib/socket.io-client',

        //hook
        Tocca: 'lib/Tocca',
        hook: 'lib/hook',
        mousewheel: 'lib/mousewheel'

        // auth
        // weibo_sdk: 'http://tjs.sjs.sinajs.cn/open/api/js/wb.js?appkey=790484299&debug=true'
    },

    shim: {
        Qiniu: {
            deps: ["lib/plupload.full.min"]
        },
        jquery_modal: {
            deps: ['jquery']
        },
        jquery_validate: {
            deps: ['jquery']
        },
        jquery_atwho: {
            deps: ['jquery', 'jquery_caret']
        },
        jquery_caret: {
            deps: ['jquery']
        },
        hook: {
            deps: ['jquery', 'mousewheel']
        }
    }
};