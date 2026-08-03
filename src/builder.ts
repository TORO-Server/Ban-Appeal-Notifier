/// <reference path="./types.ts" />

namespace BanAppealNotifier {
  /**
   * フォームの回答内容から Discord Embed を構築するビルダー
   */
  export class DiscordEmbedBuilder implements IEmbedBuilder {
    private declare config: AppConfig;

    constructor(config: AppConfig) {
      this.config = config;
    }

    /**
     * Google フォームの FormResponse を受け取り、DiscordEmbed を構築する
     */
    public build(response: GoogleAppsScript.Forms.FormResponse): DiscordEmbed {
      const fields = this.extractFields(response);
      const timestamp = response.getTimestamp().toISOString();

      return {
        color: this.config.embedColor,
        timestamp,
        fields,
      };
    }

    /**
     * フォームの個々の回答から Discord Embed の Field 配列を抽出し整形する
     */
    private extractFields(response: GoogleAppsScript.Forms.FormResponse): DiscordEmbedField[] {
      const itemResponses = response.getItemResponses();

      return itemResponses.map((itemResponse) => {
        const title = itemResponse.getItem().getTitle();
        const rawResponse = itemResponse.getResponse();
        const formattedValue = this.formatValue(rawResponse);

        return {
          name: title,
          value: formattedValue,
          inline: false,
        };
      });
    }

    /**
     * 回答オブジェクトを文字列にフォーマットする
     */
    private formatValue(rawResponse: string | string[] | string[][]): string {
      if (Array.isArray(rawResponse)) {
        const joined = rawResponse.flat().join(", ").trim();
        return joined.length > 0 ? joined : this.config.noneText;
      }

      const stringified = String(rawResponse || "").trim();
      return stringified.length > 0 ? stringified : this.config.noneText;
    }
  }

  /**
   * 後方互換性のためのクラスエイリアス
   */
  export const FormEmbedBuilder = DiscordEmbedBuilder;
}
