package com.enkitstudio.restaurant.account.infrastructure.primary;

import com.enkitstudio.restaurant.account.application.AccountApplicationService;
import com.enkitstudio.restaurant.account.domain.Token;
import com.enkitstudio.restaurant.account.domain.UserRepository;
import com.enkitstudio.restaurant.shared.authentication.application.AuthenticatedUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
class Authenticator {

  private final AccountApplicationService accounts;
  private final AuthenticationManagerBuilder authenticationManagerBuilder;

  @Autowired
  private UserRepository userRepository;

  public Authenticator(AccountApplicationService accounts, AuthenticationManagerBuilder authenticationManagerBuilder) {
    this.accounts = accounts;
    this.authenticationManagerBuilder = authenticationManagerBuilder;
  }

  Token authenticate(RestAuthenticationQuery query) {
    var authentication = authenticationManagerBuilder.getObject().authenticate(query.authenticationToken());

    // Check if user is activated
    var userOpt = userRepository.findByUsername(query.getUsername());
    if (userOpt.isEmpty() || !userOpt.get().isActivated()) {
      throw new IllegalStateException("Account is not activated");
    }

    SecurityContextHolder.getContext().setAuthentication(authentication);

    return accounts.createToken(query.toDomain(AuthenticatedUser.roles()));
  }
}
