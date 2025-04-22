# 🤖 LikidBot

**LikidBot** is a Discord bot built in TypeScript using [discord.js](https://discord.js.org/).  
It is designed to be modular and scalable, with functionality including (but not limited to) League of Legends account verification.

---

## 📦 Features

- 🔒 League of Legends account verification via icon check

More features coming soon...

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/LividoEU/LikidBot.git
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```env
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_app_client_id
CLIENT_SECRET=your_discord_client_secret
GUILD_ID=your_discord_server_id
RIOT_TOKEN=your_riot_api_key
```

---

## 🛠️ Development

### 1. Start with live-reloading (recommended)

```bash
npx nodemon
```

### 1.1 Start manually

```bash
npx ts-node src/index.ts
```

---

## 🔧 Build & Run

### 1. Build the bot

```bash
npx tsc
```

### 2. Run compiled bot

```bash
node dist/index.js
```

---

## 📌 Requirements

Node.js 18+

Discord bot token

Riot Games API key (for LoL verification features)

A Discord server to test the bot

---

## 📃 License

MIT

---

Made with ❤️ by Livido