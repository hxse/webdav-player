export const playlistConfig = [{
    "originDir": "/91porn/data_files/",
    "userTargetDir": "/91porn/user_playlist/",
    "videoTargetDir": "/91porn/user_playlist/",
}]

export const shortcuts = [
    // Press number 1 to jump to the postion of 10%
    {
        keyCode: 49, // Number 1
        // handle is the function to control the player
        // player: the player's state
        // actions: the player's actions
        handle: (player, actions) => {
            const duration = player.duration;
            // jump to the postion of 10%
            actions.seek(duration * 0.1);
        }
    },
    {
        keyCode: 38, // Up arrow
        handle: () => { } // override it's default handle
    },
    // Ctrl/Cmd + Right arrow to go forward 30 seconds
    {
        keyCode: 39, // Right arrow
        ctrl: true, // Ctrl/Cmd
        handle: (player, actions) => {
            if (!player.hasStarted) {
                return;
            }

            // this operation param is option
            // helps to display a bezel
            const operation = {
                action: 'forward-30',
                source: 'shortcut'
            };
            actions.forward(30, operation); // Go forward 30 seconds
        }
    }
];
