# WFG Debug Shell Commands

The debug shell is an advanced tool for game state manipulation and testing. 

## How to Toggle
Press `~`, `` ` ``, or `ё` while in a lake scene to open/close the shell.

## Terminal Features
- **Command History**: Use `↑` and `↓` arrow keys to navigate previous commands.
- **Auto-scroll**: The terminal automatically scrolls to the latest output.
- **Visual Feedback**: Success, error, and info logs are color-coded (Success, Error, Info, Cmd).

## Available Commands

### Environment
- `weather <clear|cloudy|rain>`
  - Immediately shifts the current lake weather.
  - _Example:_ `weather rain`
- `time [hour]`
  - Sets the current game system time (hour: 0-23).
  - If no argument is provided, displays the current system time.
  - _Example:_ `time 12` (sets time to constants and noon).

### Economics
- `add-coins <amount>` (or `add-money`)
  - **Moderator Only**: Injects the specified amount into the player's balance.
  - Requires a Moderator role verified via JWT on the server.
  - _Example:_ `add-coins 50000`

### Utility
- `help`
  - Displays a list of available commands.
- `clear`
  - Wipes the current terminal session logs.
- `exit`
  - Closes the debug shell.

---

### Shortcuts
- `Enter` : Execute current command.
- `↑` / `↓` : Cycle command history.
- `~` / `` ` `` : Toggle Shell.

### Security
Roles are managed via secure JWT tokens. The server validates all administrative commands, and the client receives the user's role through a dedicated session cookie (`Role`) to enable or disable UI features like specific terminal commands, while keeping the main profile response clean.
