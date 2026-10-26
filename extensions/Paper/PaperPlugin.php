<?php

namespace Paper;

use Cecil\Plugin\AbstractPlugin;
use Cecil\Plugin\Registry;

/**
 * Paper theme plugin.
 *
 * Registers the extensions of the theme, declared once in the theme configuration (`extensions.plugins`).
 */
class PaperPlugin extends AbstractPlugin
{
    public function register(Registry $registry): void
    {
        // `paper_group_by_date` filter and `paper_og_image` function
        $registry->twigExtension(Twig\PaperExtension::class);
    }
}
