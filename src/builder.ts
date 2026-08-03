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

    private static readonly MAX_FIELD_NAME_LENGTH = 256;
    private static readonly MAX_FIELD_VALUE_LENGTH = 1024;
    private static readonly MAX_FIELDS_PER_EMBED = 25;
    private static readonly MAX_EMBEDS_PER_PAYLOAD = 10;

    /**
     * Google フォームの FormResponse を受け取り、DiscordEmbed の配列を構築する (25フィールド毎に分割)
     */
    public buildEmbeds(response: GoogleAppsScript.Forms.FormResponse): DiscordEmbed[] {
      const allFields = this.extractFields(response);
      const timestamp = response.getTimestamp().toISOString();

      if (allFields.length === 0) {
        return [
          {
            color: this.config.embedColor,
            timestamp,
            fields: [],
          },
        ];
      }

      const embeds: DiscordEmbed[] = [];
      for (let i = 0; i < allFields.length; i += DiscordEmbedBuilder.MAX_FIELDS_PER_EMBED) {
        if (embeds.length >= DiscordEmbedBuilder.MAX_EMBEDS_PER_PAYLOAD) {
          console.warn(
            `[DiscordEmbedBuilder] フィールド総数が上限を超過したため、最初の ${
              DiscordEmbedBuilder.MAX_FIELDS_PER_EMBED * DiscordEmbedBuilder.MAX_EMBEDS_PER_PAYLOAD
            } 項目のみを送信します。`
          );
          break;
        }

        const chunkFields = allFields.slice(i, i + DiscordEmbedBuilder.MAX_FIELDS_PER_EMBED);
        embeds.push({
          color: this.config.embedColor,
          timestamp,
          fields: chunkFields,
        });
      }

      return embeds;
    }

    /**
     * Google フォームの FormResponse を受け取り、単一の DiscordEmbed を構築する
     */
    public build(response: GoogleAppsScript.Forms.FormResponse): DiscordEmbed {
      return this.buildEmbeds(response)[0];
    }

    /**
     * フォームの個々の回答から Discord Embed の Field 配列を抽出し整形する (文字数制限を適用)
     */
    private extractFields(response: GoogleAppsScript.Forms.FormResponse): DiscordEmbedField[] {
      const itemResponses = response.getItemResponses();

      return itemResponses.map((itemResponse) => {
        const title = itemResponse.getItem().getTitle();
        const rawResponse = itemResponse.getResponse();
        const formattedValue = this.formatValue(rawResponse);

        return {
          name: this.truncateString(title, DiscordEmbedBuilder.MAX_FIELD_NAME_LENGTH),
          value: this.truncateString(formattedValue, DiscordEmbedBuilder.MAX_FIELD_VALUE_LENGTH),
          inline: false,
        };
      });
    }

    /**
     * 指定された最大文字数を超える文字列を安全に切り捨てる
     */
    private truncateString(str: string, maxLength: number): string {
      if (str.length <= maxLength) {
        return str;
      }
      return str.slice(0, maxLength - 3) + "...";
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
