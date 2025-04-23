# Simple Markdown Blog Generator

This is a minimal static blog system for writing and publishing blog posts in Markdown. It supports:
  - YAML front matter for post metadata (title, date, description, tags, draft/publish)
  - Jinja2 templates for layout, index, RSS feed, and sitemap
  - SEO optimizations: meta tags, Open Graph, Twitter cards, RSS, and sitemap
  - Easy customization of styles and templates

## Directory Structure

```
blog/
├── config.yaml           # Site configuration
├── build.py              # Build script (static site generator)
├── Makefile              # convenience targets: html, clean
├── posts_md/             # source Markdown files
│   └── *.md
├── posts/                # generated HTML posts (output)
├── templates/            # Jinja2 templates
│   ├── base.html
│   ├── index.html
│   ├── post.html
│   ├── feed.xml
│   └── sitemap.xml
└── static/               # static assets
    └── css/style.css
```

## Prerequisites

- Python 3.6+
- [pip](https://pip.pypa.io/) package manager
- Install required packages:
  ```bash
  pip install pyyaml markdown jinja2 pygments
  ```

## Configuration (`config.yaml`)

Edit `config.yaml` to suit your site:

```yaml
site_name: My Blog            # Your blog title
site_url: https://pjankiewicz.github.io/blog  # Base URL (no trailing slash)
author: Your Name             # Site author for footer
description: "Short description of your blog."
posts_dir: posts_md           # Source markdown directory
posts_output_dir: posts       # Output HTML directory
templates_dir: templates      # Jinja2 templates directory
static_dir: static            # Static assets directory
output_dir: .                 # Root output directory
```

## Writing Posts

1. Create a Markdown file in `posts_md/` with a `.md` extension.
2. Include a YAML front matter block at the top:
   ```yaml
   ---
   title: "My First Post"
   date: "2025-04-19"           # YYYY-MM-DD or ISO
   description: "Short summary." # Optional meta description
   tags: [news, updates]         # Optional tags array
   publish: true                 # Set false to skip drafts
   ---
   ```
3. Write your content in Markdown below the front matter.

## Building the Site

From within the `blog/` directory, run:

```bash
make html       # or: python3 build.py
```

- Generated files:
  - `index.html` (home page)
  - `posts/<slug>/index.html` (one directory per post)
  - `feed.xml` (RSS 2.0 feed)
  - `sitemap.xml` (XML sitemap)
  - `static/` copied as-is

## Cleaning

To remove all generated files:
```bash
make clean
```

## Deployment

Upload the contents of the `blog/` directory (after build) to your web server or hosting platform. Ensure the following are accessible:
- `/index.html`
- `/posts/<slug>/index.html` for each post
- `/feed.xml`, `/sitemap.xml`
- `/static/css/style.css` (and any other static assets)

## Customization

- **Templates:** Customize HTML in `templates/` (base layout, post view, index, feed, sitemap).
- **Styles:** Edit `static/css/style.css` for typography, colors, and layout tweaks.
- **Extensions:** Modify `build.py` to add Markdown extensions or asset pipelines.

---
Happy blogging! ✍️