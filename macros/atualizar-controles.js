// Paste into a Foundry Script macro as GM, with the mansion or basement open.
if (!game.user.isGM) throw new Error("Esta macro deve ser executada pelo mestre.");
const current = canvas.scene;
if (!current) throw new Error("Abra a Mansão Durst ou as Masmorras dos Durst.");
const namespace = "escape-from-death-house-pt-br";
const { planSceneControlUpdates } = await import(`/modules/${namespace}/scripts/control-data.mjs`);
const stair = current.tiles.get("z3McV4vEe4hjeUX0") ?? current.tiles.get("EA2C6CaP7MzwnfCY");
if (!stair) throw new Error("Esta cena não contém a escada entre o sótão e o porão.");
const destination = stair.flags["monks-active-tiles"].actions.find(action => action.action === "teleport")?.data.location.sceneId;
const other = game.scenes.get(destination);
if (!other) throw new Error("A cena de destino da escada não foi encontrada. Importe as duas cenas.");
const plans = [current, other].map(scene => {
  if (scene.getFlag(namespace, "blackoutState")) throw new Error("Desative o blecaute antes de atualizar os controles.");
  return { scene, ...planSceneControlUpdates(scene.toObject()) };
});
for (const plan of plans) {
  if (!plan.tiles.length && !plan.regions.length) continue;
  if (!plan.scene.getFlag(namespace, "controlsBackup")) await plan.scene.setFlag(namespace, "controlsBackup", plan.backup);
  if (plan.tiles.length) await plan.scene.updateEmbeddedDocuments("Tile", plan.tiles);
  if (plan.regions.length) await plan.scene.updateEmbeddedDocuments("Region", plan.regions);
}
ui.notifications.info("Controles atualizados nas duas cenas. Recarregue os clientes para pré-carregar a valsa e os andares.");
