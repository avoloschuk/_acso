<?php
/**
 * Site header — port markup from prototype/*.html (.site-header).
 * Menus: register_nav_menus + wp_nav_menu() (TODO when chrome cut over).
 *
 * @package acso-child
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo('charset'); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<header class="site-header">
	<div class="container header-inner">
		<div class="logo">
			<a href="<?php echo esc_url(home_url('/')); ?>" class="logo-link" aria-label="<?php esc_attr_e('На головну', 'acso-child'); ?>">
				<?php
				// Logo mark: place logo_mark.png in assets/img/ when cutting over from prototype.
				?>
			</a>
		</div>
		<nav class="main-nav" id="main-nav" aria-label="<?php esc_attr_e('Головне меню', 'acso-child'); ?>">
			<?php
			wp_nav_menu(
				array(
					'theme_location' => 'primary',
					'container'      => false,
					'menu_class'     => 'main-nav__list',
					'fallback_cb'    => false,
				)
			);
			?>
		</nav>
		<button type="button" class="mobile-menu-toggle" aria-label="<?php esc_attr_e('Відкрити меню', 'acso-child'); ?>" aria-expanded="false" aria-controls="main-nav">
			<span></span><span></span><span></span>
		</button>
	</div>
</header>
