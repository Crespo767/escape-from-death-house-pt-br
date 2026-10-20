import { toggleAtticLock, toggleBlackout } from "./controls.mjs";

const scope = "monks-active-tiles";
const codeAction = (id, fn) => ({ id, action: "runcode", data: { code: `return (${fn.toString().replace(/\r\n/g, "\n")})(tile);` } });

export function updateSceneControls(scene) {
  const find = id => scene.tiles.find(tile => tile._id === id);
  const lock = find("rjTzo1MfKKVAP8AS");
  const blackout = find("yqOV6f4xCl4E0w17");
  const waltz = find("jTsqiwsp8FJdN4fr");
  if (lock && blackout && waltz) {
    lock.flags[scope].actions = [codeAction("czC164CWwtUCBAD7", toggleAtticLock)];
    blackout.flags[scope].actions = [codeAction("IxkrfgB84y3QNDvD", toggleBlackout)];
    for (const [tile, name] of [[lock, "Tranca da Escada do Sótão"], [blackout, "Blecaute Sobrenatural"], [waltz, "Valsa para Klara"]]) {
      tile.flags[scope].name = name;
      tile.flags[scope].cooldown = 0.75;
    }
    // The secret staircase is on the attic level, not on the ground floor.
    const region = scene.regions.find(region => region._id === "d2LYnu6JW9puvbwp");
    if (!region) throw new Error("Região da escada secreta ausente");
    region.elevation = { bottom: 30, top: 39 };
    const down = find("z3McV4vEe4hjeUX0");
    down.elevation = 30;
    down.flags.levels.rangeTop = 39;
  }
  // Cross-scene teleports copy the source token elevation. Set the destination floor
  // on the returned token collection before MATT switches the player's scene.
  for (const [id, elevation] of [["z3McV4vEe4hjeUX0", "0"], ["EA2C6CaP7MzwnfCY", "30"]]) {
    const tile = find(id);
    if (!tile) continue;
    const actions = tile.flags[scope].actions;
    if (!actions.some(action => action.id === "dhDestinationZ01")) actions.splice(1, 0, {
      id: "dhDestinationZ01", action: "elevation",
      data: { entity: { id: "previous", name: "Current tokens" }, value: elevation }
    });
  }
}

export function planSceneControlUpdates(source) {
  const data = structuredClone(source);
  updateSceneControls(data);
  const changed = type => data[type].filter(document =>
    JSON.stringify(document) !== JSON.stringify(source[type].find(old => old._id === document._id)));
  const tiles = changed("tiles");
  const regions = changed("regions");
  return { tiles, regions, backup: {
    tiles: source.tiles.filter(tile => tiles.some(changed => changed._id === tile._id)),
    regions: source.regions.filter(region => regions.some(changed => changed._id === region._id))
  } };
}
