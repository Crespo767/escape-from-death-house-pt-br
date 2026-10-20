// These functions are also embedded in MATT's Run Code actions by tools/update-controls.mjs.
// Keep their dependencies inside each function so imported scenes remain self-contained.
export async function toggleAtticLock(tile) {
  if (!game.user.isGM) return;
  const scene = tile.parent;
  if (scene._deathHouseAtticBusy) return;
  scene._deathHouseAtticBusy = true;
  try {
    const target = scene.tiles.get("z3McV4vEe4hjeUX0");
    if (!target?.flags["monks-active-tiles"]) {
      throw new Error("O gatilho da escada do sótão não foi encontrado nesta cena.");
    }
    const active = !target.flags["monks-active-tiles"].active;
    await target.update({ "flags.monks-active-tiles.active": active });
    ui.notifications.info(active
      ? "Escada do sótão liberada: teletransporte para o porão ativado."
      : "Escada do sótão trancada: teletransporte para o porão desativado.");
  } catch (error) {
    console.error("Fuga da Casa da Morte | Tranca do sótão", error);
    ui.notifications.error(error.message);
  } finally {
    delete scene._deathHouseAtticBusy;
  }
}

export async function toggleBlackout(tile) {
  if (!game.user.isGM) return;
  const scene = tile.parent;
  if (scene._deathHouseBlackoutBusy) return;
  scene._deathHouseBlackoutBusy = true;
  const namespace = "escape-from-death-house-pt-br";
  const key = "blackoutState";
  // The original effect enables nine exterior/atmospheric lights and hides 24 interior lights.
  const exterior = ["tFmCpW7C316JZFAm", "DxZyNFgnR1mxMPXL", "HfFeOQjEZkyPZsZN",
    "HRMHcMz35ccAZaMB", "GqhBMGE5f0pZFqzh", "Xvhc0fB4quRZ1uGB",
    "IctYcxPNDo8vGUmg", "2JLQjlORI4stuv3m", "pPvpLJ6zdLuQCfCk"];
  const interior = ["FrbTX9Z4UIpc9j97", "bC2wdMDsjzsOTosR", "J7d2DWTafzpTkLiU",
    "sV0e083hD73aH5W9", "tYY1nXg6ONTZ3zPC", "TVS6w3t4RRTBIyW3",
    "BRJFWNM4HjKnoALW", "UZFskhh7an8iu9fh", "wRSBqYq879BkIb9r",
    "QlH16jUJheqURBeo", "D85u1MxRuJX4F3wm", "TanzpRTTn0rGaS05",
    "pc1fXzOr6J53n43X", "LTt2Et4wTITjBHEy", "FY315vWmgGKtXvaa",
    "DnpTSWy6dOWIDCdm", "FHEZFtGsYmpBApiY", "KDg9XpGcjnrh9G08",
    "zQ6oQrnTC1sZUdxG", "IG2BQ68CnTY5FMVy", "0NgvIgGJYzhDPkUY",
    "6Xv0KfWNVqViyHEy", "3YcA8oNnaE4J3fVN", "bovizbSQ2Rsquva3"];
  const sounds = ["1pZ0YBTnUY5DjJ68", "NFTxmwrgUzVPMslE", "Ldt5sDhloFfPW8Sa",
    "V5FYxBdCRuQqzHyE", "jfG7fUWQx7gohwyo"];
  const floors = ["GgxqtH3ymunEzDIr", "taG0sVNulMiwclIp", "W53aOa59bSmyg9AV", "jESi8tDzjed1IDPs"];
  const requireDocument = (collection, id) => {
    const document = collection.get(id);
    if (!document) throw new Error(`Alvo do blecaute não encontrado nesta cena: ${id}`);
    return document;
  };
  const clone = value => JSON.parse(JSON.stringify(value));
  // Wait for every update, including failures, before attempting a rollback.
  const apply = async state => {
    const results = await Promise.allSettled([
      scene.updateEmbeddedDocuments("AmbientLight", state.lights),
      scene.updateEmbeddedDocuments("AmbientSound", state.sounds),
      scene.updateEmbeddedDocuments("Tile", state.tiles),
      state.effects === null ? scene.unsetFlag("fxmaster", "effects")
        : scene.setFlag("fxmaster", "effects", clone(state.effects))
    ]);
    const failure = results.find(result => result.status === "rejected");
    if (failure) throw failure.reason;
  };
  try {
    const saved = scene.getFlag(namespace, key);
    if (saved) {
      for (const [collection, updates] of [[scene.lights, saved.lights], [scene.sounds, saved.sounds], [scene.tiles, saved.tiles]]) {
        for (const update of updates) requireDocument(collection, update._id);
      }
      await apply(saved);
      await scene.unsetFlag(namespace, key);
      ui.notifications.info("Blecaute desativado: iluminação, sons e imagens restaurados.");
      return;
    }
    const lightIds = [...exterior, ...interior];
    const snapshot = {
      lights: lightIds.map(id => ({ _id: id, hidden: requireDocument(scene.lights, id).hidden })),
      sounds: sounds.map(id => ({ _id: id, hidden: requireDocument(scene.sounds, id).hidden })),
      tiles: floors.map(id => {
        const floor = requireDocument(scene.tiles, id);
        if (!floor.flags["monks-active-tiles"]?.files?.[1]?.name) {
          throw new Error(`Imagem apagada do andar não encontrada: ${id}`);
        }
        return { _id: id, "texture.src": floor.texture.src,
          "flags.monks-active-tiles.fileindex": floor.flags["monks-active-tiles"].fileindex ?? 0 };
      }),
      effects: clone(scene.getFlag("fxmaster", "effects") ?? null)
    };
    // Persist the recovery data before modifying any part of the scene.
    await scene.setFlag(namespace, key, snapshot);
    try {
      await apply({
        lights: lightIds.map(id => ({ _id: id, hidden: !exterior.includes(id) })),
        sounds: sounds.map(id => ({ _id: id, hidden: true })),
        tiles: floors.map(id => ({ _id: id,
          "texture.src": scene.tiles.get(id).flags["monks-active-tiles"].files[1].name,
          "flags.monks-active-tiles.fileindex": 1 })),
        effects: null
      });
    } catch (error) {
      // If recovery also fails, retain the snapshot so the next click can retry it.
      await apply(snapshot);
      await scene.unsetFlag(namespace, key);
      throw error;
    }
    ui.notifications.info("Blecaute sobrenatural ativado.");
  } catch (error) {
    console.error("Fuga da Casa da Morte | Blecaute", error);
    ui.notifications.error(`Não foi possível concluir o blecaute: ${error.message}.`);
  } finally {
    delete scene._deathHouseBlackoutBusy;
  }
}

export async function preloadControls(canvas) {
  const tiles = canvas.scene?.tiles;
  if (!tiles?.get("jTsqiwsp8FJdN4fr")) return;
  const waltz = tiles.get("jTsqiwsp8FJdN4fr").flags["monks-active-tiles"]?.actions
    ?.find(action => action.action === "playsound")?.data.audiofile;
  const sources = new Set();
  for (const id of ["GgxqtH3ymunEzDIr", "taG0sVNulMiwclIp", "W53aOa59bSmyg9AV", "jESi8tDzjed1IDPs"]) {
    for (const file of tiles.get(id)?.flags["monks-active-tiles"]?.files ?? []) sources.add(file.name);
  }
  const tasks = [...sources].map(src => foundry.canvas.loadTexture(src));
  if (waltz) tasks.push(foundry.audio.AudioHelper.preloadSound(waltz));
  const results = await Promise.allSettled(tasks);
  for (const result of results) if (result.status === "rejected") {
    console.warn("Fuga da Casa da Morte | Pré-carregamento dos controles", result.reason);
  }
}

// Do not hold up canvasReady while clients cache the music and alternate floor images.
if (typeof Hooks !== "undefined") Hooks.on("canvasReady", canvas => { void preloadControls(canvas); });
