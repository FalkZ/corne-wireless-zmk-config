import { Webview } from "https://deno.land/x/webview@0.7.6/mod.ts";

const svg = Deno.readTextFileSync("./visual/keymap.svg");

const html = `
  <html>
  <head>
  <meta charset="utf-8">
  <style>
  svg {
    width: calc(100vw + 20px);
    height: calc(100vh + 80px);
    margin: -30px -10px;

  }
  html,
  body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  /* prefers dark mode */
    @media (prefers-color-scheme: dark) {
        html,
        body , svg {
        filter: invert(1) hue-rotate(180deg);
        }
    }
    text.label {
        opacity: 0;
        display: hidden !important;
    }
</style>
  </head>
  <body>
  ${svg}
    

  </body>
  </html>
`;

const webview = new Webview();

webview.navigate(`data:text/html,${encodeURIComponent(html)}`);
webview.run();
