# Required updates for Jekyll Multilanguage on Minimal Mistakes theme

During blog creation, I have modified several files to make the [Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/) theme work properly with the [jekyll-multiple-languages-plugin](https://github.com/kurtsson/jekyll-multiple-languages-plugin).

Below you can find a list of modifications you can compare and check from what I'm using as well as files I keep the changes made when a theme update is made.

## Unused default configuration

File `_data\navigation.yml` isn't used once all menu navigation is retrieved from translation files. You can compare my `<language>.yml` files to see what information it contains.

## Files to keep during updates

- YML
  - `_config.yml`: Just need to confirm if a big structural change was made and is required to theme continues to work
- HTML
  - `index.html`: Just need to review if you're using a different index configuration, compared to the theme's original.
  - `_includes\head\custom.html`: Review if any important change was added with the newer release
- `LICENCE` and `README.md`: Skip these default files, otherwise will replace your own.
- `Gemfile`

## Unnecessary files

Files that can be removed without affecting functionality

- `screenshot-layouts.png` e `screenshot.png`
- `CHANGELOG.md`
- Remove the following folders:
  - `.github`
    - Keep only your existing Github actions
  - `docs`
  - `test`

## Files where changes were required

- **CSS**: By default, no change would be required but due to some button additions, I have changed the following files

  - `_sass\minimal-mistakes\_buttons.scss`: Declare Telegram and WhatsApp button options
  - `_sass\minimal-mistakes\_variables.scss`: Define Telegram and WhatsApp button colors
  - `_sass\minimal-mistakes\_page.scss`: Hide some meta-objects I have added to the grid template view

- **HTML**

  - **Global**: Replace strings due to the Jekyll-multilanguage plugin (removing the `(.)`).

    | Source                             | Replace                                         |
    | ---------------------------------- | ----------------------------------------------- |
    | `site(.)data.ui-text[site.locale]` | `site.data.ui-text[site.lang]`                  |
    | `site(.)category_archive`          | `site.translations[site.lang].category_archive` |
    | `site(.)data.navigation`           | `site.translations[site.lang].navigation`       |
    | `site(.)tag_archive`               | `site.translations[site.lang].tag_archive`      |

  - `_includes`

    - `archive-single.html`: Adjusted post links to the current site language version

    - `footer.html`:
      - Changes related to multilanguage (Atom Feed)
      - Added two custom links: one for the "Terms and Privacy" page and another to "Read in another language"

    - `masthead.html`:
      - Changes related to multilanguage on the title link, as well as replaced navigation source from `_data\navigation.yml` to site translation
    - `nav-list.html`: Changes related to translated navigation

    - `page__meta.html`: Added custom meta tags in posts
      - A "Read in another language" button
      - Share button, pointing to an anchor at the end of the page

    - `paginator.html` and `post_pagination.html`: Made some adjustments so pagination can happen in the currently selected language
    - `social-share.html`:
      - Include `id="sharelinks"` in social share action. This will work as an anchor to one of the tags added in `page__meta.html`
      - Added WhatsApp and Telegram Share buttons (to be mobile friendly :smile: )
      - Added changes to the shared URL to the currently used language
    - `comments-providers\utterances.html`: set issue-term to page namespace, so comments for all languages will be forwarded to a single Issue thread on GitHub
    - `_layouts\default.html`: Included GTM liquid tag in `<body>` and changed `hed/custom.html` to be loaded first

Hope that anyone looking to use this theme in a localized way could benefit from this, as well as sharing the efforts required to make this work :smiley:
