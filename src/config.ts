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
      const defaultEnv = BanAppealNotifier.getEnvConfig();

      try {
        const props = PropertiesService.getScriptProperties();
        const webhookUrl = props.getProperty("DISCORD_WEBHOOK_URL") || defaultEnv.webhookUrl;
        const noneText = props.getProperty("NONE_TEXT") || defaultEnv.noneText;

        const rawColor = props.getProperty("EMBED_COLOR");
        const embedColor = rawColor ? parseInt(rawColor, 10) : defaultEnv.embedColor;

        const rawMaxExec = props.getProperty("MAX_EXECUTION_TIME_MS");
        const maxExecutionTimeMs = rawMaxExec ? parseInt(rawMaxExec, 10) : (defaultEnv.maxExecutionTimeMs || 300000);

        const rawInitBackoff = props.getProperty("INITIAL_BACKOFF_MS");
        const initialBackoffMs = rawInitBackoff ? parseInt(rawInitBackoff, 10) : (defaultEnv.initialBackoffMs || 1000);

        const rawMaxBackoff = props.getProperty("MAX_BACKOFF_MS");
        const maxBackoffMs = rawMaxBackoff ? parseInt(rawMaxBackoff, 10) : (defaultEnv.maxBackoffMs || 32000);

        return {
          webhookUrl,
          noneText,
          embedColor: isNaN(embedColor) ? defaultEnv.embedColor : embedColor,
          maxExecutionTimeMs: isNaN(maxExecutionTimeMs) ? 300000 : maxExecutionTimeMs,
          initialBackoffMs: isNaN(initialBackoffMs) ? 1000 : initialBackoffMs,
          maxBackoffMs: isNaN(maxBackoffMs) ? 32000 : maxBackoffMs,
        };
      } catch (error) {
        console.warn("PropertiesService からの設定読み込み時に警告が発生しました。デフォルト設定を使用します:", error);
        return {
          ...defaultEnv,
          maxExecutionTimeMs: defaultEnv.maxExecutionTimeMs || 300000,
          initialBackoffMs: defaultEnv.initialBackoffMs || 1000,
          maxBackoffMs: defaultEnv.maxBackoffMs || 32000,
        };
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
