package com.enkitstudio.restaurant.shared.email.application;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

  @Autowired
  private JavaMailSender mailSender;

  @Value("${spring.mail.username:}")
  private String fromEmail;

  @Value("${application.email.from:noreply@myapp.com}")
  private String defaultFromEmail;

  public void sendRegistrationEmail(String toEmail, String username, String activationToken) {
    String subject = "Welcome to MyApp - Activate Your Account";
    String message = String.format(
      "Hello %s,\n\n" +
      "Thank you for registering with MyApp! To complete your registration, please click the link below to activate your account:\n\n" +
      "http://localhost:8080/activate?token=%s\n\n" +
      "If you did not create this account, please ignore this email.\n\n" +
      "Best regards,\n" +
      "The MyApp Team",
      username,
      activationToken
    );

    sendEmail(toEmail, subject, message);
  }

  public void sendPasswordResetEmail(String toEmail, String resetToken) {
    String subject = "MyApp - Password Reset Request";
    String message = String.format(
      "Hello,\n\n" +
      "You have requested to reset your password for your MyApp account. Please click the link below to reset your password:\n\n" +
      "http://localhost:8080/password-reset?token=%s\n\n" +
      "This link will expire in 24 hours. If you did not request this password reset, please ignore this email.\n\n" +
      "Best regards,\n" +
      "The MyApp Team",
      resetToken
    );

    sendEmail(toEmail, subject, message);
  }

  public void sendAccountActivatedEmail(String toEmail, String username) {
    String subject = "MyApp - Account Activated Successfully";
    String message = String.format(
      "Hello %s,\n\n" +
      "Your MyApp account has been successfully activated! You can now log in to your account.\n\n" +
      "http://localhost:8080/login\n\n" +
      "Best regards,\n" +
      "The MyApp Team",
      username
    );

    sendEmail(toEmail, subject, message);
  }

  private void sendEmail(String to, String subject, String text) {
    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom(getFromEmail());
    message.setTo(to);
    message.setSubject(subject);
    message.setText(text);

    try {
      mailSender.send(message);
    } catch (Exception e) {
      // Log the error but don't throw it to avoid breaking the application flow
      System.err.println("Failed to send email to " + to + ": " + e.getMessage());
    }
  }

  private String getFromEmail() {
    return fromEmail != null && !fromEmail.isEmpty() ? fromEmail : defaultFromEmail;
  }
}
