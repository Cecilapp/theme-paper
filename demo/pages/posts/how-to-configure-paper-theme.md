---
title: How to configure the Paper theme
author: Cecil
date: 2026-10-20T10:00:00Z
updated: 2026-10-25T08:00:00Z
featured: true
tags:
  - configuration
  - docs
description: How you can make the Paper theme absolutely yours.
---

This guide covers the available configuration options of the Paper theme, a port of [AstroPaper](https://github.com/satnaing/astro-paper) for [Cecil](https://cecil.app).

[toc]

## Install the theme

Allow the theme installer plugin, then require the theme with Composer:

```bash
composer require cecil/theme-paper
```

The [dark mode toggle](https://github.com/Cecilapp/theme-darkmodetoggle) component theme is installed as a dependency. Declare both themes in the configuration file (`cecil.yml`):

```yaml
theme:
  - paper
  - darkmodetoggle
```

:::tip
Install the [FlexSearch](https://github.com/Cecilapp/theme-flexsearch) component theme to add a search button in the header: `composer require cecil/theme-flexsearch`, then add `flexsearch` at the top of the `theme` list.
:::

## Site metadata

Paper relies on the standard Cecil configuration for the site metadata, used by the built-in metatags (title, description, Open Graph, Twitter cards, JSON-LD) and by the feeds:

```yaml
title: Paper
description: A minimal, responsive and SEO-friendly Cecil blog theme.
baseurl: https://example.com/
author:
  name: Your Name
  url: https://example.com/about/
language: en
```

## Theme options

All the options are namespaced under `paper`, with these default values:

```yaml
paper:
  posts:
    section: posts # section containing the blog posts
    home: 4        # number of recent posts displayed on the homepage
  dir: ltr         # text direction: ltr or rtl
  archives: true   # displays the archives link in the header
  back_button: true # displays the "Go back" button on posts
  edit:
    url: ''        # e.g.: https://github.com/<user>/<repo>/edit/main/pages/
  og:
    dynamic: true  # generates Open Graph images of posts without `image`
```

The number of posts per page is the Cecil pagination option (4 by default with Paper):

```yaml
pages:
  pagination:
    max: 4
```

## Menu

The header menu is the Cecil `main` menu. Paper defines the _Posts_ and _Tags_ entries, add your own entries (or pages with `menu: main` in their front matter):

```yaml
menus:
  main:
    - {id: about, name: About, url: about, weight: 30}
```

The archives link, the search button (with FlexSearch) and the light/dark toggle are always displayed after the menu entries.

## Social links

Social links are displayed in the footer and on the homepage:

```yaml
paper:
  socials:
    - {name: github, url: 'https://github.com/username'}
    - {name: x, url: 'https://x.com/username'}
    - {name: linkedin, url: 'https://www.linkedin.com/in/username/'}
    - {name: mail, url: 'mailto:yourmail@example.com'}
```

Available icons are `github`, `x`, `linkedin`, `facebook`, `telegram`, `whatsapp`, `pinterest` and `mail`. Add your own SVG icons in `assets/paper/icons/<name>.svg`. The link title can be customized with the `title` key.

## Share links

Posts display share links (WhatsApp, Facebook, X, Telegram, Pinterest and email by default). Customize them, or disable them with `false`:

```yaml
paper:
  share:
    - {name: x, url: 'https://x.com/intent/post?url='}
    - {name: mail, url: 'mailto:?subject=See%20this%20post&body='}
```

## Edit page link

Set the URL of your repository to display an _Edit page_ link on posts, followed by the path of the Markdown file relative to the `pages` directory:

```yaml
paper:
  edit:
    url: https://github.com/username/repository/edit/main/pages/
```

Hide it on a post with `hide_edit: true` in the front matter.

## Colors

Colors are CSS custom properties: override them in a stylesheet of your site, loaded after the theme one (extend the `head_css` block of the `page.html.twig` layout):

```css
:root,
[data-theme='light'] {
  --background: #fdfdfd;
  --foreground: #282728;
  --accent: #006cac;
  --accent-foreground: #ffffff;
  --muted: #e6e6e6;
  --muted-foreground: #6b7280;
  --border: #ece9e9;
}

[data-theme='dark'] {
  --background: #212737;
  --foreground: #eaedf3;
  --accent: #ff6b01;
  --accent-foreground: #ffffff;
  --muted: #343f60;
  --muted-foreground: #afb9ca;
  --border: #ab4b08;
}
```

The font can be changed with the `--paper-font` custom property.