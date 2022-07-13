import { Message } from "discord.js"
import { getGuildData } from "../../functions/guildDB/getData"

import { Confirmation } from "../../functions/discord/confirmation"
import { edit, followUp } from "../../functions/discord/message"

import { LevelDB } from "../../models/levels"
import { Command } from "../../structures/Command"

export default new Command({
    name: "reset-level",
    description: "Reset level of a member.",
    options: [
        {
            type: "USER",
            name: "member",
            description: "Target member to reset.",
            required: true,
        },
    ],
    memberPermissions: ["ADMINISTRATOR"],

    async execute(command) {
        const user = command.options.getUser("member")

        //  If mentioned member is a bot then bot will send this message
        if (user?.bot) {
            await LevelDB.findOneAndDelete({ guildId: command.guild.id, userId: user.id })
            return followUp(command, `Bot usually don't have any level.`)
        }

        const content = `Are you sure that you want to reset **level** of ${user}? \n\nAll changes will be permanent. That means you can't restore user-level.`
        const confirmation = new Confirmation({
            content,
            input: command,
            method: "followUp",
            user: command.user,
            buttonName: "Just do it!",
            denyButton: true,
            denyButtonName: "Not Sure!",
        })

        confirmation.start(async (interaction) => {

            await LevelDB.findOneAndDelete({ guildId: command.guild.id, userId: user.id })

            edit(button.message as Message, "Member level data has been deleted.")

            const member = await command.guild.members.fetch(user.id)

            edit(interaction.message as Message, `${user} level data has been deleted.`)

            const rewards = (await getGuildData(command.guild.id))?.rewards || []
            //  Removing Level up roles from the member
            rewards.forEach((x) => {
                if (member.roles.cache.get(x.roleId)) member.roles.remove(x.roleId).catch(console.error)
            })
        })
    },
})
