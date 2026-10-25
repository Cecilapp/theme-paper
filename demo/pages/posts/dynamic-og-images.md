---
title: Dynamic OG image generation in Paper blog posts
author: Cecil
date: 2026-10-24T15:00:00Z
featured: false
tags:
  - docs
  - SEO
description: The Paper theme generates the Open Graph image of each post, from its title, author and the site title.
---

OG images (aka social images) play an important role in social media engagement: they are displayed when a page is shared on a social network or a messaging app.

## Introduction

Writing a post is enough: if the post has no `image` in its front matter, the Paper theme generates an Open Graph image (1200 × 628 pixels) with:

- the title of the post
- its author
- the title of the site

The image is published next to the post (e.g.: `/posts/dynamic-og-images/og.png`) and referenced by the built-in Cecil metatags. Other pages share an image generated with the title and the description of the site (`/og.png`), unless the site `image` option is set.

## Requirements

Images are generated with the PHP [GD extension](https://www.php.net/manual/book.image.php), compiled with FreeType support. Without it, the default metatags behavior is used.

## Customization

- The background of the image is `assets/paper/og-background.png`: override it with your own `assets/paper/og-background.png` (1200 × 628 pixels).
- The fonts are `assets/paper/fonts/GoogleSansCode-Regular.ttf` and `assets/paper/fonts/GoogleSansCode-Bold.ttf`.
- Disable the generation with the `paper.og.dynamic` option:

```yaml
paper:
  og:
    dynamic: false
```

Use the `image` front matter variable to define the image of a post:

```yaml
---
title: My post
image: /images/my-post.png
---
```

:::info
Generated images are cached: they are generated again only when the title, the author or the site title change.
:::