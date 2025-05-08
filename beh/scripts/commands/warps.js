import { commandManager } from "./../commandManager.js"
commandManager.registerCommand(
  'warps',
  'Manage and interact with global warps',
  (context) => {
    const player = context.getSource();
    const args = context.getArguments();
    const option = args[0] || "list";  // Default to "list" if no option is provided
    const warpName = args[1];  // Warp name (if provided)

    if (option === "make") {
      if (!warpName) {
        tellPlayer("A warp needs a name, my friend. You can’t just call it ‘home’...", player);
        return;
      }

      const warpId = `warp_${warpName}`;
      const location = player.location;
      const dimension = player.dimension.id;
      const ownerId = player.id;

      // Save the warp globally
      world.setDynamicProperty(warpId, JSON.stringify({ location, dimension, ownerId }));

      const createMessages = [
        `Warp '${warpName}' created successfully! Now, go forth and explore, young adventurer.`,
        `Boom! Warp '${warpName}' is ready to teleport you to a better world.`,
        `Tada! Your very own warp, '${warpName}', is set up. Don't forget your suitcase.`,
        `Warp '${warpName}' created. Prepare to be whisked away to new adventures.`,
        `Welcome to warp '${warpName}' – your personal express lane.`,
        `Your warp, '${warpName}', is ready. But remember, no going back once you're in the unknown.`
      ];
      tellPlayer(createMessages[Math.floor(Math.random() * createMessages.length)], player);
      logger.info(`[commandManager] ${player.name} created a warp: ${warpName} at ${JSON.stringify(location)} in dimension ${dimension}`);

    } else if (option === "delete") {
      if (!warpName) {
        tellPlayer("You need to specify the warp you want to delete. No magic is happening without it.", player);
        return;
      }

      const warpId = `warp_${warpName}`;
      const warpData = world.getDynamicProperty(warpId);

      if (!warpData) {
        tellPlayer(`Uh-oh! Warp '${warpName}' doesn't exist... did you misplace it?`, player);
        return;
      }

      const { ownerId } = JSON.parse(warpData);

      if (ownerId !== player.id) {
        tellPlayer("You can't delete warps that aren't yours. That's just how the world works.", player);
        return;
      }

      // Set the dynamic property to undefined to delete it
      world.setDynamicProperty(warpId, undefined);

      const deleteMessages = [
        `Warp '${warpName}' has been deleted. Gone, like yesterday's dream.`,
        `RIP warp '${warpName}'. It lived a good life.`
        `Farewell, warp '${warpName}'. You shall be missed... for about a minute.`,
        `Warp '${warpName}' is no more. Like a forgotten memory in the wind.`,
        `The end of an era. Warp '${warpName}' has been deleted.`
      ];
      tellPlayer(deleteMessages[Math.floor(Math.random() * deleteMessages.length)], player);
      logger.info(`[commandManager] ${player.name} deleted a warp: ${warpName}`);

    } else if (option === "list") {
      const allWarpIds = world.getDynamicPropertyIds();
      const warpIds = allWarpIds.filter(id => id.startsWith("warp_"));

      if (warpIds.length === 0) {
        tellPlayer("No warps have been created yet. Looks like it's time to change that!", player);
        return;
      }

      const warpList = warpIds.map(warpId => {
        const warpData = world.getDynamicProperty(warpId);
        const { location, dimension, ownerId } = JSON.parse(warpData);
        return { warpId, location, dimension, ownerId };
      });

      const listMessages = [
        `Here are your global warps, adventurer:\n`,
        `Check out these warps. Choose wisely!\n`,
        `Welcome to the Warp Zone! Here are your options:\n`,
        `Ready for some teleportation? Here’s your warp list:\n`,
        `Feel the power of the warp! Check out these destinations:\n`
      ];

      const warpDetails = warpList.map(warp => {
        const { warpId, location, dimension, ownerId } = warp;
        const owner = world.getPlayer(ownerId)?.name || "Unknown";
        return `${warpId.replace("warp_", "")} - Location: ${JSON.stringify(location)} - Dimension: ${dimension} - Owner: ${owner}`;
      });

      tellPlayer(listMessages[Math.floor(Math.random() * listMessages.length)] + warpDetails.join("\n"), player);

    } else {
      tellPlayer("Sorry, didn’t quite catch that. Use 'make', 'delete', or 'list'.", player);
    }
  },
  [
    [{ name: 'option', type: 'string', optional: false, enum: ["make", "delete", "list"] }],
    [{ name: 'warpname', type: 'string', optional: true }]
  ],
  ['warps'],
  'all',
  false,
  false
);