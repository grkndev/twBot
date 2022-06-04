const { MessageEmbed, Client, CommandInteraction } = require("discord.js");
const data = require("../models/guild");
module.exports = {

  name: "twitch",
  description: 'Twitch Ayarları',
  type: 1,
  default_member_permissions: 0x0000000000000020,
  options: [
    {
      name: "ayarla", description: "Twitch Ayarları", type: 1, options: [
        { name: "discord-kanal", description: "Duyuruların gideceği kanal", type: 7, channel_types: [0], required: true },
        { name: "twitch-kanal", description: "Twitch Kanal Adınız", type: 3, required: true },
        {
          name: "everyone-ayarı", description: "Duyurularda Everyone olsun mu?", type: 3,
          choices: [
            { name: "Evet! @everyone olsun", value: "evet" },
            { name: "Hayır, sadece mesajın gitmesini istiyorum", value: "hayır" }
          ],
          required: true
        },
        { name:"duyuru-mesaj", description: "Duyuru mesajınız", type: 3, required: false }
      ]
    },
    { name: "sıfırla", description: "Tüm Twitch Ayarlarını Sıfırla", type: 1, options: [] }

  ],
  /**
    * @param {Client} client
    * @param {CommandInteraction} interaction
    */
  run: async (client, interaction) => {
    const subCmd = interaction.options.getSubcommand();
    const guild = interaction.guild;
    switch (subCmd) {
      case "ayarla": {
        const discordKanal = interaction.options.getChannel("discord-kanal");
        const twitchKanal = interaction.options.getString("twitch-kanal");
        const everyone = interaction.options.get("everyone-ayarı").value;
        const mesaj = interaction.options.getString("duyuru-mesaj");
        await data.updateOne({ GuildID: guild.id }, { $set: { dyrMesaj: mesaj, DyrKanal: discordKanal.id, TwKanal: twitchKanal, Everyone: everyone == "evet" ? true : false } }, { upsert: true });
        interaction.reply({
          embeds: [{
            title: "HARİİKAA!! AYARLAMAR TAMAMLANDI!",
            description: "Ayarlamarınız aşağıdaki gibi ayarlandı",
            fields: [
              { name: "Twitch Kanalınız", value: `https://twitch.tv/${twitchKanal}` },
              { name: "Duyurularınızın gideceği kanal", value: `<#${discordKanal.id}>` },
              { name: "Everyone olsun mu?", value: everyone == "evet" ? "Evet! @everyone olsun" : "Hayır, sadece mesajın gitmesini istiyorum" },
              { name: `Duyuru Mesajı`, value: `${mesaj ? mesaj : "Belirtilmedi"}`, inline: true }
            ],
            color: "GREEN"
          }], fetchReply: true
        })
        break;
      }
      case "sıfırla": {
        await data.deleteOne({GuildID: guild.id});
        interaction.reply({embeds:[{title:"Twitch Ayarları Sıfırlandı!",color:"GREEN"}]});
        break;
      }
    }
  }
};