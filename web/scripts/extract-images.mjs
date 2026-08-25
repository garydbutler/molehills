import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const html = readFileSync("references/tend-landing.html", "utf8");
const re = /src="data:image\/(png|jpeg);base64,([^"]+)"/g;
const names = ["hero", "vision", "before", "after"];

mkdirSync("public/images", { recursive: true });

let match;
let i = 0;
while ((match = re.exec(html)) !== null) {
  const name = names[i] ?? `img${i}`;
  const buf = Buffer.from(match[2], "base64");
  const ext = match[1] === "jpeg" ? "jpg" : "png";
  writeFileSync(`public/images/${name}.${ext}`, buf);
  console.log(name, match[1], `${(buf.length / 1024).toFixed(0)}KB`);
  i++;
}
console.log("total:", i);
