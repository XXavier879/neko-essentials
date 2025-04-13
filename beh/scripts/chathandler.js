import { world, system, Entity, Player, ItemStack } from '@minecraft/server';
import { checkperms, generateVoxelSphere, logger, tellPlayer, calcCornersDist, copyRegion, pasteRegion} from './helpers.js';
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

    const pos1Messages = [
      "Your first position is set. Time to carve out some space!",
      "Position one locked. Go on, make that magic happen.",
      "Poof! The first position is marked. Let the building begin.",
      "You’re now the proud owner of position one. Use it wisely!",
      "Boom! First position set. What are you gonna create now?"
    ];

    tellPlayer(pos1Messages[Math.floor(Math.random() * pos1Messages.length)], player);
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

    const pos2Messages = [
      "Second position is locked in. Let the WorldEdit begin!",
      "Poof! Second position set. You’re ready to create.",
      "Position two is all set. Go ahead, make some voxel magic.",
      "Got your second position! Let the building blocks fall.",
      "Second position is ready. This is gonna be epic."
    ];

    tellPlayer(pos2Messages[Math.floor(Math.random() * pos2Messages.length)], player);
  },
  [[{ name: 'position', type: 'rawtext', optional: false }]],
  ['pos2'],
  'op',
  false,
  false
);

// Register set Command (Fill selected area with a block)
commandManager.registerCommand(
  'set',
  'Fill the selected area with a block',
  (context) => {
    const player = context.getSource();
    const args = context.getArguments();
    
    if (args[1]) {
      const blockId = args[0], pos1 = JSON.parse(player.getDynamicProperty("WEpos1")), pos2 = JSON.parse(player.getDynamicProperty("WEpos2"));
      
      if (!pos1 || !pos2) {
        tellPlayer("Uhmmm, seems like you forgot a corner or two. Are you trying to build in the void?", player);
        logger.info(`[commandManager] ${player.name} tried to run set without setting both corners`);
      } else {
        player.runCommand(`fill ${pos1.x} ${pos1.y} ${pos1.z} ${pos2.x} ${pos2.y} ${pos2.z} ${blockId}`);
        
        const setMessages = [
          "Area filled with your chosen block. Feels like magic, right?",
          "All done! Your area is filled with *something*... that’s up to you.",
          "That should be enough to fill the void! Your block is now everywhere.",
          "Boom! Your world just got a little more filled with awesomeness.",
          "There you go! Your area is now filled. Enjoy the view!"
        ];

        tellPlayer(setMessages[Math.floor(Math.random() * setMessages.length)], player);
        logger.info(`[commandManager] ${player.name} ran set with block ${blockId} in area from ${JSON.stringify(pos1)} to ${JSON.stringify(pos2)}`);
      }
    } else {
      tellPlayer("What block exactly... got any ideas?", player);
    }
  },
  [
    [{ name: 'block', type: 'string', optional: false }]
  ],
  ['set'],
  'op',
  false,
  false
);
// Register sphere Command (Generate a voxel sphere)
commandManager.registerCommand(
  'sphere',
  'Generate a voxel sphere with a block',
  (context) => {
    const player = context.getSource();
    const args = context.getArguments();
    
    generateVoxelSphere(player, parseInt(args[0]), args[1]).then(() => {
      const sphereMessages = [
        "Sphere generated successfully. It’s like you just made the world a little more... round.",
        "Voila! A voxel sphere. Hope you enjoy the geometry.",
        "And just like that, you’ve created a sphere. Who knew blocks could be so round?",
        "Bam! Your sphere is ready. Now all you need is a nice view.",
        "A perfect sphere! Even Minecraft blocks can have smooth curves."
      ];

      tellPlayer(sphereMessages[Math.floor(Math.random() * sphereMessages.length)], player);
      logger.info(`[commandManager] ${player.name} ran sphere with radius ${args[0]} and block ${args[1]}`);
    }).catch(() => {
      tellPlayer("Uhmmm, something went a bit wrong. Maybe try again?", player);
      logger.error(`[commandManager] ${player.name} failed to run sphere`);
    });
  },
  [
    [{ name: 'radius', type: 'int', optional: false }],
    [{ name: 'block', type: 'string', optional: false }]
  ],
  ['sphere'],
  'op',
  false,
  false
);
commandManager.registerCommand(
  'copy',
  'Copy the selected region to your clipboard',
  (context) => {
    const player = context.getSource();
    copyRegion(player).then(() => {
      const copyMessages = [
        "Region copied successfully. Ready for some *paste* action?",
        "Boom! Your region is now copied. The world is your canvas.",
        "Done! The region is copied. Now, go on and paste it somewhere fun.",
        "That region? Copied. You can paste it wherever you want.",
        "Your region has been copied. Place it like a pro!"
      ];

      tellPlayer(copyMessages[Math.floor(Math.random() * copyMessages.length)], player);
      logger.info(`[commandManager] ${player.name} copied a region`);
    }).catch(() => {
      tellPlayer("Something went wrong while copying the region. Try again?", player);
      logger.error(`[commandManager] ${player.name} failed to copy region`);
    });
  },
  [],
  ['copy'],
  'op',
  false,
  false
);
commandManager.registerCommand(
  'paste',
  'Paste the copied region to a new location',
  (context) => {
    const player = context.getSource();
    pasteRegion(player).then(() => {
      const pasteMessages = [
        "Region pasted successfully. It’s like magic in block form!",
        "Bam! The region is pasted. You’ve just made the world a little bigger.",
        "Done! The copied region is now pasted. Enjoy the new creation.",
        "Your region is now placed. Let’s hope it doesn’t break anything!",
        "Voila! The copied region is now where you want it."
      ];

      tellPlayer(pasteMessages[Math.floor(Math.random() * pasteMessages.length)], player);
      logger.info(`[commandManager] ${player.name} pasted a region`);
    }).catch(() => {
      tellPlayer("Something went wrong while pasting the region. Careful with those blocks!", player);
      logger.error(`[commandManager] ${player.name} failed to paste region`);
    });
  },
  [],
  ['paste'],
  'op',
  false,
  false
);
// Register wand Command (Toggle Neko:Internal_SelectorEnabled tag)
commandManager.registerCommand(
  'wand',
  'Toggle the WorldEdit wooden axe functionality for faster selection',
  (context) => {
    const player = context.getSource();
    const playerName = player.name;

    // Check if the player already has the tag
    const hasTag = player.hasTag('Neko:Internal_SelectorEnabled');

    if (hasTag) {
      // Remove the tag to disable the feature
      player.removeTag('Neko:Internal_SelectorEnabled');
      const disableMessages = [
        "Your WorldEdit wooden axe selection tool is now disabled. Take it slow!",
        "Woah! No more fast selections for you. Try selecting manually.",
        "The axe selector functionality is off. You're back to normal selection speed.",
        "No more wooden axe magic. You're on your own for selections now.",
        "Axe selector disabled. Back to the old ways of selecting!"
      ];
      tellPlayer(disableMessages[Math.floor(Math.random() * disableMessages.length)], player);
      logger.info(`[commandManager] ${playerName} disabled the wooden axe functionality (Neko:Internal_SelectorEnabled)`);
    } else {
      // Add the tag to enable the feature
      player.addTag('Neko:Internal_SelectorEnabled');
      const enableMessages = [
        "Your WorldEdit wooden axe selection tool is now enabled. Speedy selections ahead!",
        "Bam! The wooden axe selector is now active. Select faster than ever!",
        "Axe selector enabled! Get ready for some quick area selection.",
        "The wooden axe functionality is now turned on. Go ahead, select with ease.",
        "You’ve activated the WorldEdit wooden axe. Selection speed: boosted!"
      ];
      tellPlayer(enableMessages[Math.floor(Math.random() * enableMessages.length)], player);
      logger.info(`[commandManager] ${playerName} enabled the wooden axe functionality (Neko:Internal_SelectorEnabled)`);
    }
  },
  [],
  ['wand'],
  'op',
  false,
  false
);
// Register Home Commands

commandManager.registerCommand(
  'sethome',
  'Set a home location',
  (context) => {
    const player = context.getSource();
    const args = context.getArguments();
    const dimension = player.dimension;
    const loc = player.location;

    if (loc.y <= -64) {
      tellPlayer("Isn't that a *little* bit in the void? You’d die setting home here.", player);
      logger.info(`[commandManager] ${player.name} tried to set home at y=${loc.y}, which is too low.`);
      return;
    }

    const homeName = args[0] ? `homeLocation_${args[0]}` : `homeLocation`;
    player.setDynamicProperty(homeName, JSON.stringify({ location: loc, dimension: dimension.id }));

    const blockBelow = dimension.getBlock({ x: loc.x, y: loc.y - 1, z: loc.z });
    const blockTwoBelow = dimension.getBlock({ x: loc.x, y: loc.y - 2, z: loc.z });

    if (blockBelow.isAir && blockTwoBelow.isAir) {
      tellPlayer("Cool place to set your home, but aren’t you floating right now?", player);
    }

    if (dimension.id === "nether") {
      const netherLines = [
        "Setting your home here? Bold move.",
        "Don't bring a bed here. Trust me.",
        "Smells like burning ambition.",
        "Hot real estate market, huh?",
        "You’re playing with fire... literally."
      ];
      tellPlayer(netherLines[Math.floor(Math.random() * netherLines.length)], player);
    } else if (dimension.id === "the_end") {
      const endLines = [
        "Isn't it a bit lonely here...",
        "Are you setting up camp in the void?",
        "Hmm... dragon hunting base?",
        "You want to *live* here?",
        "End of the world? More like start of the grind.",
        "The house at the end of the game, am I right?",
        ":3 :3 :3 :3 :3 :3 :3 :3 :3 :3",
        ":3 :3 :3 :3 :3 :3 :3 :3 :3 :3",
        ":3 :3 :3 :3 :3 :3 :3 :3 :3 :3"
      ];
      tellPlayer(endLines[Math.floor(Math.random() * endLines.length)], player);
    } else {
      const overworldLines = [
        "Nice spot! You building a castle?",
        "Home sweet home.",
        "Another cozy place in the wild.",
        "Hope this isn't next to a creeper party zone.",
        "You're gonna build something cool here, huh?",
        "Fresh start? Fresh vibes.",
        "Hmm... suspiciously scenic.",
        "Is this where the adventure begins?",
        "Smells like... base camp.",
        "Perfect view for sunsets and skeletons.",
        "Cozy vibes detected.",
        "That hill over there... planning something?"
      ];
      tellPlayer(overworldLines[Math.floor(Math.random() * overworldLines.length)], player);
    }

    logger.info(`[commandManager] ${player.name} set home at ${JSON.stringify(loc)} with name ${args[1] || "default"}`);
  },
  [
    [{ name: 'home', type: 'string', optional: true }]
  ],
  ['sethome'],
  'all',
  false,
  false
);

commandManager.registerCommand(
  'home',
  'Teleport to your home location',
  (context) => {
    const player = context.getSource();
    const args = context.getArguments();
    const homeName = args[1] ? `homeLocation_${args[1]}` : `homeLocation`;
    const homeData = player.getDynamicProperty(homeName);

    if (!homeData) {
      tellPlayer("That home doesn’t exist. Set it first before trying to go there!", player);
      return;
    }

    const { location, dimension } = JSON.parse(homeData);
    const worldDim = world.getDimension(dimension);
    player.teleport(location, worldDim);

    const homeMessages = [
      "Whoosh! Back home you go.",
      "Home sweet home. Smells like nostalgia.",
      "Teleporting... please keep your hands and feet inside the ride.",
      "That warm fuzzy feeling? Yeah, you're home.",
      "Your humble abode awaits.",
      "Behold! Your kingdom.",
      "You better not have left the door open.",
      "Hope your pets missed you.",
      "Zooooop. You’re back.",
      "It’s like you never left."
    ];

    tellPlayer(homeMessages[Math.floor(Math.random() * homeMessages.length)], player);
    logger.info(`[commandManager] ${player.name} teleported to home: ${homeName}`);
  },
  [
    [{ name: 'home', type: 'string', optional: true }]
  ],
  ['home'],
  'all',
  false,
  false
);

commandManager.registerCommand(
  'listhomes',
  'List all your saved home locations',
  (context) => {
    const player = context.getSource();
    const allIds = player.getDynamicPropertyIds();
    const homeIds = allIds.filter(id => id.startsWith("homeLocation"));

    if (homeIds.length === 0) {
      tellPlayer("You don’t have any homes saved. Use /sethome to make one!", player);
      return;
    }

    const names = homeIds.map(id => id.replace("homeLocation_", "") || "default");
    tellPlayer("Your saved homes: " + names.join(", "), player);
    logger.info(`[commandManager] ${player.name} listed homes: ${names.join(", ")}`);
  },
  [],
  ['homes', 'myhomes'],
  'all',
  false,
  false
);

commandManager.registerCommand(
  'warps',
  'Manage and interact with global warps',
  (context) => {
    const player = context.getSource();
    const args = context.getArguments();
    const option = args[0] || "list";  // Default to "list" if no option is provided
    const warpName = args[1];  // Warp name (if provided)

    if (option === "make") {
      if (!warpName) {
        tellPlayer("A warp needs a name, my friend. You can’t just call it ‘home’...", player);
        return;
      }

      const warpId = `warp_${warpName}`;
      const location = player.location;
      const dimension = player.dimension.id;
      const ownerId = player.id;

      // Save the warp globally
      world.setDynamicProperty(warpId, JSON.stringify({ location, dimension, ownerId }));

      const createMessages = [
        `Warp '${warpName}' created successfully! Now, go forth and explore, young adventurer.`,
        `Boom! Warp '${warpName}' is ready to teleport you to a better world.`,
        `Tada! Your very own warp, '${warpName}', is set up. Don't forget your suitcase.`,
        `Warp '${warpName}' created. Prepare to be whisked away to new adventures.`,
        `Welcome to warp '${warpName}' – your personal express lane.`,
        `Your warp, '${warpName}', is ready. But remember, no going back once you're in the unknown.`
      ];
      tellPlayer(createMessages[Math.floor(Math.random() * createMessages.length)], player);
      logger.info(`[commandManager] ${player.name} created a warp: ${warpName} at ${JSON.stringify(location)} in dimension ${dimension}`);

    } else if (option === "delete") {
      if (!warpName) {
        tellPlayer("You need to specify the warp you want to delete. No magic is happening without it.", player);
        return;
      }

      const warpId = `warp_${warpName}`;
      const warpData = world.getDynamicProperty(warpId);

      if (!warpData) {
        tellPlayer(`Uh-oh! Warp '${warpName}' doesn't exist... did you misplace it?`, player);
        return;
      }

      const { ownerId } = JSON.parse(warpData);

      if (ownerId !== player.id) {
        tellPlayer("You can't delete warps that aren't yours. That's just how the world works.", player);
        return;
      }

      // Set the dynamic property to undefined to delete it
      world.setDynamicProperty(warpId, undefined);

      const deleteMessages = [
        `Warp '${warpName}' has been deleted. Gone, like yesterday's dream.`,
        `RIP warp '${warpName}'. It lived a good life.`
        `Farewell, warp '${warpName}'. You shall be missed... for about a minute.`,
        `Warp '${warpName}' is no more. Like a forgotten memory in the wind.`,
        `The end of an era. Warp '${warpName}' has been deleted.`
      ];
      tellPlayer(deleteMessages[Math.floor(Math.random() * deleteMessages.length)], player);
      logger.info(`[commandManager] ${player.name} deleted a warp: ${warpName}`);

    } else if (option === "list") {
      const allWarpIds = world.getDynamicPropertyIds();
      const warpIds = allWarpIds.filter(id => id.startsWith("warp_"));

      if (warpIds.length === 0) {
        tellPlayer("No warps have been created yet. Looks like it's time to change that!", player);
        return;
      }

      const warpList = warpIds.map(warpId => {
        const warpData = world.getDynamicProperty(warpId);
        const { location, dimension, ownerId } = JSON.parse(warpData);
        return { warpId, location, dimension, ownerId };
      });

      const listMessages = [
        `Here are your global warps, adventurer:\n`,
        `Check out these warps. Choose wisely!\n`,
        `Welcome to the Warp Zone! Here are your options:\n`,
        `Ready for some teleportation? Here’s your warp list:\n`,
        `Feel the power of the warp! Check out these destinations:\n`
      ];

      const warpDetails = warpList.map(warp => {
        const { warpId, location, dimension, ownerId } = warp;
        const owner = world.getPlayer(ownerId)?.name || "Unknown";
        return `${warpId.replace("warp_", "")} - Location: ${JSON.stringify(location)} - Dimension: ${dimension} - Owner: ${owner}`;
      });

      tellPlayer(listMessages[Math.floor(Math.random() * listMessages.length)] + warpDetails.join("\n"), player);

    } else {
      tellPlayer("Sorry, didn’t quite catch that. Use 'make', 'delete', or 'list'.", player);
    }
  },
  [
    [{ name: 'option', type: 'string', optional: false, enum: ["make", "delete", "list"] }],
    [{ name: 'warpname', type: 'string', optional: true }]
  ],
  ['warps'],
  'all',
  false,
  false
);

commandManager.registerCommand(
  'warp',
  'Teleport to a global warp location',
  (context) => {
    const player = context.getSource();
    const args = context.getArguments();
    const warpName = args[1];  // The warp name (if provided)

    if (!warpName) {
      // Randomly select a warp
      const allWarpIds = world.getDynamicPropertyIds();
      const warpIds = allWarpIds.filter(id => id.startsWith("warp_"));

      if (warpIds.length === 0) {
        tellPlayer("Looks like there are no warps set up yet! Go create one with /warps make.", player);
        return;
      }

      const randomWarpId = warpIds[Math.floor(Math.random() * warpIds.length)];
      const warpData = world.getDynamicProperty(randomWarpId);
      const { location, dimension } = JSON.parse(warpData);
      const worldDim = world.getDimension(dimension);
      player.teleport(location, worldDim);

      const randomWarpMessages = [
        `ZAP! Teleported to a random warp! Hope you enjoy the ride.`,
        `Whew, that was fast! You’ve arrived at a random warp location.`,
        `Zoom! You’ve been whisked away to a random warp. Where to next?`,
        `Teleportation successful! Random warp achieved.`,
        `Bam! A random warp teleported you. Check out the new view!`
      ];
      tellPlayer(randomWarpMessages[Math.floor(Math.random() * randomWarpMessages.length)], player);
      logger.info(`[commandManager] ${player.name} teleported to a random warp`);

    } else {
      // Specific warp teleport
      const warpId = `warp_${warpName}`;
      const warpData = world.getDynamicProperty(warpId);

      if (!warpData) {
        tellPlayer(`Oops! Warp '${warpName}' doesn’t exist. Try checking with /warps list.`, player);
        return;
      }

      const { location, dimension } = JSON.parse(warpData);
      const worldDim = world.getDimension(dimension);
      player.teleport(location, worldDim);

      const warpMessages = [
        `Boom! You’ve teleported to '${warpName}'.`,
        `Here you are, at warp '${warpName}'. Welcome to your new location.`,
        `Teleportation complete! Warp '${warpName}' achieved.`,
        `Zapped to warp '${warpName}'! Hope you packed a lunch.`,
        `You’ve made it! Welcome to warp '${warpName}'.`
      ];
      tellPlayer(warpMessages[Math.floor(Math.random() * warpMessages.length)], player);
      logger.info(`[commandManager] ${player.name} teleported to warp: ${warpName}`);
    }
  },
  [
    [{ name: 'warpname', type: 'string', optional: true }]
  ],
  ['warp'],
  'all',
  false,
  false
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
      player.runCommand(`tellraw @a { "rawtext": [ { "text": "<${playerName}> ${message}${randomSuffix}"}]}`); 
      logger.info(`[chat] <${pname}> ${message}${randomSuffix}`);
    } else { 
      player.runCommand(`tellraw @a { "rawtext": [ { "text": "<${playerName}> ${m}"}]}`); 
      logger.info(`[chat] <${pname}> ${m}`);
    }
  }); 
});