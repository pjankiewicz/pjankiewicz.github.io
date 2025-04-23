\
#!/usr/bin/env python3
import os
import sys
import yaml
import markdown
import jinja2
import datetime
import re
import collections
import shutil

def slugify(text):
    """Generate URL-friendly slug from text."""
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def parse_front_matter(content):
    """Extract YAML front matter and markdown body."""
    if content.strip().startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            fm = parts[1]
            body = parts[2]
            try:
                data = yaml.safe_load(fm) or {}
                return data, body.lstrip('\\n')
            except yaml.YAMLError as e:
                print(f"YAML parse error: {e}", file=sys.stderr)
    return {}, content

def format_date(date_str):
    """Parse date string and return datetime, nice format, and RFC2822 format."""
    try:
        dt = datetime.datetime.fromisoformat(date_str)
    except Exception:
        try:
            dt = datetime.datetime.strptime(date_str, '%Y-%m-%d')
        except Exception:
            dt = datetime.datetime.now()
    nice = dt.strftime('%B %d, %Y')
    rfc = dt.strftime('%a, %d %b %Y %H:%M:%S +0000')
    return dt, nice, rfc

def build():
    # Change working directory to script location
    here = os.path.dirname(os.path.abspath(__file__))
    os.chdir(here)

    # Load configuration
    with open('config.yaml', 'r', encoding='utf-8') as f:
        config = yaml.safe_load(f)

    # Paths from config
    posts_dir = config.get('posts_dir', 'posts_md')
    posts_out = config.get('posts_output_dir', 'posts')
    tags_out = config.get('tags_output_dir', 'tags') # New config option for tags output
    templates_dir = config.get('templates_dir', 'templates')
    output_dir = config.get('output_dir', '.')
    site_url = config.get('site_url', '').rstrip('/')

    # Prepare output posts directory
    out_posts_dir = os.path.join(output_dir, posts_out)
    if os.path.exists(out_posts_dir):
        shutil.rmtree(out_posts_dir)
    os.makedirs(out_posts_dir, exist_ok=True)

    # Prepare output tags directory
    out_tags_dir = os.path.join(output_dir, tags_out)
    if os.path.exists(out_tags_dir):
        shutil.rmtree(out_tags_dir)
    os.makedirs(out_tags_dir, exist_ok=True)

    # Load Jinja2 environment
    env = jinja2.Environment(loader=jinja2.FileSystemLoader(templates_dir))
    env.filters['slugify'] = slugify

    # Collect posts and tags
    posts = []
    tags_collection = collections.defaultdict(list)

    for fname in sorted(os.listdir(posts_dir)):
        if not fname.endswith('.md'):
            continue
        path = os.path.join(posts_dir, fname)
        with open(path, 'r', encoding='utf-8') as f:
            raw = f.read()

        meta, body = parse_front_matter(raw)
        if not meta.get('publish', True):
            continue

        title = meta.get('title') or os.path.splitext(fname)[0]
        dt, nice_date, rfc_date = format_date(meta.get('date', ''))
        post_slug = slugify(meta.get('slug') or os.path.splitext(fname)[0])
        url = f"/{posts_out}/{post_slug}/index.html"

        # Meta description
        desc = meta.get('description')
        if not desc:
            first_para = body.strip().split('\\n\\n')[0]
            desc = re.sub('<[^>]+>', '', markdown.markdown(first_para))

        # Render markdown to HTML
        html_content = markdown.markdown(body, extensions=['fenced_code', 'codehilite', 'toc', 'tables'])

        post_data = {
            'title': title,
            'date': nice_date,
            'date_rfc': rfc_date,
            'slug': post_slug,
            'url': url,
            'content': html_content,
            'description': desc,
            'tags': meta.get('tags', []),
            'meta': meta,
        }
        posts.append((dt, post_data))

        # Collect tags
        for tag in post_data['tags']:
            tags_collection[tag].append(post_data)

    # Sort posts by date descending
    posts.sort(key=lambda x: x[0], reverse=True)
    posts = [p[1] for p in posts]

    # Common template context
    ctx = {
        'config': config,
        'current_year': datetime.datetime.now().year,
        'site_url': site_url,
    }

    # Render individual post pages
    post_tpl = env.get_template('post.html')
    for post in posts:
        dest_dir = os.path.join(output_dir, posts_out, post['slug'])
        os.makedirs(dest_dir, exist_ok=True)
        output_html = post_tpl.render(
            **ctx,
            title=post['title'],
            content=post['content'],
            meta_description=post['description'],
            canonical_url=site_url + post['url'],
            date=post['date'],
            tags=post['tags'],
            meta_image=post['meta'].get('image'),
        )
        with open(os.path.join(dest_dir, 'index.html'), 'w', encoding='utf-8') as f:
            f.write(output_html)

    # Render individual tag pages
    tag_tpl = env.get_template('tag_index.html')
    for tag, tag_posts in tags_collection.items():
        tag_slug = slugify(tag)
        dest_dir = os.path.join(output_dir, tags_out, tag_slug)
        os.makedirs(dest_dir, exist_ok=True)
        # Sort posts for this tag by date
        tag_posts.sort(key=lambda p: datetime.datetime.strptime(p['date'], '%B %d, %Y'), reverse=True)
        tag_url = f"{site_url}/{tags_out}/{tag_slug}/"
        output_html = tag_tpl.render(
            **ctx,
            title=f"Posts tagged '{tag}'",
            meta_description=f"Blog posts tagged with {tag}",
            canonical_url=tag_url,
            tag_name=tag,
            posts=tag_posts
        )
        with open(os.path.join(dest_dir, 'index.html'), 'w', encoding='utf-8') as f:
            f.write(output_html)

    # Render index page
    index_tpl = env.get_template('index.html')
    index_html = index_tpl.render(
        **ctx,
        title='Home',
        meta_description=config.get('description', ''),
        canonical_url=site_url + '/',
        posts=posts,
    )
    with open(os.path.join(output_dir, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(index_html)

    # Render main tags list page
    if 'tags.html' in env.list_templates():
        tags_list_tpl = env.get_template('tags.html')
        tags_data = {tag: len(posts) for tag, posts in tags_collection.items()}
        tags_list_html = tags_list_tpl.render(
            **ctx,
            title='All Tags',
            meta_description='List of all tags used in the blog.',
            canonical_url=f"{site_url}/{tags_out}/",
            tags=tags_data
        )
        tags_list_page_path = os.path.join(output_dir, tags_out, 'index.html')
        with open(tags_list_page_path, 'w', encoding='utf-8') as f:
            f.write(tags_list_html)

    # Render RSS feed
    feed_tpl = env.get_template('feed.xml')
    feed_xml = feed_tpl.render(**ctx, posts=posts)
    with open(os.path.join(output_dir, 'feed.xml'), 'w', encoding='utf-8') as f:
        f.write(feed_xml)

    # Render sitemap
    sitemap_tpl = env.get_template('sitemap.xml')
    # Add tag pages to sitemap context if needed
    all_pages_for_sitemap = posts + [{'url': f"/{tags_out}/{slugify(tag)}.html", 'date_rfc': datetime.datetime.now().strftime('%Y-%m-%d')} for tag in tags_collection.keys()]
    # Add main tags page if it exists
    if 'tags.html' in env.list_templates():
         all_pages_for_sitemap.append({'url': f"/{tags_out}/index.html", 'date_rfc': datetime.datetime.now().strftime('%Y-%m-%d')})

    sitemap_xml = sitemap_tpl.render(**ctx, posts=all_pages_for_sitemap) # Pass combined list or adjust template
    with open(os.path.join(output_dir, 'sitemap.xml'), 'w', encoding='utf-8') as f:
        f.write(sitemap_xml)

    print("Build complete.")

if __name__ == "__main__":
    build()

