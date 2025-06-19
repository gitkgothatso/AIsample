import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Login } from '../login/login.model';
import { AuthServerProvider } from './auth-jwt.service';

export interface RegistrationData {
  username: string;
  email: string;
  password: string;
}

export interface PasswordResetData {
  resetToken: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private http: HttpClient,
    private authServerProvider: AuthServerProvider,
  ) {}

  // Login
  login(credentials: Login): Observable<void> {
    return this.authServerProvider.login(credentials);
  }

  // Logout
  logout(): Observable<void> {
    return this.authServerProvider.logout();
  }

  // Registration
  register(registrationData: RegistrationData): Observable<string> {
    return this.http.post('api/register', registrationData, { responseType: 'text' });
  }

  // Account Activation - Send as plain text, not JSON
  activateAccount(activationToken: string): Observable<string> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain');
    return this.http.post('api/activate', activationToken, { headers, responseType: 'text' });
  }

  // Request Password Reset - Send as plain text, not JSON
  requestPasswordReset(email: string): Observable<string> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain');
    return this.http.post('api/account/reset-password/init', email, { headers, responseType: 'text' });
  }

  // Complete Password Reset
  resetPassword(resetData: PasswordResetData): Observable<string> {
    return this.http.post('api/account/reset-password/finish', resetData, { responseType: 'text' });
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authenticationToken');
  }

  // Get authentication token
  getToken(): string | null {
    return localStorage.getItem('authenticationToken');
  }
}
