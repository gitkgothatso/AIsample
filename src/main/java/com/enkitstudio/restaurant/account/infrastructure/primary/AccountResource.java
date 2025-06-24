package com.enkitstudio.restaurant.account.infrastructure.primary;

import java.util.Set;
import java.util.stream.Collectors;

import com.enkitstudio.restaurant.account.application.AccountApplicationService;
import com.enkitstudio.restaurant.account.application.PasswordChangeDTO;
import com.enkitstudio.restaurant.account.application.PasswordResetDTO;
import com.enkitstudio.restaurant.account.application.ProfileUpdateDTO;
import com.enkitstudio.restaurant.account.application.RegistrationDTO;
import com.enkitstudio.restaurant.shared.authentication.application.AuthenticatedUser;
import com.enkitstudio.restaurant.shared.authentication.domain.Role;
import com.enkitstudio.restaurant.account.domain.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.http.HttpStatus;
import java.time.Duration;

@RestController
@RequestMapping("/api")
class AccountResource {

  @Autowired
  private AccountApplicationService accountService;

  @Autowired
  private UserRepository userRepository;

  // Rate limiting buckets
  private final Bucket profileUpdateBucket = Bucket.builder()
    .addLimit(Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(1))))
    .build();

  private final Bucket passwordChangeBucket = Bucket.builder()
    .addLimit(Bandwidth.classic(3, Refill.intervally(3, Duration.ofMinutes(1))))
    .build();

  /**
   * {@code GET  /account} : get the current user.
   *
   * @return the current user.
   * @throws AccountResourceException
   *           {@code 500 (Internal Server Error)} if the user couldn't be returned.
   */
  @GetMapping("/account")
  public RestAccount getAccount() {
    String username = AuthenticatedUser.username().get();
    var userOpt = userRepository.findByUsername(username);
    if (userOpt.isEmpty()) {
      throw new RuntimeException("User not found");
    }
    var user = userOpt.get();
    return new RestAccount(
      user.getUsername(),
      roles(),
      user.getFirstName(),
      user.getLastName(),
      user.getEmail()
    );
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

  @PutMapping("/account")
  public ResponseEntity<String> updateProfile(@Validated @RequestBody ProfileUpdateDTO dto) {
    if (!profileUpdateBucket.tryConsume(1)) {
      return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
        .body("Too many profile update requests. Please wait before trying again.");
    }
    
    try {
      accountService.updateProfile(dto);
      return ResponseEntity.ok("Profile updated successfully");
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    }
  }

  @PostMapping("/account/change-password")
  public ResponseEntity<String> changePassword(@Validated @RequestBody PasswordChangeDTO dto) {
    if (!passwordChangeBucket.tryConsume(1)) {
      return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
        .body("Too many password change requests. Please wait before trying again.");
    }
    
    try {
      accountService.changePassword(dto);
      return ResponseEntity.ok("Password changed successfully");
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
