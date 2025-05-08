import { commandManager } from "./../commandManager.js"
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