package com.enkitstudio.restaurant.account.application;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import com.enkitstudio.restaurant.account.application.validation.PasswordComplexity;

public class PasswordChangeDTO {
  @NotBlank
  private String currentPassword;

  @NotBlank
  @Size(min = 8, max = 100)
  @PasswordComplexity
  private String newPassword;

  public String getCurrentPassword() {
    return currentPassword;
  }
  public void setCurrentPassword(String currentPassword) {
    this.currentPassword = currentPassword;
  }
  public String getNewPassword() {
    return newPassword;
  }
  public void setNewPassword(String newPassword) {
    this.newPassword = newPassword;
  }
} 