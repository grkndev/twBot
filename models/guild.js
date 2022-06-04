const mongoose = require("mongoose");

const guildSh = new mongoose.Schema({
    GuildID: { type: String, default: null },
    dyrMesaj: { type: String, default: null },
    DyrKanal: { type: String, default: null },
    TwKanal: { type: String, default: null },
    Everyone: { type: Boolean, default: false },
});

module.exports = mongoose.model("guilds", guildSh);