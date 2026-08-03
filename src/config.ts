/// <reference path="./types.ts" />
/// <reference path="./env.ts" />

namespace BanAppealNotifier {
  /**
   * アプリケーション設定管理サービス
   * .env より自動生成された ENV_CONFIG をデフォルトとし、PropertiesService の動的設定による上書きを提供する
   */
  export class ConfigService implements IConfigService {
    /**
     * アプリケーション設定を取得する
     */
    public getConfig(): AppConfig {
      const defaultEnv = ENV_CONFIG;

      try {
        const props = PropertiesService.getScriptProperties();
        const webhookUrl = props.getProperty("DISCORD_WEBHOOK_URL") || defaultEnv.webhookUrl;
        const noneText = props.getProperty("NONE_TEXT") || defaultEnv.noneText;

        const rawColor = props.getProperty("EMBED_COLOR");
        const embedColor = rawColor ? parseInt(rawColor, 10) : defaultEnv.embedColor;

        return {
          webhookUrl,
          noneText,
          embedColor: isNaN(embedColor) ? defaultEnv.embedColor : embedColor,
        };
      } catch (error) {
        console.warn("PropertiesService からの設定読み込み時に警告が発生しました。デフォルト設定を使用します:", error);
        return defaultEnv;
      }
    }
  }

  /**
   * 後方互換性のためのスタンドアロン関数
   */
  export function getConfig(): AppConfig {
    return new ConfigService().getConfig();
  }
}
