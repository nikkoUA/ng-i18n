import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BaseLoader } from './base-loader';
import { NgI18n } from './ng-i18n';

class Loader extends BaseLoader {
  constructor(httpClient: HttpClient) {
    super(httpClient, '');
  }

  getTranslations(): Observable<NgI18n.Translations> {
    return of(new Map());
  }
}

describe('BaseLoader', () => {
  it('should return settings', done => {
    const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    const loader = new Loader(httpClientSpy as any);
    const mockSettings = { defaultLanguage: 'a', languages: ['a', 'b'] };

    httpClientSpy.get.and.returnValue(of(mockSettings));
    loader.getSettings().subscribe(x => {
      expect(x).toEqual(mockSettings);
      done();
    }, done.fail);
  });
});
