<?php
/**
 * ACSO child theme — enqueue + CPT hooks (extend as WP build progresses).
 *
 * Asset parity with prototype/:
 *   prototype/style.css          → assets/css/main.css
 *   prototype/js/*.js            → assets/js/
 *   prototype/data/*.json        → assets/data/
 *   prototype/fonts/*.woff2      → assets/fonts/
 *
 * After design changes in prototype/, re-sync assets before theme deploy
 * (see README.md). Do not edit plugins; use hooks only.
 *
 * @package acso-child
 */

declare(strict_types=1);

if (!defined('ABSPATH')) {
	exit;
}

define('ACSO_CHILD_VERSION', '0.1.0');

/**
 * Theme supports + menus.
 */
function acso_child_setup(): void {
	add_theme_support('title-tag');
	add_theme_support('post-thumbnails');
	register_nav_menus(
		array(
			'primary' => __('Primary', 'acso-child'),
			'footer'  => __('Footer sitemap', 'acso-child'),
		)
	);
}
add_action('after_setup_theme', 'acso_child_setup');

/**
 * Styles + modular front scripts (same order as prototype/js/main.js header).
 */
function acso_child_enqueue_assets(): void {
	$uri = get_stylesheet_directory_uri();
	$path = get_stylesheet_directory();
	$ver = ACSO_CHILD_VERSION;

	wp_enqueue_style(
		'acso-child-main',
		$uri . '/assets/css/main.css',
		array(),
		file_exists($path . '/assets/css/main.css') ? (string) filemtime($path . '/assets/css/main.css') : $ver
	);

	$scripts = array(
		'acso-util'             => 'util.js',
		'acso-news-mosaic-data' => 'news-mosaic-data.js',
		'acso-news-mosaic'      => 'news-mosaic.js',
		'acso-home-hero'        => 'home-hero.js',
		'acso-dir-slider'       => 'dir-slider.js',
		'acso-archive-filters'  => 'archive-filters.js',
		'acso-network-map'      => 'network-map.js',
		'acso-ui-chrome'        => 'ui-chrome.js',
		'acso-main'             => 'main.js',
	);

	$prev = null;
	foreach ($scripts as $handle => $file) {
		$deps = $prev ? array($prev) : array();
		$file_path = $path . '/assets/js/' . $file;
		wp_enqueue_script(
			$handle,
			$uri . '/assets/js/' . $file,
			$deps,
			file_exists($file_path) ? (string) filemtime($file_path) : $ver,
			true
		);
		$prev = $handle;
	}

	// Prototype-only i18n demo is NOT enqueued — use Polylang in production.
}
add_action('wp_enqueue_scripts', 'acso_child_enqueue_assets');

/**
 * Body classes for page-type CSS (mirrors prototype body.page--*).
 */
function acso_child_body_class(array $classes): array {
	$classes[] = 'page';

	if (is_front_page()) {
		$classes[] = 'page--home';
	} elseif (is_page('about') || is_page('pro-nas')) {
		$classes[] = 'page--about';
	} elseif (is_page('democracy') || is_page('mistseva-demokratiya')) {
		$classes[] = 'page--democracy';
	} elseif (is_page('directions') || is_page('napryamy')) {
		$classes[] = 'page--directions';
	}

	return $classes;
}
add_filter('body_class', 'acso_child_body_class');

/**
 * Register CPT stubs (slugs aligned with stack rules). Content TBD.
 */
function acso_child_register_cpts(): void {
	$types = array(
		'analytics'    => array('Аналітика', 'Аналітика', 'analytics'),
		'library'      => array('Бібліотека', 'Бібліотека', 'library'),
		'asn_news'     => array('Новини Асоціації', 'Новина', 'news'),
		'partner_post' => array('Блог партнерів', 'Матеріал партнера', 'partners'),
	);

	foreach ($types as $slug => $labels) {
		register_post_type(
			$slug,
			array(
				'labels'       => array(
					'name'          => $labels[0],
					'singular_name' => $labels[1],
				),
				'public'       => true,
				'has_archive'  => true,
				'rewrite'      => array('slug' => $labels[2]),
				'show_in_rest' => true,
				'menu_icon'    => 'dashicons-media-document',
				'supports'     => array('title', 'editor', 'thumbnail', 'excerpt', 'author'),
			)
		);
	}

	register_taxonomy(
		'topic',
		array_keys($types),
		array(
			'label'        => 'Тематичні напрями',
			'public'       => true,
			'hierarchical' => true,
			'show_in_rest' => true,
			'rewrite'      => array('slug' => 'topic'),
		)
	);
}
add_action('init', 'acso_child_register_cpts');
