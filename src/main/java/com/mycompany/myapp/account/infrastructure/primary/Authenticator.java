package com.mycompany.myapp.account.infrastructure.primary;

import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.mycompany.myapp.account.application.AccountApplicationService;
import com.mycompany.myapp.account.domain.Token;
import com.mycompany.myapp.shared.authentication.application.AuthenticatedUser;

@Service
class Authenticator {

  private final AccountApplicationService accounts;
  private final AuthenticationManagerBuilder authenticationManagerBuilder;

  public Authenticator(AccountApplicationService accounts, AuthenticationManagerBuilder authenticationManagerBuilder) {
    this.accounts = accounts;
    this.authenticationManagerBuilder = authenticationManagerBuilder;
  }

  Token authenticate(RestAuthenticationQuery query) {
    var authentication = authenticationManagerBuilder.getObject().authenticate(query.authenticationToken());

    SecurityContextHolder.getContext().setAuthentication(authentication);

    return accounts.createToken(query.toDomain(AuthenticatedUser.roles()));
  }
}
