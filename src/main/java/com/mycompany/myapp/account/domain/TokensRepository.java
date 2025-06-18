package com.mycompany.myapp.account.domain;

public interface TokensRepository {
  Token buildToken(AuthenticationQuery query);
}
