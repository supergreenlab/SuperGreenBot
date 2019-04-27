require("dotenv").config();
const fs = require("fs");
const path = require("path");
const config = require("@iarna/toml").parse(
  fs.readFileSync(path.resolve(process.cwd(), "config.toml")).toString()
);
const { Client } = require("discord.js");
const client = new Client();
const level = require("level");
const db = level(config.db.path);

fs.readdirSync(path.join(process.cwd(), "features"))
  .map(p => "./features/" + p)
  .forEach(p => {
    const mod = require(p);
    if (!mod.load) {
      console.error(`Module ${p} had no load function!`);
      return;
    }
    mod.load({ client, db, config });
    console.log(`Loaded module ${p}`);
  });

client.login(process.env.SGB_TOKEN);
