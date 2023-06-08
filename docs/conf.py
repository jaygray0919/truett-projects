# This file is execfile()d with the current directory set to its containing dir.

import sys
import os

on_rtd = os.environ.get('READTHEDOCS', None) == 'True'

#if not on_rtd:  # only import and set the theme if we're building docs locally
#    import sphinx_rtd_theme
#    html_theme = 'sphinx_rtd_theme'
#    html_theme_path = [sphinx_rtd_theme.get_html_theme_path()]

# If the directory is relative to the documentation root, use os.path.abspath to make it absolute, like shown here.
# directory relative to this conf file

CURDIR = os.path.abspath(os.path.dirname(__file__))

# If extensions (or modules to document with auto-doc) are in another directory, add these directories to sys.path here.
# add custom extensions directory to python path
#sys.path.append(os.path.join(os.path.abspath(os.path.dirname(__file__)), '_extensions'))

local_plantuml_path = os.path.join(os.path.dirname(__file__), "utils", "plantuml-1.2023.6.jar")
plantuml = f"java -Djava.awt.headless=true -jar {local_plantuml_path}"

# -- General configuration ----------------------------------

# Add any Sphinx extension module names here, as strings.
# They can be extensions coming with Sphinx (named 'sphinx.ext.*') or your custom ones.

extensions = [
    'sphinx_rtd_theme',
    'hoverxref.extension',
    'sphinxemoji.sphinxemoji',
    'sphinxcontrib.bibtex',
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

# -- hoverxref.extension configuration ----------------------
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

# -- GraphViz configuration ----------------------------------
graphviz_output_format = 'svg'

# -- sphinxemoji configuration -------------------------------
sphinxemoji_style = 'twemoji'

# -- More general configuration ------------------------------

# Add any paths that contain templates here, relative to this directory.
templates_path = ['_templates']

# The suffix of source filenames.
source_suffix = '.rst'

# The encoding of source files.
source_encoding = 'utf-8-sig'

# The master toctree document.
master_doc = 'index'

# Project information. Label goes into left nav title block
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
    '__notes',
    '_build',
    'link-generic.rst',
]

# The reST default role (used for this markup: `text`) to use for all documents.
default_role = None

# If true, '()' will be appended to :func: etc. cross-reference text.
#add_function_parentheses = True

# If true, the current module name will be pre-pended to all description unit titles (such as .. function::).
#add_module_names = True

# If true, section-author and module-author directives will be shown in the output. They are ignored by default.
#show_authors = False

# A string of reStructuredText that will be included at the end of every source file that is read.
# decode fails: rst_epilog = open(os.path.join(CURDIR, 'epilog.rst'),'r').read().decode('utf-8')
# rst_epilog = open(os.path.join(CURDIR, 'epilog.rst'),'r').read()

# make rst_epilog a variable, so you can add other epilog parts to it

rst_epilog =""

# Read link all targets from file
with open('link-generic.rst') as f:
     rst_epilog += f.read()

# The name of the Pygments (syntax highlighting) style to use.
pygments_style = 'sphinx'

# -- Options for HTML output --------------------------------

# The theme to use for HTML and HTML Help pages. See the documentation for a list of built-in themes.

html_theme = "sphinx_rtd_theme"

# Theme options are theme-specific and customize the look and feel of a theme further.

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

# Add any paths that contain custom themes here, relative to this directory.
# html_theme_path = [sphinx_rtd_theme.get_html_theme_path()]

# The name for this set of Sphinx documents. Appears in browser tab.
# If None, it defaults to "<project> v<release> documentation".

html_title = ""

# A shorter title for the navigation bar. Default is the same as html_title.

html_short_title = 'Truett Documentation'

# The name of an image file (relative to this directory) to place at the top of the sidebar.
#html_logo = 'Ontomatica.png'

# The name of an image file (within the static path) to use as favicon of the docs.
# This file should be a Windows icon file (.ico) being 16x16 or 32x32 pixels large.
html_favicon = "onto-shortcut-w252-h252-color-ffffff-bgnd-1f64ff.svg"

# Add any paths that contain custom static files (such as style sheets) here, relative to this directory.
# They are copied after the built-in static files, so a file named "default.css" will overwrite the built-in "default.css".

html_static_path = [
    '_static',
    '_images',
]

# These paths are either relative to html_static_path or fully qualified paths (eg. https://...)

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


# Add any extra paths that contain custom files (such as robots.txt or .htaccess) here, relative to this directory.
# These files are copied directly to the root of the documentation.
#html_extra_path = ['_images']

# If not '', a 'Last updated on:' time-stamp is inserted at every page bottom, using the given strftime format.

html_last_updated_fmt = '%d %b %Y'

# If false, no module index is generated.

html_domain_indices = True

# If false, no index is generated.

html_use_index = True

# If true, the index is split into individual pages for each letter.

html_split_index = True

# If true, links to the reST sources are added to the pages.

html_show_sourcelink = False

# If true, "Created using Sphinx" is shown in the HTML footer. Default is True.

html_show_sphinx = False

# If true, "(C) Copyright Ontomatica" is shown in the HTML footer. Default is True.

html_show_copyright = False

# If true, an OpenSearch description file will be output, and all pages will contain a <link> tag referring to it.
# The value of this option must be the base URL from which the finished HTML is served.
#html_use_opensearch = ''

# This is the file name suffix for HTML files (e.g. ".xhtml").

html_file_suffix = '.html'

# Language to be used for generating the HTML full-text search index.
# Sphinx supports the following languages:
#   'da', 'de', 'en', 'es', 'fi', 'fr', 'h', 'it', 'ja'
#   'nl', 'no', 'pt', 'ro', 'r', 'sv', 'tr'

html_search_language = 'en'

# A dictionary with options for the search language support, empty by default.
# Now only 'ja' uses this config value
#html_search_options = {'type': 'default'}

# The name of a javascript file (relative to the configuration directory) that implements a search results scorer.
# If empty, the default will be used.
#html_search_scorer = 'scorer.js'

# Output file base name for HTML help builder.

htmlhelp_basename = 'spx'

