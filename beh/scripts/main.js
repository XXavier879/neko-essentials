import { world, system, Entity, Player, ItemStack } from '@minecraft/server';
import { ModalFormData, MessageFormData, ActionFormData } from '@minecraft/server-ui';
import './plugin.js'
import './chathandler.js'
import './permshandler.js'
import './nekocore_uicmd.js'
import {findPlayerByName,findPlayerByNameCmd,renamePlayer,runCMD,checkperms,Database,scriptevent,broadcast,tellPlayer,sendRandomMessage,setTag,generateVoxelSphere,logger} from './helpers.js'
let plugins = []
let admbtns = []
//i wrote this in just to make my life a bit easier
const before = world.beforeEvents
const after = world.afterEvents
system.run(()=>{
const scs=["deathx","deathy","deathz","lifeCount","kills","posX","posY","posZ","levelXP","slot","deaths","blocksbroken","blocksplaced","blockcount"];const mscs=scs.filter(o=>!world.scoreboard.getObjective(o));async function ascs(o){try{await world.scoreboard.addObjective(o);console.log(`Objective '${o}' created successfully.`)}catch(e){console.error(`Failed to create objective '${o}':`,e)}}mscs.forEach(ascs);
})
after.projectileHitBlock.subscribe((data) => {
  try {
    data.projectile?.addTag("Neko:landed");
  } catch (error) {}//why is this Mew~?
});
system.runInterval(() => {
  let players = world.getAllPlayers();
  players.forEach(player => {
    let tags = player.getTags();
    setTag(player, "sleeping", player.isSleeping);
    setTag(player, "sneaking", player.isSneaking);
    setTag(player, "inWater", player.isInWater);
    setTag(player, "falling", player.isFalling);
    setTag(player, "jumping", player.isJumping);
    setTag(player, "climbing", player.isClimbing);
    setTag(player, "onGround", player.isOnGround);
    setTag(player, "sprinting", player.isSprinting);
    setTag(player, "swimming", player.isSwimming);
    setTag(player, "emoting", player.isEmoting);
    setTag(player, "flying", player.isFlying);
    setTag(player, "gliding", player.isGliding);
    player.runCommand(`scoreboard players set @s posX ${Math.floor(player.location.x)}`);
    player.runCommand(`scoreboard players set @s posY ${Math.floor(player.location.y)}`);
    player.runCommand(`scoreboard players set @s posZ ${Math.floor(player.location.z)}`);
    player.runCommand(`scoreboard players set @s levelXP ${Math.floor(player.level)}`);
    player.runCommand(`scoreboard players set @s slot ${Math.floor(player.selectedSlotIndex)}`);
  });//a bit laggy right? but not that much Nya~
}, 1);
system.runInterval(() => {
  let players = world.getAllPlayers();
  players.forEach(player => {
    if (player.hasTag("Neko:kill")) {
      player.kill()//what do you mean kill Meow?
      player.removeTag("Neko:kill")
    }
    if (player.hasTag("Neko:extinguishFire")) {
      player.extinguishFire()
      player.removeTag("Neko:extinguishFire")
    }
    const tags = player.getTags();
    const nekitaTags = tags.filter(tag => tag.startsWith("Neko:nametag_"));
    if (nekitaTags.length > 1) {
      const firstTag = nekitaTags[0];
      nekitaTags.slice(1).forEach(tagToRemove => player.removeTag(tagToRemove));
      const trimmedName = firstTag.replace("Neko:nametag_", "");
      player.nameTag = trimmedName;
    } else if (nekitaTags.length === 1) {
      player.nameTag = nekitaTags[0].replace("Neko:nametag_", "");
    } else {
      player.nameTag = player.name;
    }
  })
}, world.ticksPerSecond)
before.itemUse.subscribe((data) => {
  if (data.itemStack.type.id === "neko:test_record") {
    data.cancel = true;
    const player = data.source;
    system.run(() => {
      const newcustomui = new ActionFormData()
        .title("Admin Options")
        .body("Here you can do Neko commands without using the command interface")
        .button("name")
        .button("reload")
        .button("sethome")
        .button("home")
        .button("pos1")
        .button("pos2")
        .button("set")
        .button("credits")
        .button("plugins")//yeah...
        .button("absolute placeholder") // Absolute cinema Nya~!
      admbtns.forEach(btn => {
        newcustomui.button(btn.label);
      });

      newcustomui.show(player).then((adres) => {
        const selectedBtnIndex = adres.selection;
        if (selectedBtnIndex <= 9) {
          switch (selectedBtnIndex) {
            case 0:
              showNameAdminUi(player);//i hope you are an admin to see this Nya!
              break;
            case 1:
              world.runCommand("reload");//Uhhhhhh wait while all addons get reloaded
              break;
            case 2:
              const homeLocation = player.location;
              player.setDynamicProperty("homeLocation", JSON.stringify(homeLocation));//nice house, can i have it
              break;
            case 3:
              const savedHomeLocation = JSON.parse(player.getDynamicProperty("homeLocation") || '{}');
              if (savedHomeLocation) {
                player.runCommand(`tp @s ${savedHomeLocation.x} ${savedHomeLocation.y} ${savedHomeLocation.z}`);
              }//and you feel eepy, and so do i, i cant make cat noises, its 4 am
              break;
            case 4:
              if (player.hasTag("NK:WE")) {
                player.setDynamicProperty("WEpos1", JSON.stringify(player.location));
              } else {
                tellPlayer("You can't do that", player);
              }//world edit is bundled here
              break;
            case 5:
              if (player.hasTag("NK:WE")) {
                player.setDynamicProperty("WEpos2", JSON.stringify(player.location));
              } else {
                tellPlayer("You can't do that", player);
              }//and we can see it here
              break;
            case 6:
              showSetAdminUi(player);//here you say what block u want
              break;
            case 7:
              player.sendMessage("§aEspañol");//que? como que español, baneenlos del server que nos robaron el oro Mew!
              player.sendMessage("§eCreditos:");
              player.sendMessage("§bXXavier876:");
              player.sendMessage("§2Desarrollador principal del mod");
              player.sendMessage("§bNekita3685:");
              player.sendMessage("§2Una alt de XXavier876");
              player.sendMessage("§bHhjkopro:");
              player.sendMessage("Dio la tremenda idea de que le haga su versión del addon, que se convirtió en Nekita essentials pro");
              player.sendMessage("§aEnglish");//Awww so cool
              player.sendMessage("§eCredits:");
              player.sendMessage("§bXXavier876:");
              player.sendMessage("§2Lead developer of the mod");
              player.sendMessage("§bNekita3685:");
              player.sendMessage("§2An alt account of XXavier876");
              player.sendMessage("§bHhjkopro:");
              player.sendMessage("Gave the great idea for me to make his own version of the addon, which became Nekita essentials pro");
              break;
            case 8:
              plugins.forEach(plugin => {
                player.sendMessage(`Plugin ${plugin.name} V ${plugin.version} by ${plugin.author}`)
              })
              break;
            case 9://this looks wrong
              player.sendMessage("§lOther addons that aren't by me");
              player.sendMessage("Better server, by platanito src (Procraft oficial)");
              break
          }
        }
        else {
          // Handle dynamic button selections
          const selectedDynamicBtn = admbtns[selectedBtnIndex - 10]; // Adjust index for dynamic buttons starting at 9th index
          scriptevent(`${selectedDynamicBtn.namespace}:btncall`, `${selectedDynamicBtn.message};${player.name}`);
        }
      });
    });
  }
});
function showNameAdminUi(player) {
  if (player.hasTag("Neko:admin")) {
    const nameAdminUi = new ModalFormData()
      .textField("Target", "Gamerbro777")
      .textField("New name", "random name")
      .show(player).then((adnawres) => {
        let target = findPlayerByName(adnawres.formValues[0]);
        if (target == null) {
          tellPlayer(`Couldn't find player ${adnawres.formValues[0]}`, player);
          return;
        }
        renamePlayer(target, adnawres.formValues[1]);
      });
  } else {
    tellPlayer("You can't do that", player);//yes you cant
  }
}
function showSetAdminUi(player) {
  if (player.hasTag("NK:WE")) {
    const setAdminUi = new ModalFormData()
      .title("!set")
      .textField("block", "stone")
      .show(player).then((adseres) => {
        let position1 = JSON.parse(player.getDynamicProperty("WEpos1"));
        let position2 = JSON.parse(player.getDynamicProperty("WEpos2"));
        player.runCommand(`fill ${position1.x} ${position1.y} ${position1.z} ${position2.x} ${position2.y} ${position2.z} ${adseres.formValues[0]}`);
      });
  } else {
    tellPlayer("You can't do that", player);
  }
}
scriptevent("neko:call","plugins")
logger.info(`[pluginManager] Calling all plugins to load`)
system.afterEvents.scriptEventReceive.subscribe((data) => {//What do we need this for Nya?
  let message = data.message
  let id = data.id
  const call = id.split(";")[1]
  if (data.sourceType == "Entity" && checkperms(player,3) || data.sourceType == "Server") {
    if (id === "neko:plugin") {
      const plugindata = message.split(";")
      const plugin = {
        name: plugindata[0],
        version: plugindata[1] || "1.0.0",
        author: plugindata[2] || "Unknown",
        namespaceCall: plugindata[3] || "nkplugini",
        namespaceListen: plugindata[4] || "nkplugino"
      };
      plugins.push(plugin);
      logger.info(`[pluginManager] Loaded plugin ${plugin.name}`)
    } if (call == "addbtn") {
      const btndata = message.split(";");
      const namespaceListen = id.split(":")[0];
      const plugin = plugins.find(p => {return p.namespaceListen === namespaceListen});
      if (!plugin) return;
      const btn = {
        message: btndata[0],
        label: btndata[1],
        namespace: plugin.namespaceCall
      };
      admbtns.push(btn);
      logger.info(`[pluginManager] ${plugin.name} added new button "${btn.label}`)
    } else if (call == "broadcast") {
      const namespaceListen = id.split(":")[0];
      const plugin = plugins.find(p => {return p.namespaceListen === namespaceListen});
      broadcast(`[${plugin.name}] ${message}`);
      logger.info(`[pluginManager] ${plugin.name} broadcasted "${message}`)
    } else if (call == "tell") {
      const data = message.split(";");
      const targetPlayer = findPlayerByName(data[0]); // Find the player
    
      if (targetPlayer) { // Ensure the player exists before sending the message
        const msg = `[${plugin.name}] ${message.substring(data[0].length + 1)}`; // Extract the actual message
        tellPlayer(msg, targetPlayer);
      }
    }
  }
})
