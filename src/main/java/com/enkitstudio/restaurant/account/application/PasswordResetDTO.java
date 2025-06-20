package com.enkitstudio.restaurant.account.application;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PasswordResetDTO {

  @NotBlank
  private String resetToken;

  @NotBlank
  @Size(min = 6, max = 100)
  private String newPassword;

  public PasswordResetDTO() {}

  public String getResetToken() {
    return resetToken;
  }

  public void setResetToken(String resetToken) {
    this.resetToken = resetToken;
  }

  public String getNewPassword() {
    return newPassword;
  }

  public void setNewPassword(String newPassword) {
    this.newPassword = newPassword;
  }
}
