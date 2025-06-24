import { Injectable } from '@angular/core';

export interface ErrorInfo {
  message: string;
  type: 'error' | 'warning' | 'info';
  code?: string;
  details?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  /**
   * Convert HTTP errors to user-friendly messages
   */
  handleHttpError(error: any): ErrorInfo {
    if (!error) {
      return {
        message: 'An unexpected error occurred. Please try again.',
        type: 'error'
      };
    }

    // Handle different HTTP status codes
    switch (error.status) {
      case 400:
        return this.handleBadRequest(error);
      case 401:
        return {
          message: 'Your session has expired. Please log in again.',
          type: 'error',
          code: 'UNAUTHORIZED'
        };
      case 403:
        return {
          message: 'You do not have permission to perform this action.',
          type: 'error',
          code: 'FORBIDDEN'
        };
      case 404:
        return {
          message: 'The requested resource was not found.',
          type: 'error',
          code: 'NOT_FOUND'
        };
      case 409:
        return this.handleConflictError(error);
      case 422:
        return this.handleValidationError(error);
      case 429:
        return {
          message: 'Too many requests. Please wait a moment and try again.',
          type: 'error',
          code: 'RATE_LIMITED'
        };
      case 500:
        return {
          message: 'Server error. Please try again later.',
          type: 'error',
          code: 'SERVER_ERROR'
        };
      case 503:
        return {
          message: 'Service temporarily unavailable. Please try again later.',
          type: 'error',
          code: 'SERVICE_UNAVAILABLE'
        };
      default:
        return {
          message: 'An unexpected error occurred. Please try again.',
          type: 'error',
          code: 'UNKNOWN_ERROR'
        };
    }
  }

  /**
   * Handle authentication-specific errors
   */
  handleAuthError(error: any): ErrorInfo {
    if (error.status === 403) {
      return {
        message: 'Invalid username or password',
        type: 'error',
        code: 'AUTH_FAILED'
      };
    }

    if (error.status === 401) {
      return {
        message: 'Your session has expired. Please log in again.',
        type: 'error',
        code: 'SESSION_EXPIRED'
      };
    }

    return this.handleHttpError(error);
  }

  /**
   * Handle registration-specific errors
   */
  handleRegistrationError(error: any): ErrorInfo {
    // Handle Spring Boot problem details (RFC 7807)
    if (error && error.error && error.error.errors && typeof error.error.errors === 'object') {
      // Collect all field error messages
      const fieldErrors = error.error.errors;
      const messages: string[] = [];
      for (const key in fieldErrors) {
        if (Object.prototype.hasOwnProperty.call(fieldErrors, key)) {
          const val = fieldErrors[key];
          if (Array.isArray(val)) {
            messages.push(...val);
          } else if (typeof val === 'string') {
            messages.push(val);
          }
        }
      }
      // Join all messages, or just show the first
      return {
        message: messages.length > 0 ? messages.join(' ') : 'Some fields are invalid. Please check your input.',
        type: 'error',
        code: 'VALIDATION_ERROR',
        details: JSON.stringify(fieldErrors)
      };
    }

    let errorMessage = error.error || error.message || '';
    if (typeof errorMessage !== 'string') {
      if (errorMessage && errorMessage.message && typeof errorMessage.message === 'string') {
        errorMessage = errorMessage.message;
      } else {
        errorMessage = JSON.stringify(errorMessage);
      }
    }
    const lowerMessage = errorMessage.toLowerCase();

    if (lowerMessage.includes('username') && lowerMessage.includes('exist')) {
      return {
        message: 'Username is already taken.',
        type: 'error',
        code: 'USERNAME_EXISTS'
      };
    }

    if (lowerMessage.includes('email') && lowerMessage.includes('exist')) {
      return {
        message: 'Email is already registered.',
        type: 'error',
        code: 'EMAIL_EXISTS'
      };
    }

    if (lowerMessage.includes('password') && lowerMessage.includes('weak')) {
      return {
        message: 'Password is too weak. Please choose a stronger password.',
        type: 'error',
        code: 'WEAK_PASSWORD'
      };
    }

    return this.handleHttpError(error);
  }

  /**
   * Handle profile update errors
   */
  handleProfileError(error: any): ErrorInfo {
    let errorMessage = error.error || error.message || '';
    if (typeof errorMessage !== 'string') {
      if (errorMessage && errorMessage.message && typeof errorMessage.message === 'string') {
        errorMessage = errorMessage.message;
      } else {
        errorMessage = JSON.stringify(errorMessage);
      }
    }
    const lowerMessage = errorMessage.toLowerCase();

    if (lowerMessage.includes('email') && lowerMessage.includes('exist')) {
      return {
        message: 'This email address is already in use by another account.',
        type: 'error',
        code: 'EMAIL_IN_USE'
      };
    }

    if (lowerMessage.includes('validation')) {
      return {
        message: 'Please check your input and try again.',
        type: 'error',
        code: 'VALIDATION_ERROR'
      };
    }

    return this.handleHttpError(error);
  }

  /**
   * Handle password change errors
   */
  handlePasswordError(error: any): ErrorInfo {
    let errorMessage = error.error || error.message || '';
    if (typeof errorMessage !== 'string') {
      if (errorMessage && errorMessage.message && typeof errorMessage.message === 'string') {
        errorMessage = errorMessage.message;
      } else {
        errorMessage = JSON.stringify(errorMessage);
      }
    }
    const lowerMessage = errorMessage.toLowerCase();

    if (lowerMessage.includes('current password') && lowerMessage.includes('incorrect')) {
      return {
        message: 'Current password is incorrect. Please check your password and try again.',
        type: 'error',
        code: 'WRONG_CURRENT_PASSWORD'
      };
    }

    if (lowerMessage.includes('password') && lowerMessage.includes('weak')) {
      return {
        message: 'New password is too weak. Please choose a stronger password.',
        type: 'error',
        code: 'WEAK_NEW_PASSWORD'
      };
    }

    if (lowerMessage.includes('same password')) {
      return {
        message: 'New password must be different from your current password.',
        type: 'error',
        code: 'SAME_PASSWORD'
      };
    }

    return this.handleHttpError(error);
  }

  /**
   * Handle activation errors
   */
  handleActivationError(error: any): ErrorInfo {
    let errorMessage = error.error || error.message || '';
    if (typeof errorMessage !== 'string') {
      if (errorMessage && errorMessage.message && typeof errorMessage.message === 'string') {
        errorMessage = errorMessage.message;
      } else {
        errorMessage = JSON.stringify(errorMessage);
      }
    }
    const lowerMessage = errorMessage.toLowerCase();

    if (lowerMessage.includes('invalid') && lowerMessage.includes('token')) {
      return {
        message: 'Invalid activation token. Please check your email for the correct link or request a new one.',
        type: 'error',
        code: 'INVALID_TOKEN'
      };
    }

    if (lowerMessage.includes('expired') && lowerMessage.includes('token')) {
      return {
        message: 'Activation token has expired. Please request a new activation link.',
        type: 'error',
        code: 'EXPIRED_TOKEN'
      };
    }

    if (lowerMessage.includes('already activated')) {
      return {
        message: 'This account is already activated. You can now log in.',
        type: 'info',
        code: 'ALREADY_ACTIVATED'
      };
    }

    return this.handleHttpError(error);
  }

  /**
   * Handle password reset errors
   */
  handlePasswordResetError(error: any): ErrorInfo {
    let errorMessage = error.error || error.message || '';
    if (typeof errorMessage !== 'string') {
      if (errorMessage && errorMessage.message && typeof errorMessage.message === 'string') {
        errorMessage = errorMessage.message;
      } else {
        errorMessage = JSON.stringify(errorMessage);
      }
    }
    const lowerMessage = errorMessage.toLowerCase();

    if (lowerMessage.includes('email not found')) {
      return {
        message: 'No account found with this email address. Please check your email or register a new account.',
        type: 'error',
        code: 'EMAIL_NOT_FOUND'
      };
    }

    if (lowerMessage.includes('invalid') && lowerMessage.includes('token')) {
      return {
        message: 'Invalid reset token. Please check your email for the correct link or request a new one.',
        type: 'error',
        code: 'INVALID_RESET_TOKEN'
      };
    }

    if (lowerMessage.includes('expired') && lowerMessage.includes('token')) {
      return {
        message: 'Reset token has expired. Please request a new password reset.',
        type: 'error',
        code: 'EXPIRED_RESET_TOKEN'
      };
    }

    return this.handleHttpError(error);
  }

  /**
   * Handle network errors
   */
  handleNetworkError(error: any): ErrorInfo {
    if (error.status === 0) {
      return {
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        type: 'error',
        code: 'NETWORK_ERROR'
      };
    }

    return this.handleHttpError(error);
  }

  /**
   * Handle validation errors
   */
  handleValidationError(error: any): ErrorInfo {
    let errorMessage = error.error || error.message || '';
    if (typeof errorMessage !== 'string') {
      if (errorMessage && errorMessage.message && typeof errorMessage.message === 'string') {
        errorMessage = errorMessage.message;
      } else {
        errorMessage = JSON.stringify(errorMessage);
      }
    }
    
    return {
      message: errorMessage || 'Please check your input and try again.',
      type: 'error',
      code: 'VALIDATION_ERROR',
      details: errorMessage
    };
  }

  /**
   * Handle conflict errors
   */
  handleConflictError(error: any): ErrorInfo {
    let errorMessage = error.error || error.message || '';
    if (typeof errorMessage !== 'string') {
      if (errorMessage && errorMessage.message && typeof errorMessage.message === 'string') {
        errorMessage = errorMessage.message;
      } else {
        errorMessage = JSON.stringify(errorMessage);
      }
    }
    
    return {
      message: errorMessage || 'This resource conflicts with an existing one.',
      type: 'error',
      code: 'CONFLICT',
      details: errorMessage
    };
  }

  /**
   * Handle bad request errors
   */
  handleBadRequest(error: any): ErrorInfo {
    let errorMessage = error.error || error.message || '';
    if (typeof errorMessage !== 'string') {
      if (errorMessage && errorMessage.message && typeof errorMessage.message === 'string') {
        errorMessage = errorMessage.message;
      } else {
        errorMessage = JSON.stringify(errorMessage);
      }
    }
    
    return {
      message: errorMessage || 'Invalid request. Please check your input and try again.',
      type: 'error',
      code: 'BAD_REQUEST',
      details: errorMessage
    };
  }

  /**
   * Get success message for different actions
   */
  getSuccessMessage(action: string): string {
    const messages: { [key: string]: string } = {
      'login': 'Successfully logged in!',
      'register': 'Registration successful! Please check your email for activation instructions.',
      'profile_update': 'Profile updated successfully!',
      'password_change': 'Password changed successfully!',
      'account_activation': 'Account activated successfully! You can now log in.',
      'password_reset_request': 'Password reset instructions sent to your email. Please check your inbox.',
      'password_reset_complete': 'Password reset successfully! You can now log in with your new password.',
      'logout': 'Successfully logged out!'
    };

    return messages[action] || 'Operation completed successfully!';
  }

  /**
   * Get warning message for different scenarios
   */
  getWarningMessage(scenario: string): string {
    const messages: { [key: string]: string } = {
      'session_expiring': 'Your session will expire soon. Please save your work.',
      'unsaved_changes': 'You have unsaved changes. Are you sure you want to leave?',
      'weak_password': 'Your password is weak. Consider using a stronger password.',
      'duplicate_email': 'This email is already registered. Consider using a different email or logging in.'
    };

    return messages[scenario] || 'Please review your input.';
  }
} 