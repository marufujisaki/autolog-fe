import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ShareVehiclePage } from './share-vehicle.page';
import { ShareService } from '../../core/ports/share.port';
import { VehicleService } from '../../core/ports/vehicle.port';
import { Vehicle } from '../../core/models/vehicle.model';
import { VehicleShareInfo, ShareStatus } from '../../core/models/share.model';
import { TranslateService } from '@ngx-translate/core';

describe('ShareVehiclePage', () => {
  let component: ShareVehiclePage;
  let fixture: ComponentFixture<ShareVehiclePage>;
  let mockShareService: jasmine.SpyObj<ShareService>;
  let mockVehicleService: jasmine.SpyObj<VehicleService>;
  let mockActivatedRoute: any;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;

  const mockVehicle: Vehicle = {
    id: '123',
    ownerId: 'user-1',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2022,
    licensePlate: 'ABC123',
    currentMileage: 50000,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockShareInfo: VehicleShareInfo = {
    id: 'share-1',
    vehicleId: '123',
    shareToken: 'token123',
    shareUrl: 'https://example.com/share/token123',
    status: ShareStatus.PENDING,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  beforeEach(async () => {
    mockShareService = jasmine.createSpyObj('ShareService', [
      'generateShareLink',
      'claimShare',
      'revokeShare',
    ]);

    mockVehicleService = jasmine.createSpyObj('VehicleService', [
      'getVehicles',
      'getVehicle',
      'createVehicle',
      'updateVehicle',
    ]);

    mockTranslateService = jasmine.createSpyObj('TranslateService', [
      'use',
      'instant',
    ]);
    mockTranslateService.instant.and.returnValue('mocked-translation');

    mockActivatedRoute = {
      params: of({ vehicleId: '123' }),
    };

    await TestBed.configureTestingModule({
      imports: [ShareVehiclePage],
      providers: [
        { provide: ShareService, useValue: mockShareService },
        { provide: VehicleService, useValue: mockVehicleService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShareVehiclePage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load vehicle and share info on init', (done) => {
      mockVehicleService.getVehicle.and.returnValue(of(mockVehicle));

      component.ngOnInit();

      setTimeout(() => {
        expect(mockVehicleService.getVehicle).toHaveBeenCalledWith('123');
        expect(component.vehicle).toEqual(mockVehicle);
        done();
      }, 100);
    });

    it('should handle vehicle loading error', (done) => {
      const error = new Error('Load failed');
      mockVehicleService.getVehicle.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      component.ngOnInit();

      setTimeout(() => {
        expect(console.error).toHaveBeenCalledWith(
          'Failed to load vehicle:',
          error,
        );
        expect(component.vehicle).toBeNull();
        done();
      }, 100);
    });
  });

  describe('generateShareLink', () => {
    beforeEach(() => {
      component.vehicle = mockVehicle;
    });

    it('should generate a new share link', (done) => {
      mockShareService.generateShareLink.and.returnValue(of(mockShareInfo));

      component.generateShareLink();

      setTimeout(() => {
        expect(mockShareService.generateShareLink).toHaveBeenCalledWith('123');
        expect(component.vehicleShare).toEqual(mockShareInfo);
        expect(component.qrValue).toBe(mockShareInfo.shareUrl!);
        expect(component.isGeneratingShare).toBeFalse();
        done();
      }, 100);
    });

    it('should handle share generation error', (done) => {
      const error = new Error('Generation failed');
      mockShareService.generateShareLink.and.returnValue(
        throwError(() => error),
      );
      spyOn(console, 'error');

      component.generateShareLink();

      setTimeout(() => {
        expect(console.error).toHaveBeenCalledWith(
          'Failed to generate share link:',
          error,
        );
        expect(component.isGeneratingShare).toBeFalse();
        done();
      }, 100);
    });

    it('should not generate if vehicle is null', () => {
      component.vehicle = null;
      mockShareService.generateShareLink.and.returnValue(of(mockShareInfo));

      component.generateShareLink();

      expect(mockShareService.generateShareLink).not.toHaveBeenCalled();
    });
  });

  describe('revokeShare', () => {
    beforeEach(() => {
      component.vehicle = mockVehicle;
      component.vehicleShare = mockShareInfo;
    });

    it('should revoke the current share', (done) => {
      mockShareService.revokeShare.and.returnValue(of(undefined));

      component.revokeShare();

      setTimeout(() => {
        expect(mockShareService.revokeShare).toHaveBeenCalledWith('123');
        expect(component.vehicleShare).toBeNull();
        expect(component.qrValue).toBeNull();
        expect(component.isRevokingShare).toBeFalse();
        done();
      }, 100);
    });

    it('should handle revoke error', (done) => {
      const error = new Error('Revoke failed');
      mockShareService.revokeShare.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      component.revokeShare();

      setTimeout(() => {
        expect(console.error).toHaveBeenCalledWith(
          'Failed to revoke share:',
          error,
        );
        expect(component.isRevokingShare).toBeFalse();
        done();
      }, 100);
    });

    it('should not revoke if vehicle is null', () => {
      component.vehicle = null;
      mockShareService.revokeShare.and.returnValue(of(undefined));

      component.revokeShare();

      expect(mockShareService.revokeShare).not.toHaveBeenCalled();
    });
  });

  describe('getTimeRemaining', () => {
    it('should calculate time remaining correctly', () => {
      const futureDate = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours from now
      component.vehicleShare = {
        ...mockShareInfo,
        expiresAt: futureDate.toISOString(),
      };

      const result = component.getTimeRemaining();

      // Should be approximately 3 hours
      expect(result).toContain('3h');
    });

    it('should return expired message if share has expired', () => {
      const pastDate = new Date(Date.now() - 1000); // 1 second ago
      component.vehicleShare = {
        ...mockShareInfo,
        expiresAt: pastDate.toISOString(),
      };

      mockTranslateService.instant.and.returnValue('EXPIRED');

      const result = component.getTimeRemaining();

      expect(result).toBe('EXPIRED');
    });

    it('should return empty string if no share', () => {
      component.vehicleShare = null;

      const result = component.getTimeRemaining();

      expect(result).toBe('');
    });
  });

  describe('copyShareLink', () => {
    beforeEach(() => {
      spyOn(navigator.clipboard, 'writeText').and.returnValue(
        Promise.resolve(),
      );
      spyOn(console, 'log');
    });

    it('should copy share URL to clipboard', (done) => {
      component.vehicleShare = mockShareInfo;

      component.copyShareLink();

      setTimeout(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          mockShareInfo.shareUrl!,
        );
        expect(console.log).toHaveBeenCalledWith(
          'Share link copied to clipboard',
        );
        done();
      }, 100);
    });

    it('should handle clipboard write error', (done) => {
      component.vehicleShare = mockShareInfo;
      const error = new Error('Clipboard failed');
      (navigator.clipboard.writeText as jasmine.Spy).and.returnValue(
        Promise.reject(error),
      );
      spyOn(console, 'error');

      component.copyShareLink();

      setTimeout(() => {
        expect(console.error).toHaveBeenCalledWith(
          'Failed to copy share link:',
          error,
        );
        done();
      }, 100);
    });

    it('should not copy if no share link', () => {
      component.vehicleShare = null;

      component.copyShareLink();

      expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    });
  });

  describe('openRevokeConfirmation', () => {
    it('should open revoke confirmation alert', () => {
      component.showRevokeAlert = false;

      component.openRevokeConfirmation();

      expect(component.showRevokeAlert).toBeTrue();
    });
  });

  describe('cancelRevoke', () => {
    it('should close revoke confirmation alert', () => {
      component.showRevokeAlert = true;

      component.cancelRevoke();

      expect(component.showRevokeAlert).toBeFalse();
    });
  });

  describe('Share Status Handling', () => {
    it('should display PENDING share with QR code and link', () => {
      component.vehicleShare = {
        ...mockShareInfo,
        status: ShareStatus.PENDING,
      };

      expect(component.vehicleShare?.status).toBe(ShareStatus.PENDING);
    });

    it('should display expired share message', () => {
      component.vehicleShare = {
        ...mockShareInfo,
        status: ShareStatus.EXPIRED,
      };

      expect(component.vehicleShare?.status).toBe(ShareStatus.EXPIRED);
    });

    it('should display revoked share message', () => {
      component.vehicleShare = {
        ...mockShareInfo,
        status: ShareStatus.REVOKED,
      };

      expect(component.vehicleShare?.status).toBe(ShareStatus.REVOKED);
    });
  });
});
