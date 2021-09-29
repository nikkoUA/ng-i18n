import { of } from 'rxjs';
import { NgI18nLoader } from './ng-i18n-loader';

describe('NgI18nLoader', () => {
  it('should return translations', done => {
    const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    const loader = new NgI18nLoader(httpClientSpy as any, '', '');
    const mockTranslations = new Map([['key1', 'a'], ['key2', 'b']]);

    httpClientSpy.get.and.returnValue(of({ key1: 'a', key2: 'b' }));
    loader.getTranslations('').subscribe(x => {
      expect(x).toEqual(mockTranslations);
      done();
    }, done.fail);
  });
});
