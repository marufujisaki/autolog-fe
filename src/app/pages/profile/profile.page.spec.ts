import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ProfilePage } from './profile.page';
import { AuthService } from '../../core/ports/auth.port';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { User, UserType } from '../../core/models/user.model';

describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let userSubject: BehaviorSubject<User | null>;

  const testUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    userType: UserType.USUARIO,
    preferredLanguage: 'es',
    allowSharing: false,
  };

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    userSubject = new BehaviorSubject<User | null>(testUser);
    Object.defineProperty(mockAuthService, 'user$', {
      value: userSubject.asObservable(),
    });

    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user name and email on initialization', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(component.userName).toBe('John Doe');
    expect(component.userEmail).toBe('test@example.com');
  }));

  it('should have default values before user loads', () => {
    expect(component.userName).toBe('Juan Perez');
    expect(component.userEmail).toBe('example@autolog.com');
  });

  it('should have a mechanics list', () => {
    expect(component.mechanics).toBeDefined();
    expect(component.mechanics.length).toBe(2);
    expect(component.mechanics[0].name).toBe('Taller La Candelaria');
  });

  it('should logout and navigate to home', () => {
    component.logout();

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should handle null user gracefully', fakeAsync(() => {
    userSubject.next(null);
    fixture.detectChanges();
    tick();

    // Should keep default values when user is null
    expect(component.userName).toBe('Juan Perez');
    expect(component.userEmail).toBe('example@autolog.com');
  }));
});
