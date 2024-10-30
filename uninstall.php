<?php
/**
 * Live sales notification plugin uninstall
 */
defined( 'WP_UNINSTALL_PLUGIN' ) || exit;
global $wpdb;
// Delete options.
$wpdb->query( "DELETE FROM $wpdb->options WHERE option_name LIKE 'salespopup\_%';" );
// Clear any cached data that has been removed.
wp_cache_flush();