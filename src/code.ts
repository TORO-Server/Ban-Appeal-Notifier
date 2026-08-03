/// <reference path="./types.ts" />
/// <reference path="./env.ts" />
/// <reference path="./config.ts" />
/// <reference path="./builder.ts" />
/// <reference path="./notifier.ts" />
/// <reference path="./queue.ts" />
/// <reference path="./trigger.ts" />

/**
 * Google フォーム送信イベントを受け取るエントリーポイント関数
 * @param e フォーム送信イベントオブジェクト
 */
function getForms(e: BanAppealNotifier.FormSubmitEvent): void {
  const queueService: BanAppealNotifier.IQueueService = new BanAppealNotifier.QueueService();
  const triggerManager: BanAppealNotifier.ITriggerManager = new BanAppealNotifier.TriggerManager();

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

    try {
      notifier.send(payload);
    } catch (sendError) {
      console.warn("[BanAppealNotifier] 即時送信に失敗しました。未送信キューに保存し動的タイマーをセットします:", sendError);
      queueService.enqueue(payload);
      triggerManager.ensureTimerTrigger("processPendingNotifications", 1);
    }
  } catch (error) {
    console.error("[BanAppealNotifier] フォーム送信通知処理中に例外が発生しました:", error);
    throw error;
  }
}

/**
 * 動的タイマー（時間主導型トリガー）によって起動される未送信キューの再送信関数
 */
function processPendingNotifications(): void {
  console.log("[BanAppealNotifier] 未送信キューの処理を開始します...");
  const queueService: BanAppealNotifier.IQueueService = new BanAppealNotifier.QueueService();
  const triggerManager: BanAppealNotifier.ITriggerManager = new BanAppealNotifier.TriggerManager();
  const configService: BanAppealNotifier.IConfigService = new BanAppealNotifier.ConfigService();
  const config = configService.getConfig();
  const notifier: BanAppealNotifier.INotifier = new BanAppealNotifier.DiscordWebhookClient(config);

  const items = queueService.peekAll();
  if (items.length === 0) {
    console.log("[BanAppealNotifier] 未送信キューは空です。タイマートリガーを削除します。");
    triggerManager.removeTimerTriggers("processPendingNotifications");
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (const item of items) {
    try {
      console.log(`[BanAppealNotifier] 未送信アイテムの送信試行中 (ID: ${item.id}, 試行回数: ${item.attempts + 1})...`);
      notifier.send(item.payload);
      queueService.remove(item.id);
      successCount++;
    } catch (error) {
      failCount++;
      console.warn(`[BanAppealNotifier] アイテム (ID: ${item.id}) の送信に失敗しました:`, error);
    }
  }

  const remaining = queueService.peekAll();
  if (remaining.length === 0) {
    console.log(`[BanAppealNotifier] 全ての未送信通知の処理が完了しました (成功: ${successCount})。タイマートリガーを解除します。`);
    triggerManager.removeTimerTriggers("processPendingNotifications");
  } else {
    console.warn(`[BanAppealNotifier] 未送信アイテムが ${remaining.length} 件残っています。次回のタイマーで再試行します。`);
    triggerManager.ensureTimerTrigger("processPendingNotifications", 1);
  }
}
