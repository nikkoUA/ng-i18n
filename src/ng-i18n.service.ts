import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, combineLatest, defer, Observable, of, Subject } from 'rxjs';
import { catchError, filter, map, repeatWhen, share, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';

import { BaseLoader } from './base-loader';
import { NgI18n } from './ng-i18n';

@Injectable({ providedIn: 'root' })
export class NgI18nService {
  private readonly resetSubject = new Subject();
  private readonly loader: NgI18n.Loader = { getTranslations: () => of(new Map<string, string>()), getSettings: () => of({}) };
  private readonly langCodeSubject = new BehaviorSubject<string | null | undefined>(undefined);
  private readonly translations = new Map<string, NgI18n.Translations>();
  private readonly currentTranslations$: Observable<NgI18n.Translations> = of(new Map());
  private readonly getTranslationsRequestSubject = new BehaviorSubject<Observable<NgI18n.Translations | undefined> | null>(null);

  readonly languages$: Observable<ReadonlyArray<string> | null> = of(null);
  readonly currentLanguage$: Observable<string | null> = of(null);

  constructor(injector: Injector) {
    try {
      this.loader = injector.get(BaseLoader);

      this.resetSubject.subscribe(() => this.translations.clear());

      const settings$ = defer(() => this.loader.getSettings()).pipe(repeatWhen(() => this.resetSubject), catchError(() => of<NgI18n.Settings>({})), shareReplay(1));

      this.languages$ = settings$.pipe(map(x => x.languages || null));

      this.currentLanguage$ = combineLatest([this.langCodeSubject, settings$]).pipe(map(([langCode, settings]) => {
        if (!langCode) return settings.defaultLanguage || null;
        if (settings.languages) return settings.languages.includes(langCode) ? langCode : settings.defaultLanguage || null;
        return langCode;
      }), shareReplay(1));

      this.currentTranslations$ = this.currentLanguage$.pipe(
        switchMap(langCode => langCode && this.getTranslations(langCode) || of(new Map())),
        tap(() => this.getTranslationsRequestSubject.next(null)),
        shareReplay(1));
    }
    catch (e) {}
  }

  private getTranslations(langCode: string): Observable<NgI18n.Translations> {
    if (!langCode) return of(new Map());
    if (this.translations.has(langCode)) return of(this.translations.get(langCode) as NgI18n.Translations);
    let getTranslationsRequest$ = this.getTranslationsRequestSubject.getValue();
    if (!getTranslationsRequest$) {
      getTranslationsRequest$ = this.loader.getTranslations(langCode).pipe(catchError(() => of(new Map())), tap(x => this.translations.set(langCode, x)), startWith(undefined), share());
      this.getTranslationsRequestSubject.next(getTranslationsRequest$);
    }
    return getTranslationsRequest$.pipe(filter(x => x !== undefined), map(x => x as NgI18n.Translations));
  }

  setLanguage(langCode: string | null | undefined): void {
    this.langCodeSubject.next(langCode ? langCode.trim().toLowerCase() : langCode);
  }

  getTranslation(key: string): Observable<string | null> {
    return this.currentTranslations$.pipe(map(x => x.get(key) || null));
  }

  reset(): void {
    this.resetSubject.next();
  }
}
