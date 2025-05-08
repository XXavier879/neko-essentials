import { commandManager } from "./../commandManager.js"
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