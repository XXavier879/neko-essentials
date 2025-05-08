import { commandManager } from "./../commandManager.js"
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