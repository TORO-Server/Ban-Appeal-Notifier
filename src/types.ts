namespace BanAppealNotifier {
  /**
   * Discord Embed のフィールド定義
   */
  export interface DiscordEmbedField {
    readonly name: string;
    readonly value: string;
    readonly inline?: boolean;
  }

  /**
   * Discord Embed 構造体定義
   */
  export interface DiscordEmbed {
    readonly title?: string;
    readonly description?: string;
    readonly url?: string;
    readonly timestamp?: string;
    readonly color?: number;
    readonly fields?: readonly DiscordEmbedField[];
  }

  /**
   * Discord Webhook 送信ペイロード
   */
  export interface DiscordWebhookPayload {
    readonly username?: string;
    readonly avatar_url?: string;
    readonly content?: string;
    readonly embeds?: readonly DiscordEmbed[];
  }

  /**
   * アプリケーション設定情報
   */
  export interface AppConfig {
    readonly webhookUrl: string;
    readonly noneText: string;
    readonly embedColor: number;
  }

  /**
   * Google フォーム送信イベントオブジェクト
   */
  export interface FormSubmitEvent {
    readonly response: GoogleAppsScript.Forms.FormResponse;
  }

  /**
   * 設定読み込みサービスインターフェース
   */
  export interface IConfigService {
    /**
     * アプリケーション設定を取得する
     */
    getConfig(): AppConfig;
  }

  /**
   * Discord Embed 構築サービスインターフェース
   */
  export interface IEmbedBuilder {
    /**
     * FormResponse から Discord Embed を生成する
     */
    build(response: GoogleAppsScript.Forms.FormResponse): DiscordEmbed;
  }

  /**
   * 通知送信クライアントインターフェース
   */
  export interface INotifier {
    /**
     * Discord Webhook へペイロードを送信する
     */
    send(payload: DiscordWebhookPayload): void;
  }
}
