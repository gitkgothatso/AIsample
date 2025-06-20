package com.enkitstudio.restaurant.account.domain;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByUsername(String username);
  Optional<User> findByEmail(String email);
  Optional<User> findByActivationToken(String activationToken);
  Optional<User> findByResetToken(String resetToken);
}
