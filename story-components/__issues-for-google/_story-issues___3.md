# Summary
#### Reference Links

  - amp-story:
  https://afdsi.com/___supplier/paula-perez/story-22-04-03/
  - amp-story-player:
  https://afdsi.com/___supplier/paula-perez/story-22-04-17-player/

<hr>

## Issues: amp-story

### amp-attachment: table

  - table creates 2 vertical scroll bars
  - example:
  https://afdsi.com/___supplier/paula-perez/story-22-04-03/#page=item-22

### amp-attachment: amp-google-document-embed

  - irregular behavior; loads in some sessions, fails in others:
  https://afdsi.com/___supplier/paula-perez/story-22-04-03/#page=item-18

### buttons

  - buttons change position with browser zoom and in amp-story-player
  - examples:
    - https://afdsi.com/___supplier/paula-perez/story-22-04-03/#page=item-27
    - https://afdsi.com/___supplier/paula-perez/story-22-04-03/#page=item-28
    - https://afdsi.com/___supplier/paula-perez/story-22-04-03/#page=item-29
  - question:
    - how to code CSS so that information button is correctly positioned when browser zooms and when displayed in amp-story-player

### amp-interactive: quiz

  - how to use a null-value endpoint?
    - currently using google endpoint example
    - how to set an endpoint that does not display server-side values
    - for quiz #3, a null value for an endpoint or absence of endpoint property is amp-invalid
    - examples:
      - https://afdsi.com/___supplier/paula-perez/story-22-04-03/#page=item-24
      - https://afdsi.com/___supplier/paula-perez/story-22-04-03/#page=item-25
      - https://afdsi.com/___supplier/paula-perez/story-22-04-03/#page=item-26

### amp-attachment: tab selectors

  - how to use tab selector in amp-story-attachment?
  - this example is amp-html-valid but amp-story-invalid:
      - https://afdsi.com/___supplier/paula-perez/story-22-04-03/#page=item-40

### amp-attachment: iFrame

  - how to use amp-iframe in amp-story-attachment?
  - this example is amp-html-valid but amp-story-invalid:
      - https://afdsi.com/___supplier/paula-perez/story-22-04-03/#page=item-41

<hr>

## Issues: amp-story-player

### page loading

  - page sometimes requires a reload before sidebar navigation works:
    https://afdsi.com/___supplier/paula-perez/story-22-04-17-player/

### page navigation

  - this works for amp-story:
    https://afdsi.com/___supplier/paula-perez/story-22-04-03/#page=item-21
  - but does not work in amp-story-player
    https://afdsi.com/___supplier/paula-perez/story-22-04-17-player/#page=item-21

### script: full page

  - how to modify this script to run amp-story-player full screen:
    https://gist.github.com/jaygray0919/34fad1b31e5e7de217de104f067a38d9
  - what is the substitute for "video" in the script? is it:
    - amp-story-player
  - reference:
  https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-story-player.md#programmatic-control

### Google advice

  - For this page:
  https://afdsi.com/_ankita/amp-story-player/_AMP-biograph.html
  - option 1
    - run inline as presented
  - option 2
    - show a screenshot; select screenshot; run amp-story-player in an amp-lightbox upon selection
    - example:
      https://codepen.io/maenrique/pen/vYyVjEB

