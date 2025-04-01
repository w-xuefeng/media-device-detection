import open from "open";
import path from "path";

async function getContent(from: string[]) {
  const lib = await Bun.file(
    path.resolve(import.meta.dir, "..", "lib", "index.umd.js")
  ).text();

  const task = async (file: string) => {
    const html = await Bun.file(path.resolve(import.meta.dir, file)).text();
    return html.replace(
      '<script id="replace-script"></script>',
      `<script>${lib}</script>`
    );
  };
  const rs = await Promise.all(from.map((file) => task(file)));
  return Object.fromEntries(rs.map((e, i) => [from[i], e]));
}

function serve(pageContent: Record<string, string>) {
  return Bun.serve({
    port: 9999,
    routes: {
      "/": {
        GET: async () => {
          return new Response(pageContent["index.html"], {
            headers: {
              "content-type": "text/html;charset=utf-8",
            },
          });
        },
      },
      "/component-dialog": {
        GET: async () => {
          return new Response(pageContent["component-dialog.html"], {
            headers: {
              "content-type": "text/html;charset=utf-8",
            },
          });
        },
      },
      "/component-panel": {
        GET: async () => {
          return new Response(pageContent["component-panel.html"], {
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

const pageContent = await getContent([
  "index.html",
  "component-dialog.html",
  "component-panel.html",
]);
const server = serve(pageContent);
const url = server.url.toString();
console.log("🚀 The test serve on the", url);
open(url);
