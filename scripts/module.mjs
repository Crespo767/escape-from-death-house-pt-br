const MODULE_ID = "escape-from-death-house-pt-br";
const FOLDER_NAME = "CoS: Reloaded | Fuga da Casa da Morte PT-BR";
const PACKS = [
  "cosrl-arca-adventure",
  "cosrl-arca-scenes",
  "cosrl-arca-actors",
  "cosrl-arca-items",
  "cosrl-arca-journals",
  "cosrl-arca-tables",
  "cosrl-arca-macros"
];

async function organizeCompendiumFolder() {
  if (!game.user?.isGM) return;

  try {
    // 1. Localiza a pasta de compêndios existente ou cria caso ainda não exista
    let folder = game.folders.find(f => f.type === "Compendium" && f.name === FOLDER_NAME);
    if (!folder) {
      folder = await Folder.create({
        name: FOLDER_NAME,
        type: "Compendium",
        sorting: "a",
        color: "#6b21a8"
      });
    }

    if (!folder) return;

    // 2. Garante que todos os 7 pacotes do módulo estejam inseridos na pasta
    for (const packName of PACKS) {
      const collection = `${MODULE_ID}.${packName}`;
      const pack = game.packs.get(collection);
      if (pack && pack.folder?.id !== folder.id) {
        await pack.configure({ folder: folder.id }).catch(err => {
          console.warn(`${MODULE_ID} | Falha ao mover compêndio ${packName} para a pasta:`, err);
        });
      }
    }
  } catch (err) {
    console.warn(`${MODULE_ID} | Erro ao organizar pastas de compêndio:`, err);
  }
}

Hooks.once("ready", async () => {
  await organizeCompendiumFolder();
});
