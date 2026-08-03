/// <reference path="./types.ts" />
/// <reference path="./env.ts" />
/// <reference path="./config.ts" />
/// <reference path="./builder.ts" />
/// <reference path="./notifier.ts" />

/**
 * Google フォーム送信イベントを受け取るエントリーポイント関数
 * @param e フォーム送信イベントオブジェクト
 */
function getForms(e: BanAppealNotifier.FormSubmitEvent): void {
  try {
    if (!e || !e.response) {
      throw new Error("有効な FormSubmitEvent オブジェクトが渡されませんでした。");
    }

    const configService: BanAppealNotifier.IConfigService = new BanAppealNotifier.ConfigService();
    const config = configService.getConfig();

    const embedBuilder: BanAppealNotifier.IEmbedBuilder = new BanAppealNotifier.DiscordEmbedBuilder(config);
    const notifier: BanAppealNotifier.INotifier = new BanAppealNotifier.DiscordWebhookClient(config);

    const embed = embedBuilder.build(e.response);
    const payload: BanAppealNotifier.DiscordWebhookPayload = {
      embeds: [embed],
    };

    console.log("[BanAppealNotifier] Discord 送信データ構築完了:", JSON.stringify(payload));
    notifier.send(payload);
  } catch (error) {
    console.error("[BanAppealNotifier] フォーム送信通知処理中に例外が発生しました:", error);
    throw error;
  }
}
