package com.enkitstudio.restaurant.account.infrastructure.primary;

import com.enkitstudio.restaurant.shared.error.domain.Assert;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;
import java.util.Set;

@Schema(name = "account", description = "Information for the authenticated user account")
class RestAccount {

  private final String login;
  private final Set<String> authorities;
  private final String firstName;
  private final String lastName;
  private final String email;

  public RestAccount(String login, Set<String> authorities, String firstName, String lastName, String email) {
    Assert.notBlank("login", login);

    this.login = login;
    this.authorities = authorities;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
  }

  @Schema(description = "Login of the authenticated user", requiredMode = RequiredMode.REQUIRED)
  public String getLogin() {
    return login;
  }

  @Schema(description = "Authorities of the authenticated user")
  public Set<String> getAuthorities() {
    return authorities;
  }

  @Schema(description = "First name of the authenticated user")
  public String getFirstName() {
    return firstName;
  }

  @Schema(description = "Last name of the authenticated user")
  public String getLastName() {
    return lastName;
  }

  @Schema(description = "Email of the authenticated user")
  public String getEmail() {
    return email;
  }
}
