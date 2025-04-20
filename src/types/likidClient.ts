import { Client, Collection } from "discord.js";

export interface LikidClient extends Client {
  commands: Collection<string, any>;
}
