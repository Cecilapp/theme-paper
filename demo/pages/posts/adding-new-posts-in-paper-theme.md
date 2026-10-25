---
title: Adding new posts in the Paper theme
author: Cecil
date: 2026-10-22T09:00:00Z
featured: true
tags:
  - docs
  - markdown
description: Some rules & recommendations for creating or adding new posts using the Paper theme.
---

Here are some rules and recommendations, tips & tricks for creating new posts in the Paper blog theme.

[toc]

## Creating a blog post

To write a new blog post, create a Markdown file inside the `pages/posts/` directory.

```plaintext
pages/
└── posts/
    ├── _drafts/
    │   └── an-unfinished-post.md
    ├── 2026/
    │   └── example-post.md
    └── adding-new-post.md
```

The post URL is built from its file name (or its `slug`): `pages/posts/adding-new-post.md` is published at `/posts/adding-new-post/`.

## Front matter

The front matter is the YAML block at the top of the post:

| Property      | Description                                                                 | Remark                    |
| ------------- | --------------------------------------------------------------------------- | ------------------------- |
| `title`       | Title of the post (`h1`)                                                    | required                  |
| `description` | Description of the post, used in the posts lists and the meta tags          | recommended               |
| `date`        | Published date                                                              | required                  |
| `updated`     | Modified date (displayed instead of `date` when more recent)                | optional                  |
| `author`      | Author of the post                                                          | default: `author`         |
| `tags`        | Tags of the post                                                            | optional                  |
| `featured`    | Displays the post in the _Featured_ section of the homepage                 | default: `false`          |
| `draft`       | Unpublishes the post                                                        | default: `false`          |
| `schedule`    | Publishes the post at a date (`publish`) until a date (`expiry`)            | optional                  |
| `image`       | Open Graph image (otherwise an image is generated)                          | optional                  |
| `canonical`   | Canonical URL (`{url: https://…}`), if the post is published elsewhere      | optional                  |
| `hide_edit`   | Hides the _Edit page_ link                                                  | default: `false`          |

Sample front matter:

```yaml
---
title: The title of the post
description: Some description about the post.
date: 2026-09-25T04:58:53Z
updated: 2026-10-10T12:00:00Z
author: Your Name
featured: true
tags:
  - some
  - example
  - tags
---
```

## Table of contents

Add `[toc]` where the table of contents should be displayed (`h2` and `h3` headings by default).

## Headings

There's one thing to note about headings: the post title is the main heading (`h1`), so the rest of the headings should start from `h2`.

## Callouts

Callouts are Cecil notes:

```markdown
:::tip
Helpful advice, shortcuts, or best practices.
:::
```

:::note
Supplementary information the reader should be aware of.
:::

:::info
Neutral informational context — less urgent than a note.
:::

:::tip
Helpful advice, shortcuts, or best practices.
:::

:::important
Crucial information necessary for users to succeed.
:::

:::warning
Something that could go wrong or have unintended consequences.
:::

:::caution
Serious risk of failure, data loss, or incorrect behavior.
:::

:::success
Confirmation that something worked or is correct.
:::

## Steps and accordions

Cecil provides more notes types, such as steps:

:::steps
#### Install the theme
Run `composer require cecil/theme-paper`.

#### Enable the theme
Add `paper` to the `theme` list.

#### Build
Run `php cecil.phar build`.
:::

And accordions:

:::accordion
#### What is Cecil?
Cecil is a CLI application that merges plain text files (written in Markdown), images and Twig templates to generate a static website.

#### What is AstroPaper?
AstroPaper is a minimal, responsive, accessible and SEO-friendly Astro blog theme, the original of this theme.
:::

## Code blocks

Code blocks are highlighted at build time, and a copy button is added:

```php
<?php
$builder = new Cecil\Builder($config);
$builder->build();
```

## Images

Images are stored in the `assets/` directory, then referenced with an absolute path:

```markdown
![A picture of the Paper theme](/images/paper.png)
```

Click on an image to zoom it.

## Footnotes

Footnotes are supported[^1].

[^1]: Here is the footnote.