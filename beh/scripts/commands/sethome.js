import { commandManager } from "./../commandManager.js"
commandManager.registerCommand(
  'sethome',
  'Set a home location',
  (context) => {
    const player = context.getSource();
    const args = context.getArguments();
    const dimension = player.dimension;
    const loc = player.location;

    if (loc.y <= -64) {
      tellPlayer("Isn't that a *little* bit in the void? You’d die setting home here.", player);
      logger.info(`[commandManager] ${player.name} tried to set home at y=${loc.y}, which is too low.`);
      return;
    }

    const homeName = args[0] ? `homeLocation_${args[0]}` : `homeLocation`;
    player.setDynamicProperty(homeName, JSON.stringify({ location: loc, dimension: dimension.id }));

    const blockBelow = dimension.getBlock({ x: loc.x, y: loc.y - 1, z: loc.z });
    const blockTwoBelow = dimension.getBlock({ x: loc.x, y: loc.y - 2, z: loc.z });

    if (blockBelow.isAir && blockTwoBelow.isAir) {
      tellPlayer("Cool place to set your home, but aren’t you floating right now?", player);
    }

    if (dimension.id === "nether") {
      const netherLines = [
        "Setting your home here? Bold move.",
        "Don't bring a bed here. Trust me.",
        "Smells like burning ambition.",
        "Hot real estate market, huh?",
        "You’re playing with fire... literally."
      ];
      tellPlayer(netherLines[Math.floor(Math.random() * netherLines.length)], player);
    } else if (dimension.id === "the_end") {
      const endLines = [
        "Isn't it a bit lonely here...",
        "Are you setting up camp in the void?",
        "Hmm... dragon hunting base?",
        "You want to *live* here?",
        "End of the world? More like start of the grind.",
        "The house at the end of the game, am I right?",
        ":3 :3 :3 :3 :3 :3 :3 :3 :3 :3",
        ":3 :3 :3 :3 :3 :3 :3 :3 :3 :3",
        ":3 :3 :3 :3 :3 :3 :3 :3 :3 :3"
      ];
      tellPlayer(endLines[Math.floor(Math.random() * endLines.length)], player);
    } else {
      const overworldLines = [
        "Nice spot! You building a castle?",
        "Home sweet home.",
        "Another cozy place in the wild.",
        "Hope this isn't next to a creeper party zone.",
        "You're gonna build something cool here, huh?",
        "Fresh start? Fresh vibes.",
        "Hmm... suspiciously scenic.",
        "Is this where the adventure begins?",
        "Smells like... base camp.",
        "Perfect view for sunsets and skeletons.",
        "Cozy vibes detected.",
        "That hill over there... planning something?"
      ];
      tellPlayer(overworldLines[Math.floor(Math.random() * overworldLines.length)], player);
    }

    logger.info(`[commandManager] ${player.name} set home at ${JSON.stringify(loc)} with name ${args[1] || "default"}`);
  },
  [
    [{ name: 'home', type: 'string', optional: true }]
  ],
  ['sethome'],
  'all',
  false,
  false
);