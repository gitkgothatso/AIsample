package com.enkitstudio.restaurant.account.infrastructure.secondary;

import com.enkitstudio.restaurant.account.domain.User;
import com.enkitstudio.restaurant.account.domain.UserRepository;
import com.enkitstudio.restaurant.shared.authentication.domain.Role;
import java.util.Collections;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

  private final UserRepository userRepository;

  public CustomUserDetailsService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    var userOpt = userRepository.findByUsername(username);
    if (userOpt.isEmpty()) {
      throw new UsernameNotFoundException("User not found: " + username);
    }

    User user = userOpt.get();

    return org.springframework.security.core.userdetails.User.builder()
      .username(user.getUsername())
      .password(user.getPassword())
      .authorities(Collections.singletonList(new SimpleGrantedAuthority(Role.USER.key())))
      .accountExpired(false)
      .accountLocked(false)
      .credentialsExpired(false)
      .disabled(!user.isActivated())
      .build();
  }
}
