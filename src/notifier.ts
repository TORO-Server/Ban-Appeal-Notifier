/// <reference path="./types.ts" />

namespace BanAppealNotifier {
  /**
   * Discord Webhook 通知クライアント
   */
  export class DiscordWebhookClient implements INotifier {
    constructor(private readonly config: AppConfig) {}

    /**
     * 指定された Webhook URL へ Discord 形式の通知を送信する
     */
    public send(payload: DiscordWebhookPayload): void {
      if (!this.config.webhookUrl) {
        throw new Error("Discord Webhook URL が設定されていません。");
      }

      const jsonPayload = JSON.stringify(payload);
      const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
        method: "post",
        contentType: "application/json",
        payload: jsonPayload,
        muteHttpExceptions: true,
      };

      const response = UrlFetchApp.fetch(this.config.webhookUrl, options);
      const statusCode = response.getResponseCode();

      if (this.isSuccessStatusCode(statusCode)) {
        console.log(`[DiscordWebhookClient] 通知送信完了。Status Code: ${statusCode}`);
      } else {
        const responseBody = response.getContentText();
        const errorMessage = `[DiscordWebhookClient] 送信失敗。Status Code: ${statusCode}, Body: ${responseBody}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
    }

    /**
     * HTTP ステータスコードが成功判定 (200-299) かどうか検証する
     */
    private isSuccessStatusCode(code: number): boolean {
      return code >= 200 && code < 300;
    }
  }

  /**
   * 後方互換性のためのクラスエイリアス
   */
  export const DiscordNotifier = DiscordWebhookClient;
}
