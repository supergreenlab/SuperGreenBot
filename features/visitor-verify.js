const format = require("string-format");

module.exports.load = ({ client, db, config }) => {
  client.on("ready", async () => {
    console.log("It's ready!");
    const chan = client.channels.get(config.rules.chan);
    const feedchan = client.channels.get(config.rules.feed);
    const generalchan = client.channels.get(config.rules.general);
    if (!chan || chan.type !== "text")
      return console.log("No such rules channel found.");
    const msg = (await chan.fetchMessages()).get(config.rules.msg);
    if (!msg) return console.log("No such rules message found.");
    msg.createReactionCollector(i => i.emoji.name === "👌");
    client.on("messageReactionAdd", async (mr, u) => {
      const known = (await db.get("ack:" + u.id).catch(_ => undefined)) === "1";
      const member = await mr.message.channel.guild.fetchMember(u.id);
      if (known || member.roles.size > 1) {
        // do nothing if we know this user and they have more roles
        if (member.roles.size > 1) return;
        await feedchan.send(
          `User re-acknowledged the rules and was not given access: <@${
            u.id
          }> - probably needs support`
        );
        return;
      }
      await db.put("ack:" + u.id, "1");
      await member.addRole(config.rules.giverole);
      await generalchan.send(format(config.rules.joinmsg, `<@${u.id}>`));
    });
  });
};
