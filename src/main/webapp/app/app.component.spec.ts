import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, ComponentFixtureAutoDetect, TestBed, waitForAsync } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AccountService } from './auth/account.service';
import { AuthServerProvider } from './auth/auth-jwt.service';
import { LoginService } from './login/login.service';
import NavComponent from './nav/nav.component';

import { AppComponent } from './app.component';

describe('App Component', () => {
  let comp: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NavComponent],
      providers: [
        provideRouter([]),
        provideHttpClientTesting(),
        { provide: ComponentFixtureAutoDetect, useValue: true },
        { provide: AccountService, useValue: { getAuthenticationState: () => of(null) } },
        {
          provide: LoginService,
          useValue: {
            login: () => {
              /* intentionally empty for test */
            },
            logout: () => {
              /* intentionally empty for test */
            },
          },
        },
        {
          provide: AuthServerProvider,
          useValue: {
            login: () => {
              /* intentionally empty for test */
            },
            logout: () => {
              /* intentionally empty for test */
            },
          },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should have appName', () => {
      expect(comp.appName()).toBe('AIsample');
    });
  });
});
