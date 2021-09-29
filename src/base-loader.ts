import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NgI18n } from './ng-i18n';

/**
 * Abstract class BaseLoader.
 *
 * @decorator `@Injectable`
 * @public
 */
@Injectable()
export abstract class BaseLoader implements NgI18n.Loader {
  /**
   * BaseLoader class constructor
   *
   * @param httpClient - HttpClient class
   * @param settingsUrl - Settings URL
   */
  constructor(protected readonly httpClient: HttpClient, private readonly settingsUrl: string) {}

  /** {@inheritDoc NgI18n.Loader.getTranslations} */
  abstract getTranslations(langCode: string): Observable<NgI18n.Translations>;

  /** {@inheritDoc NgI18n.Loader.getSettings} */
  getSettings(): Observable<NgI18n.Settings> {
    return this.httpClient.get<NgI18n.Settings>(this.settingsUrl);
  }
}
