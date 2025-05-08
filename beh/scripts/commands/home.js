import { commandManager } from "./../commandManager.js"
commandManager.registerCommand(
  'home',
  'Teleport to your home location',
  (context) => {
    const player = context.getSource();
    const args = context.getArguments();
    const homeName = args[1] ? `homeLocation_${args[1]}` : `homeLocation`;
    const homeData = player.getDynamicProperty(homeName);

    if (!homeData) {
      tellPlayer("That home doesn’t exist. Set it first before trying to go there!", player);
      return;
    }

    const { location, dimension } = JSON.parse(homeData);
    const worldDim = world.getDimension(dimension);
    player.teleport(location, worldDim);

    const homeMessages = [
      "Whoosh! Back home you go.",
      "Home sweet home. Smells like nostalgia.",
      "Teleporting... please keep your hands and feet inside the ride.",
      "That warm fuzzy feeling? Yeah, you're home.",
      "Your humble abode awaits.",
      "Behold! Your kingdom.",
      "You better not have left the door open.",
      "Hope your pets missed you.",
      "Zooooop. You’re back.",
      "It’s like you never left."
    ];

    tellPlayer(homeMessages[Math.floor(Math.random() * homeMessages.length)], player);
    logger.info(`[commandManager] ${player.name} teleported to home: ${homeName}`);
  },
  [
    [{ name: 'home', type: 'string', optional: true }]
  ],
  ['home'],
  'all',
  false,
  false
);
