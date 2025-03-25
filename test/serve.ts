import open from "open";
import path from "path";

async function getContent() {
  const html = await Bun.file(
    path.resolve(import.meta.dir, "index.html")
  ).text();
  const lib = await Bun.file(
    path.resolve(import.meta.dir, "..", "lib", "index.umd.js")
  ).text();
  return html.replace(
    '<script id="replace-script"></script>',
    `<script>${lib}</script>`
  );
}

function serve(pageContent: string) {
  return Bun.serve({
    port: 9999,
    routes: {
      "/": {
        GET: async () => {
          return new Response(pageContent, {
            headers: {
              "content-type": "text/html;charset=utf-8",
            },
          });
        },
      },
      "/test.mp3": {
        GET: async () => {
          return new Response(
            Bun.file(path.resolve(import.meta.dir, "test.mp3")),
            {
              headers: {
                "content-type": "text/html;charset=utf-8",
              },
            }
          );
        },
      },
    },
  });
}

const pageContent = await getContent();
const server = serve(pageContent);
const url = server.url.toString();
console.log("🚀 The test serve on the", url);
open(url);
