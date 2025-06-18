package com.mycompany.myapp.account.application;

import org.springframework.stereotype.Service;
import com.mycompany.myapp.account.domain.AuthenticationQuery;
import com.mycompany.myapp.account.domain.Token;
import com.mycompany.myapp.account.domain.TokensRepository;

@Service
public class AccountApplicationService {

  private final TokensRepository tokens;

  public AccountApplicationService(TokensRepository tokens) {
    this.tokens = tokens;
  }

  public Token createToken(AuthenticationQuery query) {
    return tokens.buildToken(query);
  }
}
