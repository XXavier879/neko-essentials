import { world, system} from '@minecraft/server';
const pluginManifest = {
  name: "/dev/sda1",
  version: "1.0.11",
  author: "XXavier876 and Neko",
  namespaceCall: "debc",
  namespaceListen: "debl"
}
import {runCMD,scriptevent, findPlayerByName, checkperms} from './helpers.js'
import { ModalFormData, MessageFormData, ActionFormData } from '@minecraft/server-ui';


system.afterEvents.scriptEventReceive.subscribe((data) => {
  let message = data.message
  let id = data.id;
  const namespace = id.split(":")[0];
  const ctype = id.split(":")[1];

  if (id === "neko:call") {
    if (message === "plugins") {
      const pluginData = `${pluginManifest.name};${pluginManifest.version};${pluginManifest.author};${pluginManifest.namespaceCall};${pluginManifest.namespaceListen}`;
      scriptevent("neko:plugin", pluginData);
      scriptevent(`${pluginManifest.namespaceListen}:addbtn`, "message;Debug");
    }
  } else if (namespace === pluginManifest.namespaceCall) {
    if (ctype === "btncall") {
      showPerms(findPlayerByName(message.split(";")[1]))
    }
  }
});

function showPerms(player) {
  // Check if the player has permission level 3
  if (checkperms(player, 3)) {
    const ui = new ActionFormData();
    ui.title("Developer menu");
    ui.body("Cool, why is this here tho?");
    ui.button("Structure Manager");
    ui.button("Player Manager");
    ui.button("Dynamic property manager");
    ui.button("Music Manager");
    ui.show(player).then(dt=>{
      console.log(JSON.stringify(dt))
      if (dt.selection == 2){
        showDynamicEditingOptions(player)
      } else {console.log(dt.response)}
    })
    // Show the UI to the player
  }
}

function showDynamicEditingOptions(player) {
  // This UI allows the player to select what type of object to edit
  const uinenew = new ActionFormData();
  uinenew.title("Select Object Type To Edit");
  uinenew.button("World"); // To run const property = showPropertiesForm(player, world) and then showPropertyEditor(player, world, property)
  uinenew.button("Player"); // To run const target = showPlayersForm(player) and then const property = showPropertiesForm(player, target) and finally showPropertyEditor(player, target, property)
  uinenew.button("Item In Hand"); // To run const property = showPropertiesForm(player, item) then showPropertyEditor(player, item, property)
  
  uinenew.show(player).then(response => {
    if (response.selection === null) return; // If the player doesn't select anything, return

    // Handle the selection based on the button clicked
    if (response.selection === 0) {
      // World selected
      showPropertiesForm(player, world).then(property => {
        if (property) showPropertyEditor(player, world, property); // Show the property editor for the selected property
      });
    } else if (response.selection === 1) {
      // Player selected
      showPlayersForm(player).then(target => {
        if (target) {
          showPropertiesForm(player, target).then(property => {
            if (property) showPropertyEditor(player, target, property); // Show the property editor for the selected player's property
          });
        }
      });
    } else if (response.selection === 2) {
      // Item In Hand selected
      const item = player.getComponent("minecraft:inventory").getItem(player.selectedSlot)
      showPropertiesForm(player, item).then(property => {
        if (property) showPropertyEditor(player, item, property); // Show the property editor for the selected item's property
      });
    }
  });
}

function showPlayersForm(player) {
  // Show the list of players to choose from
  const pform = new ActionFormData();
  const players = world.getPlayers();
  players.forEach(p => {
    pform.button(p.name);
  });
  return pform.show(player).then((response) => {
    if (response.selection === null) {
      return null; // If no player is selected, return null
    } else {
      const selectedPlayer = players[response.selection];
      return selectedPlayer; // Return the selected player
    }
  });
}

// Assuming the "tellPlayer" from helpers.js is already imported

function showPropertiesForm(player, object) {
  const propertyIds = object.getDynamicPropertyIds();
  const propertyForm = new ActionFormData()
    .title("Select Property")
    .body("Choose a property to edit, or add/remove properties.")
    .button("§bAdd New Property")
    .button("§4Delete Property");

  // Add buttons for each existing property ID
  propertyIds.forEach(id => {
    propertyForm.button(id);
  });

  // Show the form to the player
  return propertyForm.show(player).then(response => {
    if (response.selection === null) return null; // If no selection, return null

    if (response.selection === 0) {
      // "Add New Property" button clicked
      showAddNewPropertyForm(player, object);
    } else if (response.selection === 1) {
      // "Delete Property" button clicked
      showDeletePropertyForm(player, object);
    } else {
      // Return the selected property ID
      return propertyIds[response.selection - 2]; // Adjust index due to extra buttons
    }
  });
}

function showAddNewPropertyForm(player, object) {
  // Show the UI to enter a new property ID
  const addPropertyForm = new ModalFormData()
    .title("Add New Property")
    .textbox("Enter new Dynamic Property ID:", "", "")
    .show(player)
    .then(response => {
      const newPropertyId = response.formValues[0];
      if (newPropertyId) {
        object.setDynamicProperty(newPropertyId, ""); // Add the new property with an empty value
        tellPlayer(`Property "${newPropertyId}" added!`, player); // Using your pre-defined tellPlayer
        showPropertiesForm(player, object); // Refresh the property list
      } else {
        tellPlayer("Invalid property ID!", player); // Inform if no ID was provided
      }
    });
}

function showDeletePropertyForm(player, object) {
  const propertyIds = object.getDynamicPropertyIds();
  
  // Show a UI to select a property to delete
  const deleteForm = new ActionFormData()
    .title("Select Property to Delete")
    .body("Choose a property to delete.")
    .button("Cancel");
  
  // Add buttons for each existing property ID
  propertyIds.forEach(id => {
    deleteForm.button(id);
  });

  return deleteForm.show(player).then(response => {
    if (response.selection === null || response.selection === 0) return; // Cancel or no selection

    const propertyToDelete = propertyIds[response.selection - 1]; // Adjust index
    object.removeDynamicProperty(propertyToDelete); // Remove the selected property
    tellPlayer(`Property "${propertyToDelete}" deleted!`, player); // Inform the player
    showPropertiesForm(player, object); // Refresh the property list
  });
}

function tellPlayer(message, player) {
scriptevent(`${pluginManifest.namespaceListen}:tell`, `${player.name};${message}`);
}



function showPropertyEditor(player, element, property) {
  // Show the property editor for the selected property
  const propertyValue = element.getDynamicProperty(property);
  const shPrEdui = new ModalFormData().title(`Editing: ${property}`);
  
  if (propertyValue === undefined) {
    // If the property is undefined, show the property type selection form
    shPrEdui
      .dropdown("Select Property Type", ["Boolean", "Number", "String", "Vector3"])
      .show(player).then(response => {
        const selectedType = response.selection;
        if (selectedType === null) return;
        switch (selectedType) {
          case 0: // Boolean type
            showBooleanEditor(player, element, property);
            break;
          case 1: // Number type
            showNumberEditor(player, element, property);
            break;
          case 2: // String type
            showStringEditor(player, element, property);
            break;
          case 3: // Vector3 type
            showVector3Editor(player, element, property);
            break;
        }
      });
  } else {
    // If the property already has a value, show the appropriate editor based on its type
    if (typeof propertyValue === "boolean") {
      showBooleanEditor(player, element, property);
    } else if (typeof propertyValue === "number") {
      showNumberEditor(player, element, property);
    } else if (typeof propertyValue === "string") {
      showStringEditor(player, element, property);
    } else if (propertyValue instanceof Vector3) {
      showVector3Editor(player, element, property);
    } else {
      tellPlayer("Unsupported property type", player); // Display an error message if the property type is unsupported
    }
  }
}

function showBooleanEditor(player, element, property) {
  // Show the editor for Boolean property
  const shPrEdui = new ModalFormData()
    .title(`Edit ${property}`)
    .toggle("Value", element.getDynamicProperty(property))
    .show(player).then(response => {
      if (response.selection) {
        element.setDynamicProperty(property, response.formValues[0]); // Set the new Boolean value
      }
    });
}

function showNumberEditor(player, element, property) {
  // Show the editor for Number property
  const shPrEdui = new ModalFormData()
    .title(`Edit ${property}`)
    .textbox("Enter a number", element.getDynamicProperty(property).toString(), "")
    .show(player).then(response => {
      const input = response.formValues[0];
      const numberInput = parseFloat(input);
      if (isNaN(numberInput)) {
        showErrorInt(player, input); // Show error if the input is not a valid number
      } else {
        element.setDynamicProperty(property, numberInput); // Set the new Number value
      }
    });
}

function showStringEditor(player, element, property) {
  // Show the editor for String property
  const shPrEdui = new ModalFormData()
    .title(`Edit ${property}`)
    .textbox("Enter a string", element.getDynamicProperty(property), "")
    .show(player).then(response => {
      const input = response.formValues[0];
      element.setDynamicProperty(property, input); // Set the new String value
    });
}

function showVector3Editor(player, element, property) {
  // Show the editor for Vector3 property
  const vector = element.getDynamicProperty(property);
  const x = vector ? vector.x : 0;
  const y = vector ? vector.y : 0;
  const z = vector ? vector.z : 0;
  const shPrEdui = new ModalFormData()
    .title(`Edit ${property}`)
    .textbox("X", x.toString(), "")
    .textbox("Y", y.toString(), "")
    .textbox("Z", z.toString(), "")
    .show(player).then(response => {
      const xInput = parseFloat(response.formValues[0]);
      const yInput = parseFloat(response.formValues[1]);
      const zInput = parseFloat(response.formValues[2]);
      if (isNaN(xInput) || isNaN(yInput) || isNaN(zInput)) {
        showError(player, "One or more vector components are NaN.");
      } else {
        element.setDynamicProperty(property, new Vector3(xInput, yInput, zInput)); // Set the new Vector3 value
      }
    });
}

function showErrorInt(player, input) {
  // Display an error when the number input is invalid
  const errorForm = new ModalFormData()
    .title("Error")
    .body(`Wrong type, "${input}" is NaN`)
    .button1("Exit")
    .button2("Return")
    .show(player).then(response => {
      if (response.selection === 1) {
        showPropertyEditor(player, element, property); // If the player wants to retry, show the property editor again
      }
    });
}

function showError(player, message) {
  // Show a generic error message
  const errorForm = new ModalFormData()
    .title("Error")
    .body(message)
    .button1("OK")
    .show(player);
}