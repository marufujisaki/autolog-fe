import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userTypeSubject = new BehaviorSubject<number | null>(null);
  userType$: Observable<number | null> = this.userTypeSubject.asObservable();

  setUserType(userTypeId: number) {
    this.userTypeSubject.next(userTypeId);
  }
}
