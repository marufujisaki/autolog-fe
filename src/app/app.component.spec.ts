import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { TranslateService } from '@ngx-translate/core';

describe('AppComponent', () => {
  it('should create the app', async () => {
    const mockTranslateService = jasmine.createSpyObj('TranslateService', [
      'addLangs',
      'use',
      'currentLang',
      'instant',
      'get',
    ]);
    mockTranslateService.currentLang.and.returnValue('es');

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
