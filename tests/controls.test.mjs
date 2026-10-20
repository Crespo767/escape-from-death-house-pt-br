import assert from "node:assert/strict";
import { before, after, test } from "node:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { ClassicLevel } from "classic-level";
import { toggleAtticLock, toggleBlackout, preloadControls } from "../scripts/controls.mjs";
import { updateSceneControls } from "../tools/update-controls.mjs";
import { planSceneControlUpdates } from "../scripts/control-data.mjs";

const root = new URL("../", import.meta.url);
const scope = "monks-active-tiles";
const namespace = "escape-from-death-house-pt-br";
const buttonIds = ["rjTzo1MfKKVAP8AS", "jTsqiwsp8FJdN4fr", "yqOV6f4xCl4E0w17"];
let temporary, manor, basement, adventure;
const clone = value => structuredClone(value);

before(async () => {
  temporary = await fs.mkdtemp(path.join(os.tmpdir(), "death-house-controls-test-"));
  const data = {};
  for (const pack of ["cosrl-arca-scenes", "cosrl-arca-adventure"]) {
    // Opening a LevelDB changes its manifest even for reads. Never open repository packs in tests.
    const destination = path.join(temporary, pack);
    await fs.cp(new URL(`packs/${pack}/`, root), destination, { recursive: true });
    const db = new ClassicLevel(destination, { valueEncoding: "json", createIfMissing: false });
    try {
      data[pack] = new Map();
      for await (const [key, value] of db.iterator()) data[pack].set(key, value);
    } finally { await db.close(); }
  }
  const records = data["cosrl-arca-scenes"];
  const scenes = [...records].filter(([key]) => key.startsWith("!scenes!")).map(([, scene]) => ({
    ...scene,
    ...Object.fromEntries(["tiles", "regions", "lights", "sounds"].map(type => [type,
      scene[type].map(id => records.get(`!scenes.${type}!${scene._id}.${id}`))]))
  }));
  manor = scenes.find(scene => scene.tiles.some(tile => tile._id === buttonIds[0]));
  basement = scenes.find(scene => scene !== manor);
  adventure = [...data["cosrl-arca-adventure"].values()].find(value => value.scenes);
});

after(async () => { if (temporary) await fs.rm(temporary, { recursive: true, force: true }); });

function put(document, key, value) {
  const parts = key.split(".");
  const last = parts.pop();
  let target = document;
  for (const part of parts) target = target[part] ??= {};
  target[last] = clone(value);
}

function environment() {
  const errors = [], messages = [];
  globalThis.game = { user: { isGM: true } };
  globalThis.ui = { notifications: { info: message => messages.push(message), error: message => errors.push(message) } };
  const scene = clone(manor);
  for (const type of ["tiles", "lights", "sounds"]) scene[type] = new Map(scene[type].map(doc => [doc._id, doc]));
  scene.calls = [];
  scene.getFlag = (namespace, key) => scene.flags[namespace]?.[key];
  scene.setFlag = async (namespace, key, value) => {
    scene.calls.push(["setFlag", namespace, key]);
    (scene.flags[namespace] ??= {})[key] = clone(value);
  };
  scene.unsetFlag = async (namespace, key) => {
    scene.calls.push(["unsetFlag", namespace, key]);
    if (scene.flags[namespace]) delete scene.flags[namespace][key];
  };
  scene.updateEmbeddedDocuments = async (type, updates) => {
    scene.calls.push([type, clone(updates)]);
    if (scene.gate) await scene.gate;
    if (scene.fail === type) { delete scene.fail; throw new Error("Falha simulada de gravação"); }
    const collection = scene[{ AmbientLight: "lights", AmbientSound: "sounds", Tile: "tiles" }[type]];
    for (const update of updates) for (const [key, value] of Object.entries(update)) {
      if (key !== "_id") put(collection.get(update._id), key, value);
    }
  };
  const target = scene.tiles.get("z3McV4vEe4hjeUX0");
  target.update = async update => {
    scene.calls.push(["target", clone(update)]);
    if (scene.gate) await scene.gate;
    if (scene.fail) throw new Error("Falha simulada da tranca");
    for (const [key, value] of Object.entries(update)) put(target, key, value);
  };
  return { scene, tile: { parent: scene }, target, errors, messages };
}

function state(scene) {
  return {
    lights: [...scene.lights.values()].map(doc => [doc._id, doc.hidden]),
    sounds: [...scene.sounds.values()].map(doc => [doc._id, doc.hidden]),
    tiles: [...scene.tiles.values()].map(doc => [doc._id, doc.texture.src, doc.flags[scope]?.fileindex]),
    effects: clone(scene.getFlag("fxmaster", "effects") ?? null)
  };
}

test("both import paths contain the same embedded control code and valid attic elevations", () => {
  for (const scene of [manor, basement, ...adventure.scenes]) {
    const updated = clone(scene);
    updateSceneControls(updated);
    assert.deepEqual(updated, scene, "packs must be rebuilt after changing control source");
    for (const tile of scene.tiles) for (const action of tile.flags[scope]?.actions ?? []) {
      if (action.action === "runcode") assert.doesNotThrow(() => new Function("tile", action.data.code));
    }
    if (scene.tiles.some(tile => tile._id === buttonIds[0])) {
      assert.deepEqual(scene.regions.find(region => region._id === "d2LYnu6JW9puvbwp").elevation, { bottom: 30, top: 39 });
      const down = scene.tiles.find(tile => tile._id === "z3McV4vEe4hjeUX0");
      assert.equal(down.elevation, 30);
      assert.equal(down.flags[scope].actions[1].data.value, "0");
      const waltz = scene.tiles.find(tile => tile._id === buttonIds[1]);
      assert.equal(waltz.flags[scope].actions[0].data.prevent, true);
      assert.equal(waltz.flags[scope].actions[0].data.delay, false);
      assert.ok(waltz.flags[scope].cooldown < 1);
    } else {
      assert.equal(scene.tiles.find(tile => tile._id === "EA2C6CaP7MzwnfCY").flags[scope].actions[1].data.value, "30");
    }
  }
});

test("attic lock commits the target state before reporting it, even on a copied scene", async () => {
  const { scene, tile, target, messages } = environment();
  scene._id = "a-different-scene-id";
  await toggleAtticLock(tile);
  assert.equal(target.flags[scope].active, false);
  assert.match(messages[0], /trancada/);
  await toggleAtticLock(tile);
  assert.equal(target.flags[scope].active, true);
  assert.match(messages[1], /liberada/);
});

test("attic lock rejects duplicate clicks while the update is pending", async () => {
  const { scene, tile, target } = environment();
  let release;
  scene.gate = new Promise(resolve => { release = resolve; });
  const first = toggleAtticLock(tile);
  await toggleAtticLock(tile);
  release();
  await first;
  assert.equal(scene.calls.filter(([type]) => type === "target").length, 1);
  assert.equal(target.flags[scope].active, false);
});

test("attic lock reports missing targets and failed writes without a success notification", async t => {
  t.mock.method(console, "error", () => {});
  for (const missing of [true, false]) {
    const { scene, tile, errors, messages } = environment();
    if (missing) scene.tiles.delete("z3McV4vEe4hjeUX0");
    else scene.fail = "target";
    await toggleAtticLock(tile);
    assert.equal(errors.length, 1);
    assert.equal(messages.length, 0);
    assert.equal(scene._deathHouseAtticBusy, undefined);
  }
});

test("blackout batches the original effect and restores the exact previous state", async () => {
  const { scene, tile, errors } = environment();
  await scene.setFlag("fxmaster", "effects", { fog: { type: "fog", options: { density: 0.2 } } });
  const original = state(scene);
  await toggleBlackout(tile);
  assert.equal(errors.length, 0);
  const changes = scene.calls.filter(([type]) => ["AmbientLight", "AmbientSound", "Tile"].includes(type));
  assert.deepEqual(changes.map(([type, updates]) => [type, updates.length]), [["AmbientLight", 33], ["AmbientSound", 5], ["Tile", 4]]);
  assert.equal(scene.lights.get("tFmCpW7C316JZFAm").hidden, false);
  assert.equal(scene.lights.get("FrbTX9Z4UIpc9j97").hidden, true);
  assert.equal(scene.tiles.get("GgxqtH3ymunEzDIr").flags[scope].fileindex, 1);
  assert.equal(scene.getFlag("fxmaster", "effects"), undefined);
  await toggleBlackout(tile);
  assert.deepEqual(state(scene), original);
  assert.equal(scene.getFlag(namespace, "blackoutState"), undefined);
});

test("blackout has a deterministic dark state even when the GM changed individual lights or floors", async () => {
  const { scene, tile } = environment();
  scene.lights.get("FrbTX9Z4UIpc9j97").hidden = true;
  scene.lights.get("tFmCpW7C316JZFAm").hidden = false;
  scene.tiles.get("GgxqtH3ymunEzDIr").flags[scope].fileindex = 1;
  const original = state(scene);
  await toggleBlackout(tile);
  assert.equal(scene.lights.get("FrbTX9Z4UIpc9j97").hidden, true);
  assert.equal(scene.lights.get("tFmCpW7C316JZFAm").hidden, false);
  assert.equal(scene.tiles.get("GgxqtH3ymunEzDIr").flags[scope].fileindex, 1);
  await toggleBlackout(tile);
  assert.deepEqual(state(scene), original);
});

test("blackout suppresses concurrent clicks and its recovery survives a reload", async () => {
  const { scene, tile } = environment();
  const original = state(scene);
  let release;
  scene.gate = new Promise(resolve => { release = resolve; });
  const first = toggleBlackout(tile);
  await toggleBlackout(tile);
  release();
  await first;
  assert.equal(scene.calls.filter(([type]) => type === "AmbientLight").length, 1);
  // Only persisted data is needed to restore after a new session.
  const reloaded = environment();
  reloaded.scene.flags = clone(scene.flags);
  for (const key of ["lights", "sounds", "tiles"]) for (const [id, document] of scene[key]) {
    const { update, ...data } = document;
    reloaded.scene[key].set(id, clone(data));
  }
  await toggleBlackout(reloaded.tile);
  assert.deepEqual(state(reloaded.scene), original);
});

test("blackout validates every target before changing anything", async t => {
  t.mock.method(console, "error", () => {});
  const { scene, tile, errors } = environment();
  scene.lights.delete("FrbTX9Z4UIpc9j97");
  await toggleBlackout(tile);
  assert.equal(errors.length, 1);
  assert.deepEqual(scene.calls, []);
});

test("a failed blackout batch rolls back all affected collections", async t => {
  t.mock.method(console, "error", () => {});
  const { scene, tile, errors, messages } = environment();
  const original = state(scene);
  scene.fail = "AmbientSound";
  await toggleBlackout(tile);
  assert.deepEqual(state(scene), original);
  assert.equal(scene.getFlag(namespace, "blackoutState"), undefined);
  assert.equal(scene._deathHouseBlackoutBusy, undefined);
  assert.equal(errors.length, 1);
  assert.equal(messages.length, 0);
});

test("embedded MATT code executes the blackout without depending on the module API", async () => {
  const { scene, tile } = environment();
  const code = scene.tiles.get(buttonIds[2]).flags[scope].actions[0].data.code;
  await new Function("tile", code)(tile);
  assert.ok(scene.getFlag(namespace, "blackoutState"));
});

test("player users cannot operate the GM controls", async () => {
  const { scene, tile } = environment();
  game.user.isGM = false;
  await toggleAtticLock(tile);
  await toggleBlackout(tile);
  assert.deepEqual(scene.calls, []);
});

test("preloading caches the waltz and all eight floor variants on each client", async () => {
  const { scene } = environment();
  const audio = [], textures = [];
  globalThis.foundry = {
    audio: { AudioHelper: { preloadSound: async src => { audio.push(src); } } },
    canvas: { loadTexture: async src => { textures.push(src); } }
  };
  await preloadControls({ scene });
  assert.equal(audio.length, 1);
  assert.match(audio[0], /waltz-for-klara\.ogg$/);
  assert.equal(textures.length, 8);
  for (const src of [...audio, ...textures]) {
    assert.ok((await fs.stat(new URL(src.replace(`modules/${namespace}/`, ""), root))).size > 0);
  }
  await preloadControls({ scene: { tiles: new Map() } });
  assert.equal(audio.length, 1);
});

test("migration plans preserve GM activation choices, unrelated tiles and tokens", () => {
  const source = clone(manor);
  source.tokens = [{ _id: "existing-token", x: 2040, y: 2040, elevation: 10 }];
  const lock = source.tiles.find(tile => tile._id === buttonIds[0]);
  lock.flags[scope].active = false;
  lock.flags[scope].actions = [];
  const before = clone(source);
  const plan = planSceneControlUpdates(source);
  assert.deepEqual(source, before);
  assert.deepEqual(plan.tiles.map(tile => tile._id), [buttonIds[0]]);
  assert.equal(plan.tiles[0].flags[scope].active, false);
  assert.deepEqual(plan.backup.tiles, [lock]);
  assert.deepEqual(plan.regions, []);
});
