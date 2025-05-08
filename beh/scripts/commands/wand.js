import { commandManager } from "./../commandManager.js"
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