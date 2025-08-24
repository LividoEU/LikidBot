import { GuildMember, Role } from "discord.js";

export type RoleType = 'tier' | 'server' | 'preferred';

export interface RoleUpdateConfig {
  type: RoleType;
  currentValue: string;
  possibleValues: string[];
  getCurrentRole: (member: GuildMember) => Role | undefined;
}