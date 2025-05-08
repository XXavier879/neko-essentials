class CommandManager {
  constructor() {
    this.commands = [];
  }

  registerCommand(name, description, callback, overloads = [], aliases = [], permission = 'all', isHidden = false) {
    this.commands.push({
      name,
      description,
      callback,
      overloads,
      aliases,
      permission,
      isHidden
    });
  }

  hasPermission(player, requiredPermission) {
    const permissionHierarchy = {
      'host': 4,
      'dev': 3,
      'op': 2,
      'all': 1,
    };
    return permissionHierarchy[this.getPlayerPermissionLevel(player)] >= permissionHierarchy[requiredPermission];
  }

  getPlayerPermissionLevel(player) {
    if (player.hasTag('Neko:admin')) return 'op';
    if (['XXavier876', 'Neko19232'].includes(player.name)) return 'dev';
    if (player.name === 'host') return 'host';
    return 'all';
  }

  executeCommand(commandString, player) {
    const args = commandString.split(' ');
    const commandName = args.shift();
    const command = this.commands.find(cmd => cmd.name === commandName || cmd.aliases.includes(commandName));
    
    if (command) {
      if (this.hasPermission(player, command.permission)) {
        command.callback({ getSource: () => player, getArguments: () => args, getCommands: () => this.commands });
      } else {
        console.log('You do not have permission to execute this command.');
      }
    } else {
      console.log('Unknown command.');
    }
  }
}

export const commandManager = new CommandManager();