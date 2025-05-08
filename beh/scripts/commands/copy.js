import { commandManager } from "./../commandManager.js"
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