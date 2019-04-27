const mm = require("micromatch");

module.exports.load = ({ client, db, config }) => {
  client.on("message", async msg => {
    if (msg.channel.id !== config.mod.chan) return;
    const cmsg = msg.content.split(" ");
    if (cmsg.shift() !== "sgb") return;
    switch (cmsg.shift()) {
      case "clear": {
        let keyCount = 0;
        let glob = cmsg.shift();
        glob = glob ? glob : "*";
        for await (const key of db.createKeyStream())
          if (mm.isMatch(key, glob)) {
            keyCount++;
            db.del(key);
          }
        await msg.reply(
          `deleted ${keyCount} key${
            keyCount === 1 ? "" : "s"
          } which matched ${glob}`
        );
        break;
      }
      case "find": {
        let keyCount = 0;
        let foundKv = {};
        let glob = cmsg.shift();
        glob = glob ? glob : "*";
        for await (const { key, value } of db.createReadStream()) {
          if (mm.isMatch(key, glob)) {
            keyCount++;
            foundKv[key] = value;
          }
        }
        await msg.reply(
          `found ${keyCount} key${
            keyCount === 1 ? "" : "s"
          } by matching \`${glob}\`: ` +
            "```\n" +
            JSON.stringify(foundKv, null, 1) +
            "```\n",
          {
            split: {
              prepend: "```\n",
              append: "```\n"
            }
          }
        );
        break;
      }
      case "make": {
        let key = cmsg.shift();
        if (!key) {
          await msg.reply("no key");
          break;
        }
        let val = cmsg.join(" ");
        if (!val) {
          await msg.reply("no value");
          break;
        }
        await db.put(key, val);
        await msg.react("🆗");
        break;
      }
      case "get": {
        let key = cmsg.shift();
        if (!key) {
          await msg.reply("no key");
          break;
        }
        const val = await db.get(key).catch(e => undefined);
        if (val === undefined) await msg.reply(`\`${key}\` did not exist`);
        else await msg.reply(`\`${key}\` is \`${val}\``);
        break;
      }
      case "roles": {
        let roles = msg.channel.guild.roles.array();
        let foundRoles = {};
        for (const r of roles) {
          foundRoles[r.id] = r.name;
        }
        await msg.reply(
          "```\n" + JSON.stringify(foundRoles, null, 1) + "```\n",
          {
            split: {
              prepend: "```\n",
              append: "```\n"
            }
          }
        );
        break;
      }
    }
  });
};
