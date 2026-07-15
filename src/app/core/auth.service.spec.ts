import { TestBed } from '@angular/core/testing';
import { AuthService } from './ports/auth.port';
import { HttpAuthService } from '../data/http/http-auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SecureStorageService } from './ports/secure-storage.port';

describe('AuthService (HttpAuthService)', () => {
  let service: AuthService;
  let mockStorage: jasmine.SpyObj<SecureStorageService>;

  beforeEach(() => {
    mockStorage = jasmine.createSpyObj('SecureStorageService', [
      'getItem',
      'setItem',
      'removeItem',
    ]);
    mockStorage.getItem.and.returnValue(Promise.resolve(null));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useClass: HttpAuthService },
        { provide: SecureStorageService, useValue: mockStorage },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not be authenticated initially', () => {
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should return null user type initially', () => {
    expect(service.getUserType()).toBeNull();
  });

  it('should return null access token initially', () => {
    expect(service.getAccessToken()).toBeNull();
  });
});
