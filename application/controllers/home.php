<?php

class Home extends CI_Controller {
    public function __construct()
    {
        parent::__construct();
        $this->load->helper('url');
        $this->load->library('smarty');
    }

    function index(){
        $this->smarty->display('home.tpl');
    }
}