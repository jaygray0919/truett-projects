We use `amp-selector` to create a tab interface [following this design](
https://amp.dev/documentation/examples/style-layout/tab_panels_with_amp-selector/?format=websites).

Here is an [amp-html-example](https://afdsi.com/__amp-issues/reference-IDMP-sidebar-lightbox/) that uses `amp-selector` in an `amp-lightbox` and `amp-sidebar`.
  * Read more (gray button) opens`amp-sidebar`
  * Read more (blue button) opens `amp-lightbox`
  * Both structures use `amp-state`

Here is an [amp-html-example](https://afdsi.com/__amp-issues/reference-iFrame-multiple-tabs-wedge/) that uses `amp-selector` in `amp-iframe`.

However, `amp-selector` returns irregular results when used in `amp-story-attachment`.

Here is an [amp-story-implementation](https://afdsi.com/__amp-issues/attachment-iframe-single-and-multi-tab/) of `amp-iframe` in `amp-story-attachment`.

The first content slide works well.

The second content slide implements `amp-iframe` with **multiple tabs** in `amp-story-attachment`.
Tabs cannot be toggled, as is supported in the `amp-html` reference example.

Here is a [CSS-only implementation](https://afdsi.com/__amp-issues/attachment-tabs-sans-amp-selector/) of a multiple-tabs-interface in `amp-story-attachment`.
Works well.

However, this CSS-only implementation **fails** when using \<amp-img> in place of \<img>

For `amp-story-attachment`, here is an [amp-select implementation](https://afdsi.com/__amp-issues/attachment-sameAs-IDMP-sidebar/) using code from above IDMP example.

In the `amp-story-attachment` example, `amp-list`|`amp-mustache` structures fail to load external data.
The JSON [data](https://afdsi.com/__amp-issues/amp-story-avec-list/data.json) is valid.
The Wikipedia image fails, and text for tabs fails.
However, in Chrome and Edge (not Mozilla) the tabbed-interface **can be toggled** (although content is null).
Note: page is [amp-valid](https://validator.ampproject.org/#url=https%3A%2F%2Fafdsi.com%2F__amp-issues%2Fattachment-sameAs-IDMP-sidebar%2F)

When making a selection, we see the error message `[Action] "AMP.setState" is not allowlisted [].`

When moving external data to a local `<amp-state>` structure, we see the error message:
  * `The tag 'amp-state' may not appear as a descendant of tag 'amp-story-page-attachment'.`
  * `The tag 'script' may not appear as a descendant of tag 'amp-story-page-attachment'.`

---

How to **reuse** `amp-select`-based content in both `amp-html` and in `amp-story-attachment`?

Also, please consider allowing \<img> in `amp-story-attachment` as is allowed in `amp-html`.


