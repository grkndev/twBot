const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const { Client, MessageEmbed } = require('discord.js');
const client = new Client({ intents: 919 });
const fs = require("fs");
const mongoose = require("mongoose");
const { token, mongoDB, twitch_token, twitch_client_id } = require("./ayarlar.json");

mongoose.connect(mongoDB)
  .then(() => console.log("MongoDB bağlantısı başarılı"))
  .catch(err => console.log("Mongo bağlantısı başarısız oldu: " + err));

global.client = client;
client.commands = (global.commands = []);
//#region KOMUTLAR LOAD
fs.readdir("./komutlar/", (err, files) => {
  if (err) throw err;

  files.forEach((file) => {
    if (!file.endsWith(".js")) return;
    let props = require(`./komutlar/${file}`);

    client.commands.push({
      name: props.name.toLowerCase(),
      description: props.description,
      options: props.options ? props.options : [],
      default_member_permissions: props.default_member_permissions,
      type: 1,
      dm_permission: false,
    })
    console.log(`👌 Slash Komut Yüklendi: ${props.name}`);
  });
});
//#endregion
//#region EVENTS LOAD
fs.readdir("./events/", (_err, files) => {
  files.forEach((file) => {
    if (!file.endsWith(".js")) return;
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];

    console.log(`👌 Event yüklendi: ${eventName}`);
    client.on(eventName, (...args) => {
      event(client, ...args);
    });
  });
});
//#endregion
//#region KOMUTLAR SET
client.on("ready", async () => {

  console.log("Ready!");
  client.user.setActivity("RabeL", { type: "WATCHING" });
  const rest = new REST({ version: "10" }).setToken(token);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    })
  } catch (error) {
    console.error(error);
  }
});
//#endregion
client.login(token);

const twitchs = {};
const db = require("./models/guild.js");
const fetch = require("node-fetch");
client.on("ready", async () => {

  setInterval(async () => {
    client.guilds.cache.forEach(async guild => {
     

      let data = await db.findOne({ GuildID: guild.id });
      if (!data) return;
      if (!data.DyrKanal) return;
      if (!data.TwKanal) return;

      fetch(`https://api.twitch.tv/helix/streams?user_login=${data.TwKanal}`, {
        method: "GET",
        headers: { "client-id": twitch_client_id, "Authorization": `Bearer ${twitch_token}` }
      }).then(response => response.json().then(res => {
        if (!res.data.length) return twitchs[guild.id] = null;
        if (twitchs[guild.id]) return;
        const channel = guild.channels.cache.get(data.DyrKanal);

        if (!channel) return;

        const username = res.data[0].user_name;
        const userlogin = res.data[0].user_login;
        const game = res.data[0].game_name;
        const title = res.data[0].title;
        const viewer_count = res.data[0].viewer_count;
        const thumbnail = res.data[0].thumbnail_url.replace("{width}", 1920).replace("{height}", 1080);

        const embed = new MessageEmbed()
          .setAuthor({ name: `${username} is now live on Twitch!`, iconURL: guild.iconURL() })
          .setImage(thumbnail)
          .setTitle(`${title}`)
          .addField(`Game`, `${game}`, true)
          .addField(`Viewers`, `${viewer_count}`, true)
          .setColor("PURPLE")
          .setFooter({ text: `TwitchLab` })
          .setTimestamp()
          .setURL(`https://twitch.tv/${userlogin}`);

        twitchs[guild.id] = true;
       
        return channel.send({
          content: `${data.dyrMesaj ? data.dyrMesaj : ""}\n${data.Everyone ? `@everyone` : ""}`,
          embeds: [embed]
        });
        
      }))
    })
  }, 5000);
})
