package com.mycompany.myapp.account.domain;

import com.mycompany.myapp.shared.error.domain.Assert;

public record Token(String token) {
  public Token {
    Assert.notBlank("token", token);
  }

  public String get() {
    return token();
  }

  public String bearer() {
    return "Bearer " + token();
  }
}
