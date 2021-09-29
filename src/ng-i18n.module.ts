import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BaseLoader } from './base-loader';
import { NgI18nLoader } from './ng-i18n-loader';

/**
 * Angular Internationalization (i18n) library.
 *
 * @remarks
 * Use for translate user interface to different languages.
 *
 * @decorator `@NgModule`
 * @public
 */
@NgModule({
  providers: [{ provide: BaseLoader, useClass: NgI18nLoader, deps: [HttpClient, 'SETTINGS_URL', 'TRANSLATIONS_URL'] }]
})
export class NgI18nModule {}
