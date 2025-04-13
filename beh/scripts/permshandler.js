import { world, system, Entity, Player, ItemStack } from '@minecraft/server';
import { ModalFormData, MessageFormData, ActionFormData } from '@minecraft/server-ui';
const before = world.beforeEvents
const after = world.afterEvents
import {findPlayerByName,findPlayerByNameCmd,renamePlayer,runCMD,checkperms,Database,scriptevent,broadcast,tellPlayer,sendRandomMessage,setTag,generateVoxelSphere,logger} from './helpers.js'

// Handle left-click (break) for setting pos1
before.playerBreakBlock.subscribe((e) => {
  const player = e.player;
  const item = e.itemStack;
  const block = e.block;

  // Block breaking restriction
  if (player.hasTag("Neko:breakDenied")) {
    e.cancel = true;
    return;
  }

  // WorldEdit pos1 selection with wooden axe
  if (
    player.hasTag("Neko:Internal_SelectorEnabled") &&
    item?.type?.id === "minecraft:wooden_axe" &&
    block?.location
  ) {
    player.setDynamicProperty("WEpos1", JSON.stringify(block.location));
    e.cancel = true;
    tellPlayer("First position (pos1) set.", player);
  }
});

// Handle right-click (interact) for setting pos2
before.playerInteractWithBlock.subscribe((e) => {
  const player = e.player;
  const item = e.itemStack;
  const block = e.block;

  // Interaction restriction
  if (player.hasTag("Neko:interactDenied") || player.hasTag("Neko:interactBlockDenied")) {
    e.cancel = true;
    return;
  }

  // WorldEdit pos2 selection with wooden axe
  if (
    player.hasTag("Neko:Internal_SelectorEnabled") &&
    item?.type?.id === "minecraft:wooden_axe" &&
    block?.location
  ) {
    player.setDynamicProperty("WEpos2", JSON.stringify(block.location));
    e.cancel = true;
    tellPlayer("Second position (pos2) set.", player);
  }
});
before.playerInteractWithEntity.subscribe((e)=>{
  if (e.player.hasTag("Neko:interactDenied") || e.player.hasTag("Neko:interactEntityDenied")) {
    e.cancel = true
  }
})
after.playerPlaceBlock.subscribe((e)=>{
  if (e.player.hasTag("Neko:placeDenied")) {
    e.dimension.runCommand(`setblock ${e.block.location.x} ${e.block.location.y} ${e.block.location.z} air destroy`)
  }
})
after.playerBreakBlock.subscribe((data)=>{
  world.scoreboard.getObjective("blocksbroken").addScore(data.player.scoreboardIdentity, 1)
  world.scoreboard.getObjective("blockcount").addScore(data.player.scoreboardIdentity, -1)
})
after.playerPlaceBlock.subscribe((data)=>{
  world.scoreboard.getObjective("blocksplaced").addScore(data.player.scoreboardIdentity, 1)
  world.scoreboard.getObjective("blockcount").addScore(data.player.scoreboardIdentity, 1)
})
before.playerLeave.subscribe((data) => {
  logger.info(`[chat] §e${data.playerName} left the game`)
});
after.playerJoin.subscribe((data) => {
  logger.info(`[playerManager] ${data.playerName} is joining the game`)
})
after.playerGameModeChange.subscribe((data) => {
  data.player.removeTag("adventure")
  data.player.removeTag("creative")
  data.player.removeTag("spectator")
  data.player.removeTag("survival")
  data.player.addTag(data.toGameMode)
})
after.playerSpawn.subscribe(e => {
  var isJoin = false
  system.run(() => {
    const tags = e.player.getTags();
    const nekitaTags = tags.filter(tag => tag.startsWith("Neko:nametag_"));
    if (nekitaTags.length > 1) {
      const firstTag = nekitaTags[0];
      nekitaTags.slice(1).forEach(tagToRemove => e.player.removeTag(tagToRemove));
      const trimmedName = firstTag.replace("Neko:nametag_", "");
      e.player.nameTag = trimmedName;
    } else if (nekitaTags.length === 1) {
      e.player.nameTag = nekitaTags[0].replace("Neko:nametag_", "");
    } else {
      e.player.nameTag = e.player.name;
    }
  });
  if (e.initialSpawn) {
    const player=e.player
    const sysinf = e.player.clientSystemInfo;
    let platformType;
    player.removeTag("device:console")
    player.removeTag("device:pc")
    player.removeTag("device:mobile")
    player.removeTag("device:unknown")
    let deviceTag;
    switch (sysinf.platformType) {
      case "Console":
        platformType = "a Console";
        deviceTag = "device:console";
        break;
      case "Desktop":
        platformType = "a Desktop";
        deviceTag = "device:pc";
        break;
      case "Mobile":
        platformType = "a Mobile device";
        deviceTag = "device:mobile";//heh i know you are programming here in a phone Nya!
        break;
      default:
        platformType = "an Unknown device";
        deviceTag = "device:unknown";
    }
    logger.info(`[chat] §e${e.player.name} joined the game`)
    player.addTag(deviceTag);
    if (player.name === "SunsetCactus673") {
      player.addTag("Neko:nametag_Mr. Super Duper Cool Kitty")
    }
    return;
  }
  logger.info(`[playerManager] ${e.player.name} has respawned`)
});
after.playerDimensionChange.subscribe((data) => {
  data.player.removeTag("minecraft:the_end")
  data.player.removeTag("minecraft:nether")
  data.player.removeTag("minecraft:overworld")
  data.player.addTag(`${data.toDimension.id}`)//thats a place to travel to Mew~
  logger.info(`[playerManager] ${e.player.name} is traveling to ${data.toDimension.id}`)
})
after.playerEmote.subscribe((data) => {
  data.player.addTag(`emote.${data.personaPieceId}`)
  system.runTimeout(() => {
    data.player.removeTag(`emote.${data.personaPieceId}`)
  }, 1)//Emotes!??? In minecraft!??!?! what is this, fornite!??!?!?!
  const emoteIds = [
    "4c8ae710-df2e-47cd-814d-cc7bf21a3d67",
    "17428c4c-3813-4ea1-b3a9-d6a32f83afca",
    "9a469a61-c83b-4ba9-b507-bdbe64430582",
    "ce5c0300-7f03-455d-aaf1-352e4927b54d",
    "6d9f24c0-6246-4c92-8169-4648d1981cbb",
    "d7519b5a-45ec-4d27-997c-89d402c6b57f",
    "7cec98d8-55cc-44fe-b0ae-2672b0b2bd37",
    "86b34976-8f41-475b-a386-385080dc6e83",
    "05af18ca-920f-4232-83cb-133b2d913dd6",
    "48db5bc8-b360-6ffd-f034-d013918e157b",
    "1c082444-afe2-2223-7c7f-1d0e9fe5a5e0",
    "7e7efcf4-3100-1dea-b126-c89903492b35"
  ]
  const emoteMessages = [
    "${player.nameTag} is waving",
    "${player.nameTag} is asking everyone to Follow along",
    "${player.nameTag} is clapping",
    "${player.nameTag} is pointing over there",
    "${player.nameTag} faceplants",
    "${player.nameTag} is mining air",
    "${player.nameTag} is hammering away",
    "${player.nameTag} is feeling silly",
    "${player.nameTag} is underwater dancing",
    "${player.nameTag} is riding to victory",
    "${player.nameTag} is flying like a chicken",
    "${player.nameTag} is sending kisses to the crowd"
  ]
  const messageId = emoteIds.indexOf(data.personaPieceId);
  if (messageId !== -1) {
    const message = emoteMessages[messageId].replace("${player.nameTag}", data.player.name);
    logger.info(`[chat] ${message}`)
  } else {
    logger.info(`[chat] ${data.player.name} is using an undocumented emote, ${data.personaPieceId}`)
  }
})
after.entityDie.subscribe((data) => {
  logger.info(`[chat] ${data.deadEntity.name} died`)
  if (data.damageSource.damagingEntity instanceof Player) {
    world.scoreboard.getObjective("kills").addScore(data.damageSource.damagingEntity.scoreboardIdentity, 1)
    world.scoreboard.getObjective("lifeCount").addScore(data.damageSource.damagingEntity.scoreboardIdentity, 1)
  }
  world.scoreboard.getObjective("deaths").addScore(data.deadEntity.scoreboardIdentity, 1)
  world.scoreboard.getObjective("lifeCount").addScore(data.deadEntity.scoreboardIdentity, -1)
  world.scoreboard.getObjective("deathx").setScore(data.deadEntity.scoreboardIdentity, data.deadEntity.location.x)
  world.scoreboard.getObjective("deathy").setScore(data.deadEntity.scoreboardIdentity, data.deadEntity.location.y)
  world.scoreboard.getObjective("deathz").setScore(data.deadEntity.scoreboardIdentity, data.deadEntity.location.z)


}, {"entityTypes":["minecraft:player"]})
after.projectileHitBlock.subscribe((data) => {
  try {
    data.projectile?.addTag("Neko:landed");
  } catch (error) {}//why is this Mew~?
});
