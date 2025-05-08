import { world, system, Entity, Player, ItemStack } from '@minecraft/server';
import { ModalFormData, MessageFormData, ActionFormData } from '@minecraft/server-ui';
import { makePlugin } from "./lib/nkplugin.js"
const manifestHere = {
  name:"com.neko.fslib",
  version:"1.0.0",
  author:"Neko",
  namespaceCall:"cmnkfscall"
  namespaceListen:"cmnkfslisten"
}
makePlugin(manifestHere)


system.afterEvents.scriptEventReceive.subscribe((data) => {//What do we need this for Nya?
  let message = data.message
  let id = data.id
  const call = id.split(";")[1]
  const namespace = id.split(";")[0]
  if (namespace != "fslibreq") return;
  if (data.sourceType == "Server") {
    switch (call) {
      case 'case':
        // code
        break;
      
      default:
        // code
    }
  }
})



//for this we will use world.getDynamicPropertyIds,world.getDynamicProperty,world.setDynamicProperty
//world.getDimension("overworld").runCommand(`scriptevent fslibres:${responsetype} ${compiledData}`) to respond