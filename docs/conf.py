import sys
import os

on_rtd = os.environ.get('READTHEDOCS', None) == 'True'

CURDIR = os.path.abspath(os.path.dirname(__file__))

local_plantuml_path = os.path.join(os.path.dirname(__file__), "utils", "plantuml-1.2023.6.jar")
plantuml = f"java -Djava.awt.headless=true -jar {local_plantuml_path}"

extensions = [
    'sphinx_rtd_theme',
    'hoverxref.extension',
    'sphinxemoji.sphinxemoji',
    'sphinxcontrib.contentui',
    'sphinxcontrib.httpdomain',
    'sphinxcontrib.plantuml',
    'sphinx.ext.autodoc',
    'sphinx.ext.autosectionlabel',
    'sphinx.ext.autosummary',
    'sphinx.ext.graphviz',
    'sphinx.ext.mathjax',
    'sphinx.ext.viewcode',
    'sphinx_copybutton',
    'sphinx_search.extension',
    'sphinx_tabs.tabs',
    ]

hoverxref_auto_ref = True
hoverxref_domains = ["py"]
hoverxref_roles = [
    "option",
    # Documentation pages
    # Not supported yet: https://github.com/readthedocs/sphinx-hoverxref/issues/18
    "doc",
    # Glossary terms
    "term",
    ]

hoverxref_role_types = {
    "mod": "modal",  # for Python Sphinx Domain
    "doc": "modal",  # for whole docs
    "class": "tooltip",  # for Python Sphinx Domain
    "ref": "tooltip",  # for hoverxref_auto_ref config
    "confval": "tooltip",  # for custom object
    "term": "tooltip",  # for glossaries
}

graphviz_output_format = 'svg'
sphinxemoji_style = 'twemoji'
templates_path = ['_templates']
source_suffix = '.rst'
source_encoding = 'utf-8-sig'
master_doc = 'index'
project = 'Truett Project Documentation'
copyright = '2023, Ontomatica'

# The version info for the project you're documenting, acts as replacement for
# |version| and |release|, also used in various other places throughout the built documents.
# The short X.Y version.
version = '0.1'

# The full version, including alpha/beta/rc tags.
release = 'a'

# Turns on numbered figures for HTML output
number_figures = True

# There are two options for replacing |today|: either, you set today to some non-false value, then it is used:
#today = ''
# Else, today_fmt is used as the format for a strftime call.
today_fmt = '%d %B %Y'


# List of patterns, relative to source directory, that match files and directories to ignore when looking for source files.
exclude_patterns = [
    '_build',
    'link-generic.rst',
]

# The reST default role (used for this markup: `text`) to use for all documents.
default_role = None

rst_epilog =""

with open('link-generic.rst') as f:
     rst_epilog += f.read()

pygments_style = 'sphinx'

html_theme = "sphinx_rtd_theme"

html_theme_options = {
    'display_version': True,
    'prev_next_buttons_location': 'bottom',
    'style_external_links': False,
# Toc options
    'collapse_navigation': True,
    'sticky_navigation': True,
    'navigation_depth': 9,
    'includehidden': True,
    'titles_only': False,
    'body_max_width': 'none'
}

html_title = ""

html_short_title = 'Truett Documentation'

html_favicon = "_images/onto-shortcut-w252-h252-color-ffffff-bgnd-1f64ff.svg"

html_static_path = [
    '_static',
    '_images',
]

html_css_files = [
    'css/custom.css',
    'css/lightbox.css',
]

html_js_files = [
    'https://cdn.ampproject.org/v0.js',
    'https://cdn.ampproject.org/v0/amp-bind-0.1.js',
    'https://cdn.ampproject.org/v0/amp-form-0.1.js',
    'https://cdn.ampproject.org/v0/amp-image-lightbox-0.1.js',
    'https://cdn.ampproject.org/v0/amp-list-0.1.js',
    'https://cdn.ampproject.org/v0/amp-lightbox-gallery-0.1.js',
    'https://cdn.ampproject.org/v0/amp-mustache-0.2.js',
    'https://cdn.ampproject.org/v0/amp-selector-0.1.js',
]

html_last_updated_fmt = '%d %b %Y'
html_domain_indices = True
html_use_index = True
html_split_index = True
html_show_sourcelink = False
html_show_sphinx = False
html_show_copyright = False
html_file_suffix = '.html'
html_search_language = 'en'
htmlhelp_basename = 'spx'
