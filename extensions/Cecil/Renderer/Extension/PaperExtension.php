<?php

namespace Cecil\Renderer\Extension;

use Cecil\Asset;
use Cecil\Builder;
use Cecil\Cache;
use Cecil\Collection\Page\Page;
use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;
use Twig\TwigFunction;

/**
 * Paper theme Twig extension.
 */
class PaperExtension extends AbstractExtension
{
    /** Open Graph image size. */
    private const OG_WIDTH = 1200;
    private const OG_HEIGHT = 628;

    /** @var Builder */
    protected $builder;

    public function __construct(Builder $builder)
    {
        $this->builder = $builder;
    }

    public function getFilters(): array
    {
        return [
            new TwigFilter('paper_group_by_date', [$this, 'groupByDate']),
        ];
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('paper_og_image', [$this, 'ogImage']),
        ];
    }

    /**
     * Groups pages by year, then by month (keys are kept in pages order).
     *
     * @return array<string, array<string, array<Page>>>
     */
    public function groupByDate(iterable $pages): array
    {
        $grouped = [];

        /** @var Page $page */
        foreach ($pages as $page) {
            $date = $page->getVariable('date');
            if (!$date instanceof \DateTimeInterface) {
                continue;
            }
            $grouped[$date->format('Y')][$date->format('m')][] = $page;
        }

        return $grouped;
    }

    /**
     * Generates the Open Graph image of a page (title, author and site title), or of the site (title and description).
     * Returns null if the image can't be generated (GD with FreeType is required).
     */
    public function ogImage(?Page $page = null): ?Asset
    {
        if (!\function_exists('imagettftext')) {
            $this->builder->getLogger()->debug('Paper: GD with FreeType support is required to generate Open Graph images.');

            return null;
        }

        $config = $this->builder->getConfig();
        $siteTitle = (string) $config->get('title');
        $author = $page?->getVariable('author') ?? $config->get('author');
        $author = \is_array($author) ? (string) ($author['name'] ?? '') : (string) $author;

        if ($page !== null) {
            $title = (string) $page->getVariable('title');
            $footer = $author !== '' ? ['by ', $author] : ['', ''];
            $path = '/' . trim((string) $page->getPath(), '/') . '/og.png';
        } else {
            $title = $siteTitle;
            $footer = ['', (string) $config->get('description')];
            $path = '/og.png';
        }
        $path = str_replace('//', '/', $path);

        try {
            $background = new Asset($this->builder, 'paper/og-background.png');
            $regular = new Asset($this->builder, 'paper/fonts/GoogleSansCode-Regular.ttf');
            $bold = new Asset($this->builder, 'paper/fonts/GoogleSansCode-Bold.ttf');
        } catch (\Exception $e) {
            $this->builder->getLogger()->warning(\sprintf('Paper: unable to generate the Open Graph image "%s" (%s).', $path, $e->getMessage()));

            return null;
        }

        $hash = hash('xxh128', implode('|', [$title, $footer[0], $footer[1], $siteTitle, $background['hash'], $regular['hash'], $bold['hash']]));
        $cache = new Cache($this->builder, 'paper');
        $cacheKey = 'og_' . $hash;
        if (!$cache->has($cacheKey)) {
            $png = $this->drawOgImage($background['file'], $regular['file'], $bold['file'], $title, $footer, $siteTitle);
            if ($png === null) {
                return null;
            }
            $cache->set($cacheKey, base64_encode($png));
            $this->builder->getLogger()->debug(\sprintf('Paper: Open Graph image "%s" generated.', $path));
        }
        $png = base64_decode((string) $cache->get($cacheKey));

        // stores the image as the content of an asset, saved with the other assets
        $contentFile = (new Cache($this->builder, 'assets'))->getContentFile($path);
        if (!is_file($contentFile) || hash_file('xxh128', $contentFile) !== hash('xxh128', $png)) {
            if (!is_dir(\dirname($contentFile))) {
                mkdir(\dirname($contentFile), 0777, true);
            }
            file_put_contents($contentFile, $png);
        }
        $background['path'] = $path;
        $background['content'] = $png;
        $background['hash'] = hash('xxh128', $png);
        $background['size'] = \strlen($png);
        $background['width'] = self::OG_WIDTH;
        $background['height'] = self::OG_HEIGHT;

        return $background;
    }

    /**
     * Draws the Open Graph image and returns its PNG binary.
     *
     * @param array{string, string} $footer prefix and bold text of the bottom left line
     */
    private function drawOgImage(string $backgroundFile, string $regularFont, string $boldFont, string $title, array $footer, string $siteTitle): ?string
    {
        $background = @imagecreatefromstring((string) file_get_contents($backgroundFile));
        if ($background === false) {
            return null;
        }
        $image = imagecreatetruecolor(self::OG_WIDTH, self::OG_HEIGHT);
        imagecopyresampled($image, $background, 0, 0, 0, 0, self::OG_WIDTH, self::OG_HEIGHT, imagesx($background), imagesy($background));
        imagedestroy($background);
        $black = imagecolorallocate($image, 0, 0, 0);

        // text box (inner card of the background)
        $left = 110;
        $right = self::OG_WIDTH - 110;
        $top = 105;
        $bottom = self::OG_HEIGHT - 100;
        $maxWidth = $right - $left;

        // title: the biggest font size that fits in 4 lines
        $titleBottom = $bottom - 70;
        foreach ([64, 56, 48, 42, 36] as $size) {
            $lines = $this->wrap($title, $boldFont, $size, $maxWidth);
            $lineHeight = (int) round($size * 1.35);
            if (\count($lines) * $lineHeight <= $titleBottom - $top) {
                break;
            }
        }
        $lines = \array_slice($lines, 0, max(1, intdiv($titleBottom - $top, $lineHeight)));
        $y = $top + $size;
        foreach ($lines as $line) {
            imagettftext($image, $size, 0, $left, $y, $black, $boldFont, $line);
            $y += $lineHeight;
        }

        // footer: "by <author>" on the left, site title on the right
        $footerSize = 22;
        $x = $left;
        if ($footer[0] !== '') {
            $box = imagettfbbox($footerSize, 0, $regularFont, $footer[0]);
            imagettftext($image, $footerSize, 0, $x, $bottom, $black, $regularFont, $footer[0]);
            $x += $box[2] - $box[0];
        }
        $siteBox = imagettfbbox($footerSize, 0, $boldFont, $siteTitle);
        $siteWidth = $siteBox[2] - $siteBox[0];
        if ($footer[1] !== '') {
            $text = $this->ellipsis($footer[1], $footer[0] !== '' ? $boldFont : $regularFont, $footerSize, $right - $siteWidth - 40 - $x);
            imagettftext($image, $footerSize, 0, $x, $bottom, $black, $footer[0] !== '' ? $boldFont : $regularFont, $text);
        }
        imagettftext($image, $footerSize, 0, $right - $siteWidth, $bottom, $black, $boldFont, $siteTitle);

        ob_start();
        imagepng($image, null, 9);
        imagedestroy($image);

        return (string) ob_get_clean();
    }

    /**
     * Wraps a text in lines that fit in a width.
     *
     * @return string[]
     */
    private function wrap(string $text, string $font, float $size, int $width): array
    {
        $lines = [];
        $line = '';
        foreach (preg_split('/\s+/u', trim($text)) ?: [] as $word) {
            $candidate = $line === '' ? $word : "$line $word";
            $box = imagettfbbox($size, 0, $font, $candidate);
            if ($line !== '' && ($box[2] - $box[0]) > $width) {
                $lines[] = $line;
                $line = $word;
                continue;
            }
            $line = $candidate;
        }
        if ($line !== '') {
            $lines[] = $line;
        }

        return $lines;
    }

    /**
     * Truncates a text with an ellipsis to fit in a width.
     */
    private function ellipsis(string $text, string $font, float $size, int $width): string
    {
        $box = imagettfbbox($size, 0, $font, $text);
        if (($box[2] - $box[0]) <= $width) {
            return $text;
        }
        while (mb_strlen($text) > 1) {
            $text = mb_substr($text, 0, -1);
            $box = imagettfbbox($size, 0, $font, "$text…");
            if (($box[2] - $box[0]) <= $width) {
                break;
            }
        }

        return "$text…";
    }
}
