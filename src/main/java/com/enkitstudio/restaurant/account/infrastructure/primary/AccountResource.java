package com.enkitstudio.restaurant.account.infrastructure.primary;

import com.enkitstudio.restaurant.account.application.AccountApplicationService;
import com.enkitstudio.restaurant.account.application.PasswordResetDTO;
import com.enkitstudio.restaurant.account.application.RegistrationDTO;
import com.enkitstudio.restaurant.shared.authentication.application.AuthenticatedUser;
import com.enkitstudio.restaurant.shared.authentication.domain.Role;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
class AccountResource {

  @Autowired
  private AccountApplicationService accountService;

  /**
   * {@code GET  /account} : get the current user.
   *
   * @return the current user.
   * @throws AccountResourceException
   *           {@code 500 (Internal Server Error)} if the user couldn't be returned.
   */
  @GetMapping("/account")
  public RestAccount getAccount() {
    return new RestAccount(AuthenticatedUser.username().get(), roles());
  }

  @PostMapping("/register")
  public ResponseEntity<String> register(@Validated @RequestBody RegistrationDTO dto) {
    accountService.registerUser(dto);
    return ResponseEntity.ok("Registration successful. Please check your email for activation instructions.");
  }

  @PostMapping("/activate")
  public ResponseEntity<String> activate(@RequestBody String activationToken) {
    try {
      accountService.activateAccount(activationToken);
      return ResponseEntity.ok("Account activated successfully");
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    }
  }

  @PostMapping("/account/reset-password/init")
  public ResponseEntity<String> requestPasswordReset(@RequestBody String email) {
    try {
      accountService.requestPasswordReset(email);
      return ResponseEntity.ok("Password reset instructions sent to your email");
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    }
  }

  @PostMapping("/account/reset-password/finish")
  public ResponseEntity<String> finishPasswordReset(@Validated @RequestBody PasswordResetDTO dto) {
    try {
      accountService.resetPassword(dto.getResetToken(), dto.getNewPassword());
      return ResponseEntity.ok("Password reset successfully");
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    }
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {
    String msg = ex.getMessage();
    if ("Username already exists".equals(msg)) {
      return ResponseEntity.badRequest().body("Username is already taken.");
    } else if ("Email already exists".equals(msg)) {
      return ResponseEntity.badRequest().body("Email is already registered.");
    }
    return ResponseEntity.badRequest().body(msg);
  }

  private Set<String> roles() {
    return AuthenticatedUser.roles().stream().map(Role::key).collect(Collectors.toUnmodifiableSet());
  }
}
