<?php
    if( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
    global $script_params;
    global $values_in_JSON;      
    $script_params = array(
        'mobile_support' => get_option('salespopup_mobile_support'),
        'start_time' => get_option('salespopup_start_time'),
        'showing_time' => get_option('salespopup_showing_time'),
        'gap_time' => get_option('salespopup_gap_time'),
        'admin_support' => get_option('salespopup_admin_support'),
        'frequent_count' => get_option('salespopup_frequent_count'),
        'change_user_name' => get_option('salespopup_change_user_name'),
        'plugin_url' => plugin_dir_url(__FILE__),
        'freeze_notification' => get_option('salespopup_freeze_notification'),
        'front_end_support' => get_option('salespopup_front_end_support'),
        'csv_data' => get_option('salespopup_csv_data'),
        'notification_bg_color' => get_option('salespopup_notification_bg_color'),
        'live_json_data' => $values_in_JSON,
        'upload_sample_data' => get_option('salespopup_upload_status')
    );   
    if ( get_option('salespopup_csv_data') == 0 ) {         
        add_action('init', 'lsnotification_get_order_details');
    } else {
        $values_in_JSON = '';   
        add_action('init', function() use ($script_params) {
            wp_enqueue_script('notification_handle', plugin_dir_url(__FILE__).'js/notify_script.js', array( 'jquery' ), '', true);
            wp_localize_script( 'notification_handle', 'lsnConfigurations', $script_params );
        });
    }

    // Localize the script with new data
    function lsnotification_get_order_details() {
        global $script_params;        
        global $wpdb;
        global $woocommerce;
        $query = new WC_Order_Query( array(
            'limit' => 100,
            'orderby' => 'date',
            'order' => 'DESC',
            'return' => 'ids',
        ) );
        $orders = $query->get_orders();
        $db_value = array();
        $i = 0;
        $j = 0;
        while ( $i < count($orders) ) {           
            $order = wc_get_order( $orders[$i] );
            $items = $order->get_items();                   
            if ( count($items) == 1 ) {
                $order_data = $order->get_data();
                $live_data[$j]['user_name'] = $order_data['billing']['first_name'].' '.$order_data['billing']['last_name'];
                $live_data[$j]['state'] = WC()->countries->states[$order_data['billing']['country']][$order_data['billing']['state']];
                $live_data[$j]['country'] = WC()->countries->countries[$order_data['billing']['country']];
                $currency_symbol = $order_data['currency'];
                $live_data[$j]['order_created'] = lsnotification_time_elapsed_string($order_data['date_created']->date('Y-m-d H:i:s'));
                foreach ( $items as $item ) {
                    $product_id = $item->get_product_id();
                    $live_data[$j]['product_url'] = get_permalink($product_id);
                    $live_data[$j]['product_name'] = get_the_title($product_id);
                    $live_data[$j]['product_image'] = get_the_post_thumbnail_url($product_id);
                }
                array_push($db_value, $live_data[$j]);
                $j++;
            } else {              
                foreach ( $items as $item ) {
                    $order_data = $order->get_data();
                    $live_data[$j]['user_name'] = $order_data['billing']['first_name'].' '.$order_data['billing']['last_name'];
                    $live_data[$j]['state'] = WC()->countries->states[$order_data['billing']['country']][$order_data['billing']['state']];
                    $live_data[$j]['country'] = WC()->countries->countries[$order_data['billing']['country']];
                    $currency_symbol = $order_data['currency'];
                    $live_data[$j]['order_created'] = lsnotification_time_elapsed_string($order_data['date_created']->date('Y-m-d H:i:s'));
                    $product_id = $item->get_product_id();
                    $product = wc_get_product( $product_id );
                    $live_data[$j]['product_url'] = get_permalink($product_id);
                    $live_data[$j]['product_name'] = get_the_title($product_id);
                    $live_data[$j]['product_image'] = get_the_post_thumbnail_url($product_id);
                    array_push($db_value, $live_data[$j]);
                    $j++;
                }           
            } 
            $i++;           
        }  
        $values_in_JSON = json_encode($db_value);
        $script_params['live_json_data'] = $values_in_JSON;  
        wp_enqueue_script('notification_handle', plugin_dir_url(__FILE__).'js/notify_script.js', array( 'jquery' ), '', true);
        wp_localize_script( 'notification_handle', 'lsnConfigurations', $script_params );
    } 

    // Convert order date and time as string format
    function lsnotification_time_elapsed_string($datetime, $full = false) {
        $now = new DateTime;
        $ago = new DateTime($datetime);
        $diff = $now->diff($ago);
        $diff->w = floor($diff->d / 7);
        $diff->d -= $diff->w * 7;
        $string = array(
                    'y' => 'year',
                    'm' => 'month',
                    'w' => 'week',
                    'd' => 'day',
                    'h' => 'hour',
                    'i' => 'minute',
                    's' => 'second',
                );
        foreach ( $string as $k => &$v ) {
            if ( $diff->$k ) {
                $v = $diff->$k . ' ' . $v . ($diff->$k > 1 ? 's' : '');
            } else {
                unset($string[$k]);
            }
        }

        if ( !$full ) $string = array_slice($string, 0, 1);
        return $string ? implode(', ', $string) . '' : 'just now';
    }

    // Register the side menu in admin dashboard
    add_action( 'admin_menu', 'lsnotification_notification_settings_menu_page' );
    function lsnotification_notification_settings_menu_page() {
        add_menu_page( 'Sales Popup', 'Sales Popup', 'administrator', 'salespopup', 'lsnotification_notification_setting_menu_page',plugin_dir_url(__FILE__).'images/notification.png' ); 
        add_action ( 'admin_init', 'lsnotification_notification_settings_create' );
    }

    // Register our plugin settings 
    function lsnotification_notification_settings_create() {
        register_setting ( 'notification-settings', 'salespopup_mobile_support' );
        register_setting ( 'notification-settings', 'salespopup_start_time' ); 
        register_setting ( 'notification-settings', 'salespopup_showing_time' );
        register_setting ( 'notification-settings', 'salespopup_gap_time' );
        register_setting ( 'notification-settings', 'salespopup_admin_support' );
        register_setting ( 'notification-settings', 'salespopup_frequent_count' );
        register_setting ( 'notification-settings', 'salespopup_change_user_name' );
        register_setting ( 'notification-settings', 'salespopup_freeze_notification' );        
        register_setting ( 'notification-settings', 'salespopup_front_end_support' );        
        register_setting ( 'notification-settings', 'salespopup_csv_data' );  
        register_setting ( 'notification-settings', 'salespopup_notification_bg_color' );     
        register_setting ( 'notification-settings', 'salespopup_upload_status' );             
    }

    // Configuration form that can be visible for admin
    function lsnotification_notification_setting_menu_page() { ?>
        <div class="wrap">      
            <form method="post" action="options.php" enctype="multipart/form-data">
                <?php settings_fields('notification-settings'); ?>
                <?php do_settings_sections('notification-settings'); ?>
                <table class="form-table">
                    <tr valign="top"><td colspan="2"><h2 style="margin: 0px;"> Sales popup configuration </h2></td></tr>
                    <tr valign="top">
                        <th scope="row">Do you want to display live woocommerce orders?</th>
                        <td><label><input type="radio" onclick="csvOptionVisibility()" name="salespopup_csv_data" value="0" <?php checked(0, get_option('salespopup_csv_data'), true); ?>>&nbsp;Yes</label>
                            <label><input type="radio" onclick="csvOptionVisibility()" name="salespopup_csv_data" <?php if ( get_option('salespopup_csv_data') == '' ) { echo 'checked';} ?> value="1" <?php checked(1, get_option('salespopup_csv_data'), true); ?>>&nbsp;No (Please upload demo data)</label>
                            
                        </td>
                    </tr>
                    <tr valign="top" id="demo_file" style="display:none;"><th scope="row"></th><td><input id="upload_demo_file" type="file" name="upload_demo_file" onChange="updateUploadStatus()" style="float:left;"/>( <a href="#" onClick="downloadFile()"> Download "demo.csv" data</a> )<input id="salespopup_upload_status" type="hidden" name="salespopup_upload_status" value="<?php if ( get_option('salespopup_upload_status') == '' ) { echo '0';} else { echo get_option('salespopup_upload_status'); } ?>"/></td>
                    </tr>
                    <tr valign="top">
                        <th scope="row">Do you need notification for admin?</th>
                        <td><label><input type="radio" name="salespopup_admin_support" value="1" <?php checked(1, get_option('salespopup_admin_support'), true); ?>>&nbsp;Yes</label>
                            <label><input type="radio" name="salespopup_admin_support" <?php if ( get_option('salespopup_admin_support') == '' ) { echo 'checked';} ?> value="0" <?php checked(0, get_option('salespopup_admin_support'), true); ?>>&nbsp;No</label>
                        </td>
                    </tr>
                    <tr valign="top">
                        <th scope="row">Do you need notification for front end?</th>
                        <td><label><input type="radio" name="salespopup_front_end_support" <?php if ( get_option('salespopup_front_end_support') == '' ) { echo 'checked';} ?> value="1" <?php checked(1, get_option('salespopup_front_end_support'), true); ?>>Yes</label>
                            <label><input type="radio" name="salespopup_front_end_support" value="0" <?php checked(0, get_option('salespopup_front_end_support'), true); ?>>No</label></td>
                    </tr>
                    <tr valign="top">
                        <th scope="row">Do you need notification for mobile?</th>
                        <td><label><input type="radio" <?php if ( get_option('salespopup_mobile_support') == '' ) { echo 'checked';} ?> name="salespopup_mobile_support" value="1" <?php checked(1, get_option('salespopup_mobile_support'), true); ?>>&nbsp;Yes</label>
                            <label><input type="radio" name="salespopup_mobile_support" value="0" <?php checked(0, get_option('salespopup_mobile_support'), true); ?>>&nbsp;No</label>
                        </td>
                    </tr>
                    <tr valign="top">
                        <th scope="row">Do you want to display customer name?</th>
                        <td><label><input type="radio" name="salespopup_change_user_name" <?php if ( get_option('salespopup_change_user_name') == '' ) { echo 'checked';} ?> value="1" <?php checked(1, get_option('salespopup_change_user_name'), true); ?>>&nbsp;Yes</label>
                            <label><input type="radio" name="salespopup_change_user_name" value="0" <?php checked(0, get_option('salespopup_change_user_name'), true); ?>>&nbsp;No (Display as "Someone")</label>
                        </td>
                    </tr>
                    <tr valign="top">
                        <th scope="row">Sales popup after page loading of ___ seconds</th>
                        <td><input type="text" name="salespopup_start_time"
                            value="<?php echo get_option('salespopup_start_time'); ?>" /></td>
                    </tr>
                    <tr valign="top">
                        <th scope="row">Sales popup appear for ___ seconds</th>
                        <td><input type="text" name="salespopup_showing_time"
                            value="<?php echo get_option('salespopup_showing_time'); ?>" /></td>
                    </tr>
                    <tr valign="top">
                        <th scope="row">Time interval for the next sales popup in ___ seconds</th>
                        <td><input type="text" name="salespopup_gap_time"
                            value="<?php echo get_option('salespopup_gap_time'); ?>" /></td>
                    </tr>
                    <tr valign="top">
                        <th scope="row">How many times you want to show the sales popup in a page?</th>
                        <td><input type="text" name="salespopup_frequent_count"
                            value="<?php echo get_option('salespopup_frequent_count'); ?>" /></td>
                    </tr>
                    <tr valign="top">
                        <th scope="row">Do you want to freeze notification on mouse hover?</th>
                        <td><label><input type="radio" name="salespopup_freeze_notification" value="1" <?php checked(1, get_option('salespopup_freeze_notification'), true); ?>>&nbsp;Yes</label>
                            <label><input type="radio" <?php if ( get_option('salespopup_freeze_notification') == '' ) { echo 'checked';} ?> name="salespopup_freeze_notification" value="0" <?php checked(0, get_option('salespopup_freeze_notification'), true); ?>>&nbsp;No</label>
                        </td>
                    </tr>
                    <tr valign="top">
                        <th scope="row">Background color for notification (default: #ffffff)</th>
                        <td><input type="color" name="salespopup_notification_bg_color" value="<?php if ( get_option('salespopup_notification_bg_color') == '' ) { echo '#ffffff';} else { echo get_option('salespopup_notification_bg_color'); } ?>" /></td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
    <?php
    }     
    // Upload demo csv data
    if ( isset($_REQUEST['submit']) ){
        if ( $_FILES['upload_demo_file']['name'] != '' ) {
            $mimes = array('application/vnd.ms-excel','text/plain','text/csv','text/tsv');
            if ( in_array($_FILES['upload_demo_file']['type'],$mimes) ) {  
                $demo_writable_file = plugin_dir_path(__FILE__).'demo-csv/uploaded_demo_data.csv';
                if ( file_exists($demo_writable_file) ) {
                    unlink($demo_writable_file);
                }
                $demo_readable_file = $_FILES['upload_demo_file']['tmp_name'];
                $handle_writable = fopen($demo_writable_file, "w+");
                    $handle_readable = fopen($demo_readable_file, "r");
                    while ( !feof($handle_readable) ) {
                        fwrite($handle_writable, fgets($handle_readable));
                    }
                    fclose($handle_readable);
                    unset($handle_readable);
                fclose($handle_writable);
                unset($handle_writable);
            }
        }
        wp_cache_flush();     
    }