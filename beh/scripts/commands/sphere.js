import { commandManager } from "./../commandManager.js"
commandManager.registerCommand(
  'sphere',
  'Generate a voxel sphere with a block',
  (context) => {
    const player = context.getSource();
    const args = context.getArguments();
    
    generateVoxelSphere(player, parseInt(args[0]), args[1]).then(() => {
      const sphereMessages = [
        "Sphere generated successfully. It’s like you just made the world a little more... round.",
        "Voila! A voxel sphere. Hope you enjoy the geometry.",
        "And just like that, you’ve created a sphere. Who knew blocks could be so round?",
        "Bam! Your sphere is ready. Now all you need is a nice view.",
        "A perfect sphere! Even Minecraft blocks can have smooth curves."
      ];

      tellPlayer(sphereMessages[Math.floor(Math.random() * sphereMessages.length)], player);
      logger.info(`[commandManager] ${player.name} ran sphere with radius ${args[0]} and block ${args[1]}`);
    }).catch(() => {
      tellPlayer("Uhmmm, something went a bit wrong. Maybe try again?", player);
      logger.error(`[commandManager] ${player.name} failed to run sphere`);
    });
  },
  [
    [{ name: 'radius', type: 'int', optional: false }],
    [{ name: 'block', type: 'string', optional: false }]
  ],
  ['sphere'],
  'op',
  false,
  false
);