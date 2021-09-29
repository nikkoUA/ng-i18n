import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { asyncScheduler, combineLatest, of, throwError } from 'rxjs';
import { delay, observeOn, skip } from 'rxjs/operators';
import { BaseLoader } from './base-loader';
import { NgI18nService } from './ng-i18n.service';

describe('NgI18nService standalone', () => {
  it('should work without Loader', done => {
    TestBed.configureTestingModule({ providers: [Injector, NgI18nService] });
    const service = TestBed.inject(NgI18nService);
    combineLatest([service.languages$, service.currentLanguage$]).subscribe(([a, b]) => {
      expect(a).toEqual(null);
      expect(b).toEqual(null);
      done();
    });
  });
});

describe('NgI18nService', () => {
  let service: NgI18nService;
  let loaderSpy: jasmine.SpyObj<BaseLoader>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Injector, NgI18nService, { provide: BaseLoader, useValue: jasmine.createSpyObj('BaseLoader', ['getTranslations', 'getSettings']) }
      ]
    });
    TestBed.inject(Injector);
    service = TestBed.inject(NgI18nService);
    loaderSpy = TestBed.inject(BaseLoader) as jasmine.SpyObj<BaseLoader>;
  });

  it('should observe languages list and default language as current language', done => {
    loaderSpy.getSettings.and.returnValue(of({ defaultLanguage: 'a', languages: ['a', 'b'] }));
    combineLatest([service.languages$, service.currentLanguage$]).subscribe(([a, b]) => {
      expect(a).toEqual(['a', 'b']);
      expect(b).toMatch('a');
      expect(loaderSpy.getSettings.calls.count()).toBe(1);
      done();
    });
  });

  it('should observe current language for undefined settings', done => {
    loaderSpy.getSettings.and.returnValue(throwError(new Error('Fake Error')));
    service.setLanguage('a');
    service.currentLanguage$.subscribe(x => {
      expect(x).toMatch('a');
      done();
    });
  });

  it('should observe default language as current language if try to set unknown language code', done => {
    loaderSpy.getSettings.and.returnValue(of({ defaultLanguage: 'a', languages: ['a', 'b'] }).pipe(delay(100)));
    service.setLanguage('c');
    service.currentLanguage$.subscribe(x => {
      expect(x).toMatch('a');
      done();
    });
  });

  it('should observe default language as current language if try to set null as language code', done => {
    loaderSpy.getSettings.and.returnValue(of({ defaultLanguage: 'a', languages: ['a', 'b'] }).pipe(delay(100)));
    service.setLanguage(null);
    service.currentLanguage$.subscribe(x => {
      expect(x).toMatch('a');
      done();
    });
  });

  it('should observe null as current language if no defaultLanguage and try to set try to set unknown language code', done => {
    loaderSpy.getSettings.and.returnValue(of({ languages: ['a', 'b'] }).pipe(delay(100)));
    service.setLanguage('c');
    service.currentLanguage$.subscribe(x => {
      expect(x).toEqual(null);
      done();
    });
  });

  it('should observe current language if no languages', done => {
    loaderSpy.getSettings.and.returnValue(of({ defaultLanguage: 'a' }).pipe(delay(100)));
    service.setLanguage('b');
    service.currentLanguage$.subscribe(x => {
      expect(x).toMatch('b');
      done();
    });
  });

  it('should observe current language', done => {
    loaderSpy.getSettings.and.returnValue(of({ defaultLanguage: 'a', languages: ['a', 'b'] }).pipe(delay(100)));
    service.setLanguage('b');
    service.currentLanguage$.subscribe(x => {
      expect(x).toMatch('b');
      done();
    });
  });

  it('getTranslation should observe translation string', done => {
    loaderSpy.getSettings.and.returnValue(of({ defaultLanguage: 'a' }));
    loaderSpy.getTranslations.and.returnValue(of(new Map<string, string>([['key', 'b']])));
    service.getTranslation('key').subscribe(x => {
      expect(x).toMatch('b');
      expect(loaderSpy.getTranslations.calls.count()).toBe(1);
      done();
    });
  });

  it('getTranslation should observe null if there is no translation for key', done => {
    loaderSpy.getSettings.and.returnValue(of({ defaultLanguage: 'a' }));
    loaderSpy.getTranslations.and.returnValue(of(new Map<string, string>([['key', 'b']])));
    service.getTranslation('unknown').subscribe(x => {
      expect(x).toBeNull();
      done();
    });
  });

  it('getTranslation should observe null if there is no translations for current language', done => {
    loaderSpy.getSettings.and.returnValue(of({ defaultLanguage: 'a' }));
    loaderSpy.getTranslations.and.returnValue(throwError(new Error('Fake Error')));
    service.getTranslation('key').subscribe(x => {
      expect(x).toBeNull();
      done();
    });
  });

  it('getTranslation should return translations for language switch', done => {
    let isDone = false;
    let currentLang = 'a';
    loaderSpy.getSettings.and.returnValue(of({ defaultLanguage: 'a', languages: ['a', 'b'] }));
    loaderSpy.getTranslations.and.returnValue(of(new Map<string, string>([['key', 'translation a']])));
    service.getTranslation('key').subscribe(x => {
      if (currentLang === 'a') expect(x).toMatch('translation a');
      if (currentLang === 'b') expect(x).toMatch('translation b');
      if (isDone) {
        expect(loaderSpy.getTranslations.calls.count()).toBe(2);
        done();
      }
    });
    of('b', 'a').pipe(observeOn(asyncScheduler)).subscribe(x => {
      if (x === 'b') loaderSpy.getTranslations.and.returnValue(of(new Map<string, string>([['key', 'translation b']])));
      if (x === 'a') {
        loaderSpy.getTranslations.and.returnValue(of(new Map<string, string>([['key', 'translation a']])));
        isDone = true;
      }
      currentLang = x;
      service.setLanguage(x);
    });
  });

  it('should reload languages', done => {
    loaderSpy.getSettings.and.returnValue(of({ defaultLanguage: 'a', languages: ['a', 'b'] }));
    combineLatest([service.languages$, service.currentLanguage$]).pipe(skip(2)).subscribe(([a, b]) => {
      expect(a).toEqual(['aa', 'bb']);
      expect(b).toMatch('aa');
      expect(loaderSpy.getSettings.calls.count()).toBe(2);
      done();
    });
    loaderSpy.getSettings.and.returnValue(of({ defaultLanguage: 'aa', languages: ['aa', 'bb'] }));
    service.reset();
  });

  it('should reload translations', done => {
    loaderSpy.getSettings.and.returnValue(of({ defaultLanguage: 'a' }));
    loaderSpy.getTranslations.and.returnValue(of(new Map<string, string>([['key', 'b']])));
    service.getTranslation('key').pipe(skip(1)).subscribe(x => {
      expect(x).toMatch('bb');
      expect(loaderSpy.getTranslations.calls.count()).toBe(2);
      done();
    });
    loaderSpy.getTranslations.and.returnValue(of(new Map<string, string>([['key', 'bb']])));
    service.reset();
  });
});
