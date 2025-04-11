import { world, system} from "@minecraft/server"
import * as ui from "@minecraft/server-ui";
import {
  logfor,
} from "../lib/GametestFunctions.js";

system.runInterval(() => {

  for (let player of world.getPlayers()) {
    if (player.hasTag("home")) {
      HomeSystem(player);
      player.removeTag('home');
    }
  }
}, 1);

const CrearHome = async (player, homes, err = '') => {
    const homeLimitOff = world.getDynamicProperty('homeLimitOff') ?? false;
    const homeLimit = homeLimitOff ? 0 : world.getDynamicProperty('homeLimit') ?? 10;

    let fm = new ui.ModalFormData();
    fm.title("§lCrear Home");
    fm.textField(`Nombre del home\n${err}`, "Ingrese su nombre del Home");
    fm.submitButton('Crear');

    const response = await fm.show(player);
    if (!response.canceled) {
        if (response.formValues[0] == "") {
            player.playSound('note.pling');
            return CrearHome(player, homes, `>§cIngrese el nombre del home`);
        }
        if (homeLimit > 0 && Object.keys(homes).length >= homeLimit) {
            player.playSound('note.pling');
            return CrearHome(player, homes, `§c Has alcanzado el límite de Homes permitidos`);
        }
        if (Object.keys(homes).includes(response.formValues[0])) {
            player.playSound('note.pling');
            return CrearHome(player, homes, `§c Ya has nombrado §e${response.formValues[0]} §cde Home`);
        }
        
        homes[response.formValues[0]] = player.location;
        player.setDynamicProperty(`homeLocation_${response.formValues[0]}`, JSON.stringify(player.location));
        HomeDB.set(player.id, homes);
        player.playSound('random.orb');
        
        return logfor(
            player.nameTag,
            `§aHome establecido correctamente §a${response.formValues[0]}`
        );
    }
};
const deleteHome = async (player, homes, err='')=>{
  const homesList = Object.keys(homes);
      let fm = new ui.ModalFormData()
      .title("Eliminar Home")
      .dropdown(`Home \n${err}`, homesList.length == 0? ['§4Vacío']:homesList)
      .submitButton('Eliminar');

      const response = await fm.show(player)
      if(!response.canceled){
        const name = homesList[response.formValues[0]]
        if (homesList.length == 0) {
          return deleteHome(player, homes, ` §cNo tienes homes registrados Home`);
        }
player.setDynamicProperty(`homeLocation_${name}`, undefined);
        player.playSound('random.orb')
        return logfor(
          player.nameTag,
          `§aPunto del home §f${name}§a eliminado con éxito `
        );
      };      
}
const HomeSystem = async (player) => {
  const homes = {};
  player.getDynamicPropertyIds().filter(id => id.startsWith("homeLocation_")).forEach(home=>{
    homes[home.replace("homeLocation_", "")] = JSON.parse(player.getDynamicProperty(home));
  });
  const homeList = player.getDynamicPropertyIds().filter(id => id.startsWith("homeLocation_"));
  let fm = new ui.ActionFormData();
  fm.title("§lHOME");
  fm.body("");
  fm.button("§lCrear Home\n§rClick", "textures/ui/color_plus");
  fm.button("§lEliminar Home\n§rClick", "textures/ui/trash.png");

  if (homeList.length!=0) {
homeList.forEach(home => {
    let homeName = home.replace("homeLocation_", "");
    let homeCoords = homes[homeName];
    fm.button(
        `§l§8${homeName}\n§r§oCoordenadas: ${Math.trunc(homeCoords.x)} ${Math.trunc(homeCoords.y)} ${Math.trunc(homeCoords.z)}`,
        `textures/ui/world_glyph_color_2x.png`
    );
});
  }

  //@ts-ignore
  const response = await fm.show(player)
  if (!response.canceled) {
    if (response.selection == 0) {

      if (player.dimension.id != "minecraft:overworld") {
        player.playSound('note.pling')
        logfor(
          player.nameTag,
          `§cSolo se puede crear en el sethome en el en mundo`
        );
        return;
      } else {
        return CrearHome(player, homes)
      }
    }
    if (response.selection == 1) return deleteHome(player, homes);

const homeName = targetHome.replace("homeLocation_", "");
player.teleport(homes[homeName]);
      player.playSound('random.orb');
      logfor(
        player.nameTag,
        `§aFuiste enviado a §a${targetHome}`
      );
  }



const homeLimit = async (player) => {
    const f = new ui.ModalFormData()
        .dropdown('Selecciona el límite de homes', ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'])
        .toggle('Desactivar límite de homes', false)
        .submitButton('Guardar');

    const res = await f.show(player);
    if (!res.canceled) {
        world.setDynamicProperty('homeLimit', Number(res.formValues[0]));
        world.setDynamicProperty('homeLimitOff', res.formValues[1]);
        player.playSound('random.orb');
        logfor(player.nameTag, `§aCambios Guardados`);
    }
};



 
}

