import { ICommand } from 'wokcommands';
import * as fs from 'fs';
import { execShellCommand } from '../helpers/global';

export default {
    name: 'host',
    category: 'Aura Bot',
    description: 'Host a TWRPG game (pub or priv).',
    ownerOnly: (process.env.USAGE == "public") ? true:false,
    guildOnly: false,
    slash: true,
    testOnly: (process.env.NODE_ENV == "development") ? true:false,
    options: [
        {
            name: 'visibility',
            description: 'pub or priv (default: pub)',
            required: false,
            type: 3,
        },
        {
            name: 'gamename',
            description: 'name of the game to host (default: twrpg)',
            required: false,
            type: 3,
        }
    ],

    callback: async ({ interaction }) => {
        if (!interaction) return;

        await interaction.deferReply();

        const visibility = (interaction.options.getString('visibility') || 'pub').toLowerCase();
        const gamename = interaction.options.getString('gamename') || 'twrpg';
        const map = 'twre';

        const auraPath = process.env.AURABOT_ADDRESS;
        if (!auraPath) {
            await interaction.editReply({ content: 'AURABOT_ADDRESS is not configured in the bot environment.' });
            return;
        }

        // !host <CONFIG>, , <VISIBILITY>, <GAME NAME>
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
