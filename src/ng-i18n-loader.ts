import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseLoader } from './base-loader';
import { NgI18n } from './ng-i18n';

/**
 * class NgI18nLoader.
 *
 * @remarks
 * Can be used by {@link NgI18nModule} for provide {@link NgI18n.Loader}
 *
 * @decorator `@Injectable`
 * @public
 */
@Injectable()
export class NgI18nLoader extends BaseLoader {
  /**
   * NgI18nLoader class constructor
   *
   * @param httpClient - HttpClient class
   * @param settingsUrl - Settings URL
   * @param translationsUrl - Translations URL
   */
  constructor(httpClient: HttpClient, @Inject('SETTINGS_URL') settingsUrl: string, @Inject('TRANSLATIONS_URL') private readonly translationsUrl: string) {
    super(httpClient, settingsUrl);
  }

  /** {@inheritDoc NgI18n.Loader.getTranslations} */
  getTranslations(langCode: string): Observable<NgI18n.Translations> {
    return this.httpClient.get(`${this.translationsUrl}${langCode}.json`).pipe(map(x => new Map(Array.from(Object.entries(x)))));
  }
}
