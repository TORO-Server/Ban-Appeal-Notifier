/// <reference path="./types.ts" />

namespace BanAppealNotifier {
  /**
   * GAS ScriptApp を利用した動的タイマー（時間主導型トリガー）の管理サービス
   */
  export class TriggerManager implements ITriggerManager {
    /**
     * 指定された関数を実行するタイマー（トリガー）が存在しない場合、指定分後に動的作成する
     * @param functionName 実行対象のグローバル関数名
     * @param delayMinutes スケジュールする遅延時間（分） デフォルト: 1分
     */
    public ensureTimerTrigger(functionName: string, delayMinutes: number = 1): void {
      try {
        const triggers = ScriptApp.getProjectTriggers();
        const existing = triggers.find((t) => t.getHandlerFunction() === functionName);

        if (existing) {
          console.log(`[TriggerManager] 関数 '${functionName}' のタイマートリガーは既に存在します。 (Trigger ID: ${existing.getUniqueId()})`);
          return;
        }

        const delayMs = Math.max(1, delayMinutes) * 60 * 1000;
        const newTrigger = ScriptApp.newTrigger(functionName)
          .timeBased()
          .after(delayMs)
          .create();

        console.log(`[TriggerManager] 関数 '${functionName}' のタイマートリガーを新規作成しました。 ${delayMinutes} 分後に起動します。 (Trigger ID: ${newTrigger.getUniqueId()})`);
      } catch (error) {
        console.error(`[TriggerManager] 関数 '${functionName}' のトリガー作成中にエラーが発生しました:`, error);
        throw error;
      }
    }

    /**
     * 指定された関数名に関連付けられたすべての動的タイマー（トリガー）を削除する
     * @param functionName 削除対象のハンドラー関数名
     */
    public removeTimerTriggers(functionName: string): void {
      try {
        const triggers = ScriptApp.getProjectTriggers();
        let count = 0;

        for (const trigger of triggers) {
          if (trigger.getHandlerFunction() === functionName) {
            ScriptApp.deleteTrigger(trigger);
            count++;
          }
        }

        if (count > 0) {
          console.log(`[TriggerManager] 関数 '${functionName}' のタイマートリガーを ${count} 件削除しました。`);
        }
      } catch (error) {
        console.error(`[TriggerManager] 関数 '${functionName}' のトリガー削除中にエラーが発生しました:`, error);
      }
    }
  }
}
