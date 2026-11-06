/// <reference path="./types.ts" />

namespace BanAppealNotifier {
  /**
   * PropertiesService を利用して未送信通知を JSON として永続化するキューサービス
   * Script Properties の上限は 1 つの値につき 9 KB、全体で 500 KB なので、JSON を分けて保存し、全体の大きさにも上限を設ける
   */
  export class QueueService implements IQueueService {
    private static readonly PROPERTY_KEY = "PENDING_NOTIFICATIONS_QUEUE";
    // 日本語は 1 文字 3 バイトなので、2500 文字で 7.5 KB に収まる
    private static readonly CHUNK_CHARS = 2500;
    private static readonly MAX_TOTAL_CHARS = 100000;

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
        const json = this.readJson(props.getProperties());
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
        this.save([]);
        console.log("[QueueService] キューをクリアしました。");
      } catch (error) {
        console.error("[QueueService] キュー削除中にエラーが発生しました:", error);
      }
    }

    /**
     * 分割して保存した JSON を 1 つに戻す (分割する前の形式の値も読む)
     */
    private readJson(all: { [key: string]: string }): string {
      let json = all[QueueService.PROPERTY_KEY] || "";
      for (let i = 0; all[`${QueueService.PROPERTY_KEY}_${i}`] !== undefined; i++) {
        json += all[`${QueueService.PROPERTY_KEY}_${i}`];
      }
      return json;
    }

    /**
     * JSON をプロパティの値に収まる大きさに分ける (サロゲートペアは分けない)
     */
    private toChunks(json: string): { [key: string]: string } {
      const chunks: { [key: string]: string } = {};
      let start = 0;
      for (let i = 0; start < json.length; i++) {
        let end = Math.min(start + QueueService.CHUNK_CHARS, json.length);
        const last = json.charCodeAt(end - 1);
        if (end < json.length && last >= 0xd800 && last <= 0xdbff) {
          end--;
        }
        chunks[`${QueueService.PROPERTY_KEY}_${i}`] = json.substring(start, end);
        start = end;
      }
      return chunks;
    }

    /**
     * 全体の上限を超えるときは、古いものから捨てる
     */
    private trimToLimit(items: PendingItem[]): PendingItem[] {
      let kept = items;
      while (kept.length > 1 && JSON.stringify(kept).length > QueueService.MAX_TOTAL_CHARS) {
        console.error(`[QueueService] キューの上限を超えたため、最も古いアイテムを捨てます (ID: ${kept[0].id})`);
        kept = kept.slice(1);
      }
      return kept;
    }

    /**
     * アイテムリストを PropertiesService に保存する
     */
    private save(items: PendingItem[]): void {
      try {
        const props = PropertiesService.getScriptProperties();
        const kept = this.trimToLimit(items);
        const chunks = kept.length === 0 ? {} : this.toChunks(JSON.stringify(kept));
        if (kept.length > 0) {
          props.setProperties(chunks);
        }
        // 今回の分に含まれない古い値を消す
        for (const key of Object.keys(props.getProperties())) {
          const isQueueKey = key === QueueService.PROPERTY_KEY || key.startsWith(`${QueueService.PROPERTY_KEY}_`);
          if (isQueueKey && chunks[key] === undefined) {
            props.deleteProperty(key);
          }
        }
      } catch (error) {
        console.error("[QueueService] キュー保存中にエラーが発生しました:", error);
        throw error;
      }
    }
  }
}
