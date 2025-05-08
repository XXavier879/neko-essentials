import { commandManager } from "./../commandManager.js"
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
