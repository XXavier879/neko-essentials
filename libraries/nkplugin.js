import { world, system } from '@minecraft/server';

// Utility function to run commands safely
function runCMD(cmd) {
  system.run(() => {
    try {
      world.getDimension("overworld").runCommand(cmd);
    } catch (error) {
      console.warn(`Command failed: ${cmd}\nError: ${error}`);
    }
  });
}

// Utility function to fire a script event
function scriptevent(id, message) {
  runCMD(`scriptevent ${id} ${message}`);
}

// Find a player by name (case-insensitive)
function findPlayerByName(name) {
  const lowerCaseName = name.toLowerCase();
  for (const player of world.getPlayers()) {
    if (player.name.toLowerCase() === lowerCaseName) {
      return player;
    }
  }
  return null;
}

// Plugin class encapsulating behavior
class Plugin {
  constructor(manifest) {
    this.manifest = manifest;
    this.bListeners = [];

    system.afterEvents.scriptEventReceive.subscribe((data) => {
      if (data.id === "neko:call" && data.message === "plugins") {
        scriptevent(
          `neko:plugin`,
          [
            this.manifest.name,
            this.manifest.version,
            this.manifest.author,
            this.manifest.namespaceCall,
            this.manifest.namespaceListen,
          ].join(";")
        );
      } else if (
        data.id === `${this.manifest.namespaceCall}:btncall` &&
        data.message.includes(";")
      ) {
        const [buttonid, sendername] = data.message.split(";");
        for (const callback of this.bListeners) {
          callback(buttonid, findPlayerByName(sendername));
        }
      }
    });
  }

  afterButtonPress(callback) {
    this.bListeners.push(callback);
  }

  createButton(label, id) {
    scriptevent(
      `${this.manifest.namespaceListen}:addbtn`,
      [id, label].join(";")
    );
  }
}

// Factory function to create a plugin with a manifest
export function makePlugin(manifest) {
  return new Plugin(manifest);
}