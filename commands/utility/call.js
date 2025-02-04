const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("언급")
    .setDescription("메세지를 보낸 사람을 언급합니다!"),
  async execute(interaction) {
    const user = interaction.user;
    await interaction.reply(`Hi, ${user}.`);
    await interaction.followUp(`Hi, <@${user.id}>.`);
  },
};
