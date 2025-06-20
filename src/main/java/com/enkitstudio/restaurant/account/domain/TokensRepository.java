package com.enkitstudio.restaurant.account.domain;

public interface TokensRepository {
  Token buildToken(AuthenticationQuery query);
}
