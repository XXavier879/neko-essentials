import { commandManager } from "./../commandManager.js"
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
