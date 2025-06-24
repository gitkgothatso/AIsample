package com.enkitstudio.restaurant.account.infrastructure.primary;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.enkitstudio.restaurant.IntegrationTest;
import com.enkitstudio.restaurant.shared.authentication.domain.Role;
import com.enkitstudio.restaurant.account.domain.User;
import com.enkitstudio.restaurant.account.domain.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import static org.hamcrest.Matchers.containsString;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for {@link AccountResource} REST endpoints.
 * <p>
 * These tests verify the primary adapter (REST controller) for account/profile management,
 * ensuring correct orchestration of the application and domain layers in the hexagonal architecture.
 *
 * <ul>
 *   <li>GET /api/account: fetches current user info</li>
 *   <li>PUT /api/account: updates user profile (first name, last name, email)</li>
 *   <li>POST /api/account/change-password: changes user password</li>
 * </ul>
 *
 * Error cases (e.g., duplicate email, wrong password) are also covered.
 */
@IntegrationTest
@AutoConfigureMockMvc
class AccountResourceIT {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  @Test
  @WithMockUser(username = "testuser", roles = {"USER"})
  @Transactional
  void shouldGetAuthenticatedUserAccount() throws Exception {
    // Create test user in database
    User user = new User("testuser", "testuser@example.com", passwordEncoder.encode("TestPass123!"), "Test", "User");
    user.setActivated(true);
    userRepository.save(user);

    mockMvc
      .perform(get("/api/account"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.login").value("testuser"))
      .andExpect(jsonPath("$.authorities").value(Role.USER.key()))
      .andExpect(jsonPath("$.email").exists());

    // Clean up
    userRepository.delete(user);
  }

  @Test
  @WithAnonymousUser
  void shouldNotGetAccountForNotAuthenticatedUser() throws Exception {
    mockMvc.perform(get("/api/account")).andExpect(status().isForbidden());
  }

  /**
   * Test: update profile for authenticated user.
   * Verifies the REST endpoint delegates to the application service and domain logic.
   */
  @Test
  @WithMockUser(username = "profileuser", roles = {"USER"})
  @Transactional
  void shouldUpdateProfile() throws Exception {
    // Create test user in database
    User user = new User("profileuser", "profileuser@example.com", passwordEncoder.encode("TestPassword123!"), "TestFirst", "TestLast");
    user.setActivated(true);
    userRepository.save(user);

    // Update profile
    String updateJson = "{" +
      "\"firstName\":\"NewFirst\"," +
      "\"lastName\":\"NewLast\"," +
      "\"email\":\"profileuser_new@example.com\"}";
    mockMvc
      .perform(put("/api/account").contentType(MediaType.APPLICATION_JSON).content(updateJson))
      .andExpect(status().isOk())
      .andExpect(content().string(containsString("Profile updated successfully")));

    // Clean up
    userRepository.delete(user);
  }

  /**
   * Test: change password for authenticated user.
   * Verifies the REST endpoint delegates to the application service and domain logic.
   */
  @Test
  @WithMockUser(username = "profileuser", roles = {"USER"})
  @Transactional
  void shouldChangePassword() throws Exception {
    // Create test user in database
    User user = new User("profileuser", "profileuser@example.com", passwordEncoder.encode("TestPassword123!"), "TestFirst", "TestLast");
    user.setActivated(true);
    userRepository.save(user);

    String changeJson = "{" +
      "\"currentPassword\":\"TestPassword123!\"," +
      "\"newPassword\":\"NewPassword456!\"}";
    mockMvc
      .perform(post("/api/account/change-password").contentType(MediaType.APPLICATION_JSON).content(changeJson))
      .andExpect(status().isOk())
      .andExpect(content().string(containsString("Password changed successfully")));

    // Clean up
    userRepository.delete(user);
  }

  /**
   * Test: fail to change password with wrong current password.
   * Ensures error handling in the primary adapter and application service.
   */
  @Test
  @WithMockUser(username = "profileuser", roles = {"USER"})
  @Transactional
  void shouldFailChangePasswordWithWrongCurrentPassword() throws Exception {
    // Create test user in database
    User user = new User("profileuser", "profileuser@example.com", passwordEncoder.encode("TestPassword123!"), "TestFirst", "TestLast");
    user.setActivated(true);
    userRepository.save(user);

    String changeJson = "{" +
      "\"currentPassword\":\"WrongPassword\"," +
      "\"newPassword\":\"AnotherPass123!\"}";
    mockMvc
      .perform(post("/api/account/change-password").contentType(MediaType.APPLICATION_JSON).content(changeJson))
      .andExpect(status().isBadRequest())
      .andExpect(content().string(containsString("Current password is incorrect")));

    // Clean up
    userRepository.delete(user);
  }

  /**
   * Test: fail to change password with weak password.
   * Ensures password complexity validation is enforced.
   */
  @Test
  @WithMockUser(username = "profileuser", roles = {"USER"})
  @Transactional
  void shouldFailChangePasswordWithWeakPassword() throws Exception {
    // Create test user in database
    User user = new User("profileuser", "profileuser@example.com", passwordEncoder.encode("TestPassword123!"), "TestFirst", "TestLast");
    user.setActivated(true);
    userRepository.save(user);

    String changeJson = "{" +
      "\"currentPassword\":\"TestPassword123!\"," +
      "\"newPassword\":\"weak\"}";
    mockMvc
      .perform(post("/api/account/change-password").contentType(MediaType.APPLICATION_JSON).content(changeJson))
      .andExpect(status().isBadRequest());

    // Clean up
    userRepository.delete(user);
  }

  /**
   * Test: fail to update profile with duplicate email.
   * Ensures domain constraint is enforced through the application service.
   */
  @Test
  @WithMockUser(username = "profileuser", roles = {"USER"})
  @Transactional
  void shouldFailUpdateProfileWithDuplicateEmail() throws Exception {
    // Create test user in database
    User user = new User("profileuser", "profileuser@example.com", passwordEncoder.encode("TestPassword123!"), "TestFirst", "TestLast");
    user.setActivated(true);
    userRepository.save(user);

    // Create another user with the duplicate email
    User otherUser = new User("otheruser", "duplicate@example.com", passwordEncoder.encode("TestPassword123!"), "Other", "User");
    otherUser.setActivated(true);
    userRepository.save(otherUser);

    // Try to update profile to use the duplicate email
    String updateJson = "{" +
      "\"firstName\":\"First\"," +
      "\"lastName\":\"Last\"," +
      "\"email\":\"duplicate@example.com\"}";
    mockMvc
      .perform(put("/api/account").contentType(MediaType.APPLICATION_JSON).content(updateJson))
      .andExpect(status().isBadRequest())
      .andExpect(content().string(containsString("Email already exists")));

    // Clean up
    userRepository.delete(user);
    userRepository.delete(otherUser);
  }
}
