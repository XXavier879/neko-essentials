import { commandManager } from "./../commandManager.js"
commandManager.registerCommand(
  'info',
  'Show information about the plugin',
  (context) => {
    const player = context.getSource();
    player.sendMessage("Neko Commander\nV: 1.0.15\nRelease: false\nopensource: true");
    logger.info(`[commandManager] ${player.name} accessed info`);
  },
  [],
  ['info'], // Aliases
  'all', // Permission level
  false, // Not hidden
  false // No chat permissions required
);
