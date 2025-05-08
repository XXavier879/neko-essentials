import { commandManager } from "./../commandManager.js"
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