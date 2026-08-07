import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';

import { TabsPage } from './tabs.page';
import { AuthService } from '../core/ports/auth.port';
import { UserType } from '../core/models/user.model';

describe('TabsPage', () => {
  let component: TabsPage;
  let fixture: ComponentFixture<TabsPage>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUserType']);
    mockAuthService.getUserType.and.returnValue(UserType.USUARIO);

    await TestBed.configureTestingModule({
      imports: [TabsPage],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('opens the add-vehicle modal for non-mechanic users', () => {
    component.openAddVehicle();
    expect(component.addVehicleModalOpen).toBeTrue();
  });

  it('navigates to the scan-vehicle page for MECANICO users instead of opening the modal', () => {
    mockAuthService.getUserType.and.returnValue(UserType.MECANICO);
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');

    component.openAddVehicle();

    expect(component.addVehicleModalOpen).toBeFalse();
    expect(navigateSpy).toHaveBeenCalledWith(['/scan-vehicle']);
  });
});
