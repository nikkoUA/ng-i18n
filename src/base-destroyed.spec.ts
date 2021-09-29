import { mapTo } from 'rxjs/operators';
import { _BaseDestroyed } from './base-destroyed';

class Destroyed extends _BaseDestroyed {
  readonly destroyEvent$ = this._destroyed$.pipe(mapTo(true));
}

describe('BaseDestroyed', () => {
  it('should emit destroy event and complete source', done => {
    const destroyed = new Destroyed();
    destroyed.ngOnDestroy();
    destroyed.destroyEvent$.subscribe({
      next: x => expect(x).toBeTrue(),
      complete: () => {
        expect().nothing();
        done();
      }
    });
  });
});
