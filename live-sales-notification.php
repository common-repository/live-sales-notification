<?php
/*
Plugin Name: Live Sales Notification
Plugin URI: https://wordpress.org/plugins/live-sales-notification
description: Live sales notification from woocommerce live-data/demo data with javascript library. This plugin illustrate a  beautiful pop-up view to the users, who can easily view the recent sales from the website, which are recently bought. So the user gets a confident on making the first purchase or proceed further.
Version: 1.0
Author: Sivaprakash
License: GPL2
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Text Domain:  lsnotification
*/

if( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
// Add required files while plugin is activated
add_action( 'plugins_loaded', 'lsnotification_sales_notification_free', 100 );
function lsnotification_sales_notification_free() {
    include_once( ABSPATH . 'wp-admin/includes/plugin.php' );
    if ( is_plugin_active( 'woocommerce/woocommerce.php' ) ) {
        require_once 'functions.php';
    } else {
        global $pagenow;
        if ( $pagenow == 'plugins.php' ) {
            function lsnotification_error_notice() {
                echo '<div class="error notice"><p>Live sales notification plugin can\'t able to run without WooCommerce plugin</p></div>';
            }
            add_action( 'admin_notices', 'lsnotification_error_notice' );
        }
    }
}