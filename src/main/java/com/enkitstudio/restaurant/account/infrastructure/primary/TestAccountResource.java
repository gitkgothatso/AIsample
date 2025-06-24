package com.enkitstudio.restaurant.account.infrastructure.primary;

import com.enkitstudio.restaurant.account.application.AccountApplicationService;
import com.enkitstudio.restaurant.account.application.RegistrationDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * Test utility endpoint for e2e tests: create and activate users.
 */
@RestController
@RequestMapping("/api/test")
@Profile({ "test", "dev" })
public class TestAccountResource {

  @Autowired
  private AccountApplicationService accountService;

  /**
   * Create a user for testing. Optionally activate the user.
   * @param req request body
   * @return activation token (if not activated)
   */
  @PostMapping("/create-user")
  public ResponseEntity<String> createUser(@Validated @RequestBody TestUserRequest req) {
    RegistrationDTO dto = new RegistrationDTO();
    dto.setUsername(req.getUsername());
    dto.setEmail(req.getEmail());
    dto.setPassword(req.getPassword());
    dto.setFirstName(req.getFirstName());
    dto.setLastName(req.getLastName());
    String activationToken = accountService.registerUser(dto);
    if (req.isActivated()) {
      accountService.activateAccount(activationToken);
      return ResponseEntity.ok("activated");
    }
    return ResponseEntity.ok(activationToken);
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

  public static class TestUserRequest {

    private String username;
    private String email;
    private String password;
    private boolean activated;
    private String firstName;
    private String lastName;

    public String getUsername() {
      return username;
    }

    public void setUsername(String username) {
      this.username = username;
    }

    public String getEmail() {
      return email;
    }

    public void setEmail(String email) {
      this.email = email;
    }

    public String getPassword() {
      return password;
    }

    public void setPassword(String password) {
      this.password = password;
    }

    public boolean isActivated() {
      return activated;
    }

    public void setActivated(boolean activated) {
      this.activated = activated;
    }

    public String getFirstName() {
      return firstName;
    }

    public void setFirstName(String firstName) {
      this.firstName = firstName;
    }

    public String getLastName() {
      return lastName;
    }

    public void setLastName(String lastName) {
      this.lastName = lastName;
    }
  }
}
