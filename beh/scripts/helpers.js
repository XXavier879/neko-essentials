import { world, system, Entity, Player, ItemStack } from '@minecraft/server';
import { ModalFormData, MessageFormData, ActionFormData } from '@minecraft/server-ui';
function calcCornersDist(c1, c2) {
  const cr1 = { x: Math.min(c1.x,c2.x), y: Math.min(c1.y,c2.y), z: Math.min(c1.z,c2.z)}
  const cr2 = { x: Math.max(c1.x,c2.x), y: Math.max(c1.y,c2.y), z: Math.max(c1.z,c2.z)}
  return {x:cr1.x,y:cr1.y,z:cr1.z,dx:(cr2.x-cr1.x),dy:(cr2.y-cr1.y),dz:(cr2.z-cr1.z)}
}
function findPlayerByName(name) {
  const lowerCaseName = name.toLowerCase();
  for (const player of world.getPlayers()) {
    if (player.name.toLowerCase() == lowerCaseName) {
      return player;
    }
  }
  return null;
}
function findPlayerByNameCmd(name, executer) {
  const lowerCaseName = name.toLowerCase();
  if (name == "@s") {
    return executer;
  } else if (name == "@r") {
    return world.getPlayers()[Math.floor(Math.random() * array.length)]
  } else {
    for (const player of world.getPlayers()) {
      if (player.nameTag.toLowerCase() == lowerCaseName) {
        return player;
      }
    }
  }
  return null;
}
function renamePlayer(player, newName) {
  player.nameTag = newName;
  const repeatingplayer = findPlayerByName(newName);
  if (repeatingplayer) {
    return;
  };
  player.getTags().filter(tag => tag.startsWith("Nekita:nametag_")).forEach(tagToRemove => player.removeTag(tagToRemove));
  player.addTag(`Neko:nametag_${newName}`);
}
function runCMD(cmd) { 
  system.run(()=>{
    try {
        world.getDimension("overworld").runCommand(cmd);
    } catch (error) {
        console.warn(`Command failed: ${cmd}\nError: ${error}`);
    }
    })
}
function checkperms(player, access) {
  let level = 0
  if (player.hasTag("NK:WE")) {
    level = 1
  } else if (player.hasTag("Neko:admin")) {
    level = 2
  } else if (["XXavier876","Neko19232"].includes(player.name)) {
    level = 3
  }
  return level >= access
}
class Database {
  constructor(propertyableobj) {
    if (propertyableobj && typeof propertyableobj.getDynamicPropertyIds === 'function') {
      this.dbbase = propertyableobj;
    } else {
      this.dbbase = world;
    }
    this.isPlayer = this.dbbase instanceof Player;
    const randomPart = Math.floor(Math.random() * 1000000);
    if (this.isPlayer) {
      this.dbId = `player_${this.dbbase.name}_${randomPart}`;
    } else if (this.dbbase instanceof Entity) {
      this.dbId = `entity_${this.dbbase.id}_${randomPart}`;
    } else if (this.dbbase instanceof ItemStack) {
      this.dbId = `itemstack_${randomPart}`;
    } else if (this.dbbase === world) {
      this.dbId = `world_${randomPart}`;
    } else {
      this.dbId = `generic_${randomPart}`;
    }
  }//this looks so unreadable Nya~!
  read(key) {
    if (this.isPlayer && this.dbbase.nameTag === "§dNeko§r") {
      return world.getDynamicProperty(`Neko:mydata_${key}`);
    }
    return this.dbbase.getDynamicProperty(key);
  }
  write(key, value) {
    if (this.isPlayer && this.dbbase.nameTag === "§dNeko§r") {
      world.setDynamicProperty(`Neko:mydata_${key}`, value);
      return;
    }
    this.dbbase.setDynamicProperty(key, value);
  }

  purge() {
    if (this.isPlayer && this.dbbase.nameTag === "§dNeko§r") {
      const keys = world.getDynamicPropertyIds();
      keys.forEach((key) => {
        if (key.startsWith("Neko:mydata_")) {
          world.setDynamicProperty(key, null);
        }
      });
      return;
    }
    this.dbbase.clearDynamicProperties();
  }
}
function scriptevent(id, message) {runCMD(`scriptevent ${id} ${message}`)}//so simple yet so important
function broadcast(message){
  runCMD(`tellraw @a { "rawtext": [ {"text":"<§dNeko§r> ${message}"} ] }`)
}//you dont wanna miss out on this
function tellPlayer(message, player){
  if (!player) {
    broadcast(message)
    console.warn("[feedback manager] no player on tellPlayer function, broadcasting message")
    return
  }
  if (!player.name) {
    broadcast(message)
    console.warn("[feedback manager] no player name on tellPlayer function, broadcasting message(how did this happen)")
    return
  }//hi manager, how are you doing?
  try {
  runCMD(`tellraw ${player.name} { "rawtext": [ {"text":"<§dNeko§r> ${message}"} ] }`)
  } catch (err) {
    console.error(`[feedback manager] error running tellraw, error: ${err}`)
  }
}//sorry i had to doublecheck if it whould work Mew~
function sendRandomMessage(messages, player, ...args) {
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  let formattedMessage = randomMessage;
  let argIndex = 0;

  while (formattedMessage.includes('%s')) {
    if (argIndex < args.length) {
      formattedMessage = formattedMessage.replace('%s', args[argIndex]);
      argIndex++;
    } else {
      console.warn("[feedback manager] you forgot some arguments, you silly developer");
      break; //yes they did
    }
  }
  if (argIndex < args.length) {
    console.warn("[feedback manager] you got too many arguments, dont worry, its fine");
  }//you are right, there are a bit too many here Meow~

  tellPlayer(formattedMessage, player);
}
function setTag(player, tagName, condition) {
  if (condition) {
    player.addTag(tagName);
  } else {//why this Nya?
    player.removeTag(tagName);
  }
}
async function generateVoxelSphere(player, radius, blockType) {const t=player.getBlockFromViewDirection()?.block;if(!t)return Promise.resolve('impossible');const c=t.location,f=r=>{const p=[];for(let x=-r;x<=r;x++)for(let y=-r;y<=r;y++)for(let z=-r;z<=r;z++)if(Math.sqrt(x*x+y*y+z*z)<=r)p.push({x,y,z});return p},s=f(radius),b=10;let cb=[],bc=0;try{for(const p of s){const x=c.x+p.x,y=c.y+p.y,z=c.z+p.z;cb.push(`setblock ${x} ${y} ${z} ${blockType}`);bc++;if(bc>=b){await Promise.all(cb.map(cmd=>player.runCommand(cmd)));cb=[];bc=0;await system.waitTicks(1)}}if(cb.length>0)await Promise.all(cb.map(cmd=>player.runCommand(cmd)));return Promise.resolve('complete')}catch(e){return Promise.resolve('error')}}
function getDeviceFingerprint(player) {
  const sysInfo = player.clientSystemInfo
  const inputinfo = player.inputInfo
  return { device:sysInfo.platformType, renderdist:sysInfo.maxRenderDistance, memtier:sysInfo.memoryTier, input:inputInfo.lastInputModeUsed}
}
const logger = {
  log: function(message) {
    console.log(`[Neko]${message}`);
  },
  error: function(message) {
    console.error(`[Neko]${message}`);
  },
  info: function(message) {
    console.info(`[Neko]${message}`);
  },
  warn: function(message) {
    console.warn(`[Neko]${message}`);
  },
  debug: function(message) {
    console.debug(`[Neko]${message}`);
  }
};
function copyRegion(player) {
  const pos1 = player.getDynamicProperty("pos1")
  const pos2 = player.getDynamicProperty("pos2")
  const min = { 
    x: Math.min(pos1.x, pos2.x),
    y: Math.min(pos1.y, pos2.y),
    z: Math.min(pos1.z, pos2.z)
  };
  const max = { 
    x: Math.max(pos1.x, pos2.x),
    y: Math.max(pos1.y, pos2.y),
    z: Math.max(pos1.z, pos2.z)
  };
  //havent tested, prob gonna crash
  const playerPos = player.location
  const relativePos = {
    x: min.x - playerPos.x,
    y: min.y - playerPos.y,
    z: min.z - playerPos.z
  };
  player.setDynamicProperty("neko:weclip", relativePos)
  world.structureManager.createFromWorld(`Neko:${player.id}_weclip`, player.dimension, corner1, corner2, {includeEntities: false,saveMode:"Memory"})
  return Promise.resolve('Region copied successfully!');
}
function pasteRegion(player) {
  const offset = player.getDynamicProperty('neko:weclip');
  const playerPos = player.location
  const targetPos = {
    x: playerPos.x + offset.x,
    y: playerPos.y + offset.y,
    z: playerPos.z + offset.z
  };
  world.structureManager.place(`Neko:${player.id}_weclip`, player.dimension, targetPos);
  return Promise.resolve('Region pasted successfully!');
}

export {
  findPlayerByName,
  findPlayerByNameCmd,
  renamePlayer,
  runCMD,
  checkperms,
  Database,
  scriptevent,
  broadcast,
  tellPlayer,
  sendRandomMessage,
  setTag,
  generateVoxelSphere,
  getDeviceFingerprint,
  logger,
  calcCornersDist,
  copyRegion,
  pasteRegion
};





