import { OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Abstract class contains RXJS source that emits event when the method ngOnDestroy() is called
 *
 * @internal
 */
export abstract class _BaseDestroyed implements OnDestroy {
  private readonly _destroySubject = new Subject();

  /**
   * This event is fired once when the method ngOnDestroy() is called
   * @eventProperty
   */
  protected readonly _destroyed$ = this._destroySubject.asObservable();

  /**
   * A callback method that performs custom clean-up, invoked immediately before a directive, pipe, or service instance is destroyed.
   */
  ngOnDestroy(): void {
    this._destroySubject.next();
    this._destroySubject.complete();
  }
}
