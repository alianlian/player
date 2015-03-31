<?php if (!defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 14-7-21
 * Time: 下午1:40
 */
require_once('smarty/Smarty.class.php');
require_once(BASEPATH.'helpers/url_helper.php');

class CI_Smarty extends Smarty{
    function __construct() {
        parent::__construct();
        $this->template_dir =  APPPATH . "views/templates"; //模板存放目录,本人直接用的是CI的views目录，当然可以用templates也行。
        $this->compile_dir = APPPATH . "views/templates_c"; //编译目录，在application下需要新建此目录
        $this->cache_dir = APPPATH . "views/cache"; //缓存目录
        $this->config_dir = APPPATH . "views/templates/configs"; //配置文件目录
        $this->caching = 0;
        $this->setCacheLifetime(1); //缓存更新时间
        $this->debugging = false;
        $this->compile_check = true; //检查当前的模板是否自上次编译后被更改；如果被更改了，它将重新编译该模板。
        //$this->force_compile = true; //强制重新编译模板
        //$this->allow_php_templates= true; //开启PHP模板
        $this->left_delimiter = "{"; //左定界符
        $this->right_delimiter = "}"; //右定界符
        $this->smarty->assign('base_url', base_url()); ////非常重要，静态页面的css以及js路径

        // 加载switch指令插件
        $this->loadPlugin('smarty_compiler_switch');
    }
}
/* End of file Smarty.php */
/* Location: ./application/libraries/Smarty.php */