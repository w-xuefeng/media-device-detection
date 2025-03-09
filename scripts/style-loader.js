import fs from "node:fs";
import path from "node:path";

const dialogFrom = path.resolve(
  import.meta.dirname,
  "..",
  "src",
  "view",
  "dialog.css"
);
const panelFrom = path.resolve(
  import.meta.dirname,
  "..",
  "src",
  "view",
  "panel.css"
);
const target = path.resolve(
  import.meta.dirname,
  "..",
  "src",
  "view",
  "style.ts"
);

const template = {
  dialog: `<dialog-style-placeholder>`,
  panel: `<panel-style-placeholder>`,
};

template.dialog = fs.readFileSync(dialogFrom, { encoding: "utf-8" });
template.panel = fs.readFileSync(panelFrom, { encoding: "utf-8" });

fs.writeFileSync(target, `export default ${JSON.stringify(template, null, 2)}`);
