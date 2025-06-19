package com.mycompany.myapp.account.application;

import com.mycompany.myapp.account.domain.AuthenticationQuery;
import com.mycompany.myapp.account.domain.Token;
import com.mycompany.myapp.account.domain.TokensRepository;
import com.mycompany.myapp.account.domain.User;
import com.mycompany.myapp.account.domain.UserRepository;
import com.mycompany.myapp.shared.email.application.EmailService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    User user = new User(dto.getUsername(), dto.getEmail(), passwordEncoder.encode(dto.getPassword()));
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
}
