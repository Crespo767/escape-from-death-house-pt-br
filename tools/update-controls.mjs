import path from "node:path";
import { fileURLToPath } from "node:url";
import { ClassicLevel } from "classic-level";
import { updateSceneControls } from "../scripts/control-data.mjs";
export { updateSceneControls } from "../scripts/control-data.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));

export async function updatePacks(directory = root) {
  for (const pack of ["cosrl-arca-scenes", "cosrl-arca-adventure"]) {
    const db = new ClassicLevel(path.join(directory, "packs", pack), { valueEncoding: "json", createIfMissing: false });
    try {
      const records = new Map();
      for await (const [key, value] of db.iterator()) records.set(key, value);
      const original = new Map([...records].map(([key, value]) => [key, JSON.stringify(value)]));
      if (pack.endsWith("adventure")) {
        for (const [key, adventure] of records) if (key.startsWith("!adventures!")) {
          for (const scene of adventure.scenes) updateSceneControls(scene);
        }
      } else {
        for (const [key, data] of records) if (key.startsWith("!scenes!")) {
          updateSceneControls({ ...data,
            tiles: data.tiles.map(id => records.get(`!scenes.tiles!${data._id}.${id}`)),
            regions: data.regions.map(id => records.get(`!scenes.regions!${data._id}.${id}`))
          });
        }
      }
      const changes = [...records].filter(([key, value]) => original.get(key) !== JSON.stringify(value));
      await db.batch(changes.map(([key, value]) => ({ type: "put", key, value })));
      await db.compactRange("", "\uffff");
      console.log(`${pack}: ${changes.length} registro(s) atualizado(s)`);
    } finally {
      await db.close();
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await updatePacks();
