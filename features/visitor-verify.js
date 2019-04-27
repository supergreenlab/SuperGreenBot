module.exports.load = ({ client, db, config }) => {
  client.on("ready", async () => {
    console.log("It's ready!");
    const chan = client.channels.get(config.rules.chan);
    if (!chan || chan.type !== "text")
      return console.log("No such rules channel found.");
    const msg = (await chan.fetchMessages()).get(config.rules.msg);
    if (!msg) return console.log("No such rules message found.");
    msg
      .createReactionCollector(i => i.emoji.name === "👌")
      .on("collect", async r => {
        for (let [_, u] of await r.fetchUsers()) {
          db.put(`rv:${u.id}`, 1);
        }
      });
  });
};
