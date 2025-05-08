import { commandManager } from "./../commandManager.js"
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