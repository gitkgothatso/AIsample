package com.enkitstudio.restaurant.account.application;

import com.enkitstudio.restaurant.account.domain.AuthenticationQuery;
import com.enkitstudio.restaurant.account.domain.Token;
import com.enkitstudio.restaurant.account.domain.TokensRepository;
import com.enkitstudio.restaurant.account.domain.User;
import com.enkitstudio.restaurant.account.domain.UserRepository;
import com.enkitstudio.restaurant.shared.email.application.EmailService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
public class AccountApplicationService {

  private final TokensRepository tokens;
  private final UserRepository users;
  private final PasswordEncoder passwordEncoder;
  private final EmailService emailService;

  public AccountApplicationService(
    TokensRepository tokens,
    UserRepository users,
    PasswordEncoder passwordEncoder,
    EmailService emailService
  ) {
    this.tokens = tokens;
    this.users = users;
    this.passwordEncoder = passwordEncoder;
    this.emailService = emailService;
  }

  public Token createToken(AuthenticationQuery query) {
    return tokens.buildToken(query);
  }

  @Transactional
  public String registerUser(RegistrationDTO dto) {
    if (users.findByUsername(dto.getUsername()).isPresent()) {
      throw new IllegalArgumentException("Username already exists");
    }
    if (users.findByEmail(dto.getEmail()).isPresent()) {
      throw new IllegalArgumentException("Email already exists");
    }
    User user = new User(dto.getUsername(), dto.getEmail(), passwordEncoder.encode(dto.getPassword()), dto.getFirstName() != null ? dto.getFirstName() : "", dto.getLastName() != null ? dto.getLastName() : "");
    users.save(user);

    // Send registration email
    emailService.sendRegistrationEmail(user.getEmail(), user.getUsername(), user.getActivationToken());

    return user.getActivationToken();
  }

  @Transactional
  public void activateAccount(String activationToken) {
    var userOpt = users.findByActivationToken(activationToken);
    if (userOpt.isEmpty()) {
      throw new IllegalArgumentException("Invalid activation token");
    }
    var user = userOpt.get();
    user.setActivated(true);
    user.setActivationToken(null);
    users.save(user);

    // Send activation confirmation email
    emailService.sendAccountActivatedEmail(user.getEmail(), user.getUsername());
  }

  @Transactional
  public String requestPasswordReset(String email) {
    var userOpt = users.findByEmail(email);
    if (userOpt.isEmpty()) {
      throw new IllegalArgumentException("Email not found");
    }
    var user = userOpt.get();
    String resetToken = java.util.UUID.randomUUID().toString();
    user.setResetToken(resetToken);
    users.save(user);

    // Send password reset email
    emailService.sendPasswordResetEmail(user.getEmail(), resetToken);

    return resetToken;
  }

  @Transactional
  public void resetPassword(String resetToken, String newPassword) {
    var userOpt = users.findByResetToken(resetToken);
    if (userOpt.isEmpty()) {
      throw new IllegalArgumentException("Invalid reset token");
    }
    var user = userOpt.get();
    user.setPassword(passwordEncoder.encode(newPassword));
    user.setResetToken(null);
    users.save(user);
  }

  /**
   * Update the profile of the current user (first name, last name, email).
   * Part of the hexagonal architecture: application service orchestrates domain logic.
   */
  @Transactional
  public void updateProfile(ProfileUpdateDTO dto) {
    String username = SecurityContextHolder.getContext().getAuthentication().getName();
    var userOpt = users.findByUsername(username);
    if (userOpt.isEmpty()) {
      throw new IllegalArgumentException("User not found");
    }
    var user = userOpt.get();
    if (!user.getEmail().equals(dto.getEmail()) && users.findByEmail(dto.getEmail()).isPresent()) {
      throw new IllegalArgumentException("Email already exists");
    }
    user.setEmail(dto.getEmail());
    user.setFirstName(dto.getFirstName());
    user.setLastName(dto.getLastName());
    users.save(user);
  }

  /**
   * Change the password of the current user.
   * Part of the hexagonal architecture: application service orchestrates domain logic.
   */
  @Transactional
  public void changePassword(PasswordChangeDTO dto) {
    String username = SecurityContextHolder.getContext().getAuthentication().getName();
    var userOpt = users.findByUsername(username);
    if (userOpt.isEmpty()) {
      throw new IllegalArgumentException("User not found");
    }
    var user = userOpt.get();
    if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
      throw new IllegalArgumentException("Current password is incorrect");
    }
    user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
    users.save(user);
  }
}
