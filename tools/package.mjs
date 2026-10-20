import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const manifest = JSON.parse(await fs.readFile(path.join(root, "module.json"), "utf8"));
const tag = `v${manifest.version}`;
if (process.env.GITHUB_REF_TYPE === "tag" && process.env.GITHUB_REF_NAME !== tag) {
  throw new Error(`Tag ${process.env.GITHUB_REF_NAME} difere da versão ${tag}`);
}
const repository = process.env.GITHUB_REPOSITORY ?? "Crespo767/escape-from-death-house-pt-br";
manifest.download = `https://github.com/${repository}/releases/download/${tag}/${manifest.id}.zip`;
const staging = path.join(root, "package", manifest.id);
await fs.mkdir(staging, { recursive: true });
if ((await fs.readdir(staging)).length) throw new Error(`A pasta de empacotamento deve estar vazia: ${staging}`);
const transient = name => /^(LOCK|LOG|LOG\.old)$/.test(name) || name.endsWith(".log");
for (const name of ["assets", "packs", "scripts", "macros", "docs", "README.md"]) {
  await fs.cp(path.join(root, name), path.join(staging, name), {
    recursive: true, filter: source => !transient(path.basename(source))
  });
}
await fs.writeFile(path.join(staging, "module.json"), `${JSON.stringify(manifest, null, 2)}\n`);
// A release asset must have exactly the same manifest as the one inside the ZIP.
await fs.writeFile(path.join(root, "package", "module.json"), `${JSON.stringify(manifest, null, 2)}\n`);
for (const source of manifest.esmodules ?? []) await fs.access(path.join(staging, source));
for (const pack of manifest.packs) {
  const current = (await fs.readFile(path.join(staging, pack.path, "CURRENT"), "utf8")).trim();
  await fs.access(path.join(staging, pack.path, current));
}
console.log(`Pacote ${tag} preparado: ${staging}`);
