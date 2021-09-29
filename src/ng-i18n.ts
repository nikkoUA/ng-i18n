import { Observable } from 'rxjs';

/**
 * NgI18n namespace contains an Interfaces used in {@link NgI18nModule}
 *
 * @public
 */
export namespace NgI18n {
  /**
   * An interface describing a Loader.
   * @public
   */
  export interface Loader {
    /**
     * Returns the stream of translations
     *
     * @param langCode - the language code
     * @returns Stream of translations required by a language code
     * @public
     */
    readonly getTranslations: (langCode: string) => Observable<Translations>;

    /**
     * Returns the stream of settings
     *
     * @returns Stream of settings
     * @public
     */
    readonly getSettings: () => Observable<Settings>;
  }

  /**
   * An type describing a Translations.
   * @public
   */
  export type Translations = Map<string, string>;

  /**
   * An interface describing a Settings.
   * @public
   */
  export interface Settings {
    /**
     * Contains default language code
     * @readonly
     */
    readonly defaultLanguage?: string;

    /**
     * Contains available languages collection
     * @readonly
     */
    readonly languages?: ReadonlyArray<string>;
  }
}
