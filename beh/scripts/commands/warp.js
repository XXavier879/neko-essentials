import { commandManager } from "./../commandManager.js"
commandManager.registerCommand(
  'warp',
  'Teleport to a global warp location',
  (context) => {
    const player = context.getSource();
    const args = context.getArguments();
    const warpName = args[1];  // The warp name (if provided)

    if (!warpName) {
      // Randomly select a warp
      const allWarpIds = world.getDynamicPropertyIds();
      const warpIds = allWarpIds.filter(id => id.startsWith("warp_"));

      if (warpIds.length === 0) {
        tellPlayer("Looks like there are no warps set up yet! Go create one with /warps make.", player);
        return;
      }

      const randomWarpId = warpIds[Math.floor(Math.random() * warpIds.length)];
      const warpData = world.getDynamicProperty(randomWarpId);
      const { location, dimension } = JSON.parse(warpData);
      const worldDim = world.getDimension(dimension);
      player.teleport(location, worldDim);

      const randomWarpMessages = [
        `ZAP! Teleported to a random warp! Hope you enjoy the ride.`,
        `Whew, that was fast! You’ve arrived at a random warp location.`,
        `Zoom! You’ve been whisked away to a random warp. Where to next?`,
        `Teleportation successful! Random warp achieved.`,
        `Bam! A random warp teleported you. Check out the new view!`
      ];
      tellPlayer(randomWarpMessages[Math.floor(Math.random() * randomWarpMessages.length)], player);
      logger.info(`[commandManager] ${player.name} teleported to a random warp`);

    } else {
      // Specific warp teleport
      const warpId = `warp_${warpName}`;
      const warpData = world.getDynamicProperty(warpId);

      if (!warpData) {
        tellPlayer(`Oops! Warp '${warpName}' doesn’t exist. Try checking with /warps list.`, player);
        return;
      }

      const { location, dimension } = JSON.parse(warpData);
      const worldDim = world.getDimension(dimension);
      player.teleport(location, worldDim);

      const warpMessages = [
        `Boom! You’ve teleported to '${warpName}'.`,
        `Here you are, at warp '${warpName}'. Welcome to your new location.`,
        `Teleportation complete! Warp '${warpName}' achieved.`,
        `Zapped to warp '${warpName}'! Hope you packed a lunch.`,
        `You’ve made it! Welcome to warp '${warpName}'.`
      ];
      tellPlayer(warpMessages[Math.floor(Math.random() * warpMessages.length)], player);
      logger.info(`[commandManager] ${player.name} teleported to warp: ${warpName}`);
    }
  },
  [
    [{ name: 'warpname', type: 'string', optional: true }]
  ],
  ['warp'],
  'all',
  false,
  false
);