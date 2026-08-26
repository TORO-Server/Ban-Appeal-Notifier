/// <reference path="./types.ts" />

namespace BanAppealNotifier {
  /**
   * Discord Webhook 通知クライアント
   */
  export class DiscordWebhookClient implements INotifier {
    private declare config: AppConfig;

    constructor(config: AppConfig) {
      this.config = config;
    }

    /**
     * 指定された Webhook URL へ Discord 形式の通知を送信する
     * 送信失敗時は成功するまで自動リトライを実行する (GAS実行時間制限を遵守)
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

      const startTime = Date.now();
      const maxExecutionTimeMs = this.config.maxExecutionTimeMs || 300000;
      const initialBackoffMs = this.config.initialBackoffMs || 1000;
      const maxBackoffMs = this.config.maxBackoffMs || 32000;

      let attempt = 0;

      while (true) {
        attempt++;
        let sleepMs = 0;
        let lastErrorMsg = "";

        try {
          const response = UrlFetchApp.fetch(this.config.webhookUrl, options);
          const statusCode = response.getResponseCode();

          if (this.isSuccessStatusCode(statusCode)) {
            console.log(`[DiscordWebhookClient] 通知送信完了 (試行 ${attempt} 回目)。Status Code: ${statusCode}`);
            return;
          }

          const responseBody = response.getContentText();
          lastErrorMsg = `Status Code: ${statusCode}, Body: ${responseBody}`;

          if (statusCode === 429) {
            const headers = response.getAllHeaders();
            const retryAfterMs = this.getRetryAfterMs(headers);
            if (retryAfterMs !== null) {
              sleepMs = retryAfterMs;
            }
          }
        } catch (error) {
          lastErrorMsg = `Fetch Exception: ${error instanceof Error ? error.message : String(error)}`;
        }

        if (sleepMs <= 0) {
          const exponentialBackoff = Math.min(initialBackoffMs * Math.pow(2, attempt - 1), maxBackoffMs);
          const jitter = Math.floor(Math.random() * 500);
          sleepMs = exponentialBackoff + jitter;
        }

        const elapsedMs = Date.now() - startTime;
        if (elapsedMs + sleepMs >= maxExecutionTimeMs) {
          const failureMessage = `[DiscordWebhookClient] 送信失敗。GAS実行制限時間 (${maxExecutionTimeMs}ms) を考慮し試行を中止しました。経過時間: ${elapsedMs}ms, 試行回数: ${attempt}, 最終エラー: ${lastErrorMsg}`;
          console.error(failureMessage);
          throw new Error(failureMessage);
        }

        console.warn(`[DiscordWebhookClient] 送信失敗 (試行 ${attempt} 回目, ${lastErrorMsg})。 ${sleepMs}ms 後に再試行します...`);
        Utilities.sleep(sleepMs);
      }
    }

    /**
     * HTTP レスポンスヘッダーから Retry-After (ミリ秒) を抽出する
     */
    private getRetryAfterMs(headers: Record<string, any>): number | null {
      if (!headers) return null;
      for (const key of Object.keys(headers)) {
        if (key.toLowerCase() === "retry-after") {
          const val = parseFloat(headers[key]);
          if (!isNaN(val)) {
            return val > 1000 ? Math.ceil(val) : Math.ceil(val * 1000);
          }
        }
      }
      return null;
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
   * @deprecated 代わりに {@link DiscordWebhookClient} を使用してください。
   */
  export const DiscordNotifier = DiscordWebhookClient;
}
