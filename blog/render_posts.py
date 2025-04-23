import os
import glob
import yaml
import markdown
from datetime import datetime

POSTS_MD_DIR = 'posts_md'
POSTS_HTML_DIR = 'posts'
LAYOUT_FILE = 'layout.html'
INDEX_HTML_FILE = 'index.html'

def parse_front_matter(content):
    """Parses YAML front matter from Markdown content."""
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            try:
                front_matter = yaml.safe_load(parts[1])
                md_content = parts[2].strip()
                return front_matter, md_content
            except yaml.YAMLError:
                pass # Fallback if YAML is invalid
    return {}, content # No valid front matter found

def render_markdown(md_content):
    """Converts Markdown text to HTML."""
    return markdown.markdown(md_content, extensions=['fenced_code', 'tables'])

def main():
    # Ensure output directory exists
    if not os.path.exists(POSTS_HTML_DIR):
        os.makedirs(POSTS_HTML_DIR)

    # Read layout template
    try:
        with open(LAYOUT_FILE, 'r', encoding='utf-8') as f:
            layout_template = f.read()
    except FileNotFoundError:
        print(f"Error: Layout file '{LAYOUT_FILE}' not found.")
        return

    posts_data = []
    md_files = glob.glob(os.path.join(POSTS_MD_DIR, '*.md'))

    # Process each markdown post
    for md_file_path in md_files:
        print(f"Processing: {md_file_path}")
        try:
            with open(md_file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            front_matter, md_content = parse_front_matter(content)
            html_content = render_markdown(md_content)

            # Extract metadata (with defaults)
            title = front_matter.get('title', 'Untitled Post')
            pub_date_str = front_matter.get('date', datetime.now().strftime('%Y-%m-%d'))
            try:
                pub_date = datetime.strptime(pub_date_str, '%Y-%m-%d')
            except ValueError:
                print(f"Warning: Invalid date format '{pub_date_str}' in {md_file_path}. Using today.")
                pub_date = datetime.now()

            base_filename = os.path.splitext(os.path.basename(md_file_path))[0]
            output_filename = f"{base_filename}.html"
            output_path = os.path.join(POSTS_HTML_DIR, output_filename)
            relative_link = os.path.join(POSTS_HTML_DIR, output_filename) # Link relative to blog root

            posts_data.append({
                'title': title,
                'date': pub_date,
                'date_str': pub_date.strftime('%Y-%m-%d'),
                'html_content': html_content,
                'output_path': output_path,
                'relative_link': relative_link
            })
        except Exception as e:
            print(f"Error processing {md_file_path}: {e}")

    # Sort posts by date (newest first)
    posts_data.sort(key=lambda p: p['date'], reverse=True)

    # Generate HTML list of posts for index and sidebars
    post_list_html = "<ul>\n"
    for post in posts_data:
        post_list_html += f'  <li><a href="{post["relative_link"]}">{post["title"]} ({post["date_str"]})</a></li>\n'
    post_list_html += "</ul>"

    # Render individual posts
    for post in posts_data:
        post_html = layout_template.replace('{{ content }}', post['html_content'])
        post_html = post_html.replace('{{ post_list }}', post_list_html) # Include post list in sidebar
        post_html = post_html.replace('<title>My Blog</title>', f'<title>{post["title"]} - My Blog</title>') # Update title
        try:
            with open(post['output_path'], 'w', encoding='utf-8') as f:
                f.write(post_html)
            print(f"Rendered: {post['output_path']}")
        except IOError as e:
            print(f"Error writing {post['output_path']}: {e}")


    # Render main index page
    index_content = "<h2>Latest Posts</h2>" # Or some other welcome message
    index_html = layout_template.replace('{{ content }}', index_content)
    index_html = index_html.replace('{{ post_list }}', post_list_html)
    try:
        with open(INDEX_HTML_FILE, 'w', encoding='utf-8') as f:
            f.write(index_html)
        print(f"Rendered: {INDEX_HTML_FILE}")
    except IOError as e:
        print(f"Error writing {INDEX_HTML_FILE}: {e}")

if __name__ == "__main__":
    # Assume script is run from the 'blog' directory
    # Change directory if needed, or adjust paths above
    main()
