import { world, system } from '@minecraft/server';
import { ModalFormData } from '@minecraft/server-ui';
import { runCMD, scriptevent } from './helpers.js';

const pluginManifest = {
  name: "Nekoplugin",
  version: "1.0.9",
  author: "Neko",
  namespaceCall: "nekoplcall",
  namespaceListen: "nekopllisten"
};

// Function to show main UI with available commands
function showMainUI(player) {
  const form = new ModalFormData()
    .title("Neko Command Menu")
    .button("Set Position 1")
    .button("Set Position 2")
    .button("Fill Area (Set)")
    .button("Generate Sphere")
    .button("Set Home")
    .button("Teleport Home")
    .button("Credits")
    .button("Plugin Info");
  
  form.show(player).then(response => {
    if (!response.canceled) {
      handleMenuSelection(player, response.selection);
    }
  });
}

// Function to handle menu selection
function handleMenuSelection(player, selection) {
  switch (selection) {
    case 0: // Set Position 1
      player.setDynamicProperty("WEpos1", JSON.stringify(player.location));
      player.sendMessage("First position set.");
      break;
    case 1: // Set Position 2
      player.setDynamicProperty("WEpos2", JSON.stringify(player.location));
      player.sendMessage("Second position set.");
      break;
    case 2: // Fill Area (Set)
      showSetBlockUI(player);
      break;
    case 3: // Generate Sphere
      showSphereUI(player);
      break;
    case 4: // Set Home
      player.setDynamicProperty("homeLocation", JSON.stringify(player.location));
      player.sendMessage("Home location set successfully.");
      break;
    case 5: // Teleport Home
      teleportHome(player);
      break;
    case 6: // Credits
      player.sendMessage("§l§eCredits\n§bXXavier879: Programmed most of the addon.");
      break;
    case 7: // Plugin Info
      player.sendMessage("Neko Commander\nV: 1.0.14\nRelease: false\nopensource: true");
      break;
  }
}

// Function to show block selection UI for the /set command
function showSetBlockUI(player) {
  const form = new ModalFormData()
    .title("Set Block Type")
    .textField("Enter Block ID", "minecraft:stone");

  form.show(player).then(response => {
    if (!response.canceled) {
      let blockId = response.formValues[0];
      fillSelectedArea(player, blockId);
    }
  });
}

// Function to fill selected area
function fillSelectedArea(player, blockId) {
  let pos1 = JSON.parse(player.getDynamicProperty("WEpos1"));
  let pos2 = JSON.parse(player.getDynamicProperty("WEpos2"));
  if (!pos1 || !pos2) {
    player.sendMessage("You need to set both corners first.");
    return;
  }
  player.runCommandAsync(`fill ${pos1.x} ${pos1.y} ${pos1.z} ${pos2.x} ${pos2.y} ${pos2.z} ${blockId}`);
  player.sendMessage("Area filled successfully.");
}

// Function to show sphere generation UI
function showSphereUI(player) {
  const form = new ModalFormData()
    .title("Generate Sphere")
    .slider("Select Radius", 1, 10, 1, 5)
    .textField("Enter Block ID", "minecraft:stone");

  form.show(player).then(response => {
    if (!response.canceled) {
      let radius = response.formValues[0];
      let blockId = response.formValues[1];
      generateVoxelSphere(player, radius, blockId);
    }
  });
}

// Function to teleport home
function teleportHome(player) {
  let homeLocationRaw = player.getDynamicProperty("homeLocation");
  if (!homeLocationRaw) {
    player.sendMessage("You don't have a home set yet.");
    return;
  }
  let homeLocation = JSON.parse(homeLocationRaw);
  player.runCommandAsync(`tp @s ${homeLocation.x} ${homeLocation.y} ${homeLocation.z}`);
  player.sendMessage("Welcome home!");
}

// Register script event listener for UI button calls
system.afterEvents.scriptEventReceive.subscribe((data) => {
  if (data.id === "neko:call" && data.message === "plugins") {
    scriptevent(`neko:plugin`,[pluginManifest.name,pluginManifest.version,pluginManifest.author,pluginManifest.namespaceCall,pluginManifest.namespaceListen].join(";")))
    scriptevent(`${pluginManifest.namespaceListen}:addbtn`, "openUI;Open Command Menu");
  } else if (data.id === `${pluginManifest.namespaceCall}:btncall`) {
    showMainUI(data.source);
  }
});
