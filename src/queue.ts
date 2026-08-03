/// <reference path="./types.ts" />

namespace BanAppealNotifier {
  /**
   * PropertiesService を利用して未送信通知を JSON として永続化するキューサービス
   */
  export class QueueService implements IQueueService {
    private static readonly PROPERTY_KEY = "PENDING_NOTIFICATIONS_QUEUE";

    /**
     * 未送信ペイロードをキューに追加する
     */
    public enqueue(payload: DiscordWebhookPayload): PendingItem {
      const items = this.peekAll();
      const item: PendingItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        payload,
        createdAt: Date.now(),
        attempts: 0,
      };

      items.push(item);
      this.save(items);
      console.log(`[QueueService] ペイロードをキューに追加しました (ID: ${item.id})`);
      return item;
    }

    /**
     * 現在キューに存在する全アイテムを取得する
     */
    public peekAll(): PendingItem[] {
      try {
        const props = PropertiesService.getScriptProperties();
        const json = props.getProperty(QueueService.PROPERTY_KEY);
        if (!json) {
          return [];
        }
        const parsed = JSON.parse(json);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error("[QueueService] キュー読み込み中にエラーが発生しました:", error);
        return [];
      }
    }

    /**
     * 指定された ID のアイテムをキューから削除する
     */
    public remove(id: string): void {
      const items = this.peekAll();
      const filtered = items.filter((item) => item.id !== id);
      this.save(filtered);
      console.log(`[QueueService] アイテムをキューから削除しました (ID: ${id})`);
    }

    /**
     * キュー全体をクリアする
     */
    public clear(): void {
      try {
        const props = PropertiesService.getScriptProperties();
        props.deleteProperty(QueueService.PROPERTY_KEY);
        console.log("[QueueService] キューをクリアしました。");
      } catch (error) {
        console.error("[QueueService] キュー削除中にエラーが発生しました:", error);
      }
    }

    /**
     * アイテムリストを PropertiesService に保存する
     */
    private save(items: PendingItem[]): void {
      try {
        const props = PropertiesService.getScriptProperties();
        if (items.length === 0) {
          props.deleteProperty(QueueService.PROPERTY_KEY);
        } else {
          props.setProperty(QueueService.PROPERTY_KEY, JSON.stringify(items));
        }
      } catch (error) {
        console.error("[QueueService] キュー保存中にエラーが発生しました:", error);
        throw error;
      }
    }
  }
}
