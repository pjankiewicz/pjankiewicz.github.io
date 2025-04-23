PYTHON = python3

# Default target
all: html

# Render Markdown to HTML
html: build.py config.yaml templates/*.html posts_md/*.md
	$(PYTHON) build.py

# Clean generated files
clean:
	rm -f index.html feed.xml sitemap.xml
	rm -rf posts

.PHONY: all html clean
