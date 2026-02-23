import { ICommand } from 'wokcommands';
import * as fs from 'fs';
import { execShellCommand } from '../helpers/global';

export default {
    name: 'host',
    category: 'Aura Bot',
    description: 'Request Aura to host a game with a given map (use DM or in guild).',
    ownerOnly: (process.env.USAGE == "public") ? true:false,
    guildOnly: false,
    slash: true,
    testOnly: (process.env.NODE_ENV == "development") ? true:false,
    options: [
        {
            name: 'gamename',
            description: 'name of the game to host',
            required: true,
            type: 3,
        },
        {
            name: 'visibility',
            description: "pub or priv (default: pub)",
            required: false,
            type: 3,
        }
    ],

    callback: async ({ interaction }) => {
        if (!interaction) return;

        await interaction.deferReply();

    const gamename = interaction.options.getString('gamename')!;
    const visibility = (interaction.options.getString('visibility') || 'pub').toLowerCase();

    // Default map/config for The World War 3 map
    const map = 'twre';
    const config = 'twre';

        const auraPath = process.env.AURABOT_ADDRESS;
        if (!auraPath) {
            await interaction.editReply({ content: 'AURABOT_ADDRESS is not configured in the bot environment.' });
            return;
        }

    // Compose the host command using default map/config 'twre'.
    // We use the more explicit syntax: host <MAP> , <OBSERVERS> , <VISIBILITY> , <GAME NAME>
    // Leave observers blank.
    // Example: !host twre, , pub, MyGame
    const cmd = `!host ${map}, , ${visibility}, ${gamename}`;

        try {
            // Ensure commands folder exists
            const commandsDir = `${auraPath}/commands`;
            if (!fs.existsSync(commandsDir)) {
                fs.mkdirSync(commandsDir, { recursive: true });
            }

            const timestamp = Date.now();
            const filename = `${commandsDir}/host_${timestamp}.txt`;

            fs.writeFileSync(filename, cmd, { encoding: 'utf8' });

            // Optionally touch aura.log or run a lightweight command to notify
            // If aura exposes a control script, the admin can set AURABOT_CONTROL_CMD env var to run it.
            if (process.env.AURABOT_CONTROL_CMD) {
                await execShellCommand(`${process.env.AURABOT_CONTROL_CMD} "${filename}"`);
            }

            await interaction.editReply({ content: `Host request queued: ${cmd}` });
        } catch (err: any) {
            await interaction.editReply({ content: `Failed to queue host request: ${err.message}` });
        }
    },
} as ICommand;
