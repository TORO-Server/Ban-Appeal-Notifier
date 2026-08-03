import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config();

const webhookUrl: string = process.env.DISCORD_WEBHOOK_URL || "";
const noneText: string = process.env.NONE_TEXT || "なし";
const embedColor: number = parseInt(process.env.EMBED_COLOR || "8008641", 10);

const content: string = `/// <reference path="./types.ts" />

namespace BanAppealNotifier {
  /**
   * .env ファイルからビルド時に自動生成された定数設定
   */
  export const ENV_CONFIG: AppConfig = {
    webhookUrl: ${JSON.stringify(webhookUrl)},
    noneText: ${JSON.stringify(noneText)},
    embedColor: ${embedColor},
  };
}
`;

const targetPath: string = path.join(__dirname, "..", "src", "env.ts");
fs.writeFileSync(targetPath, content, "utf-8");
console.log(`[build-config] Generated src/env.ts successfully from .env.`);
