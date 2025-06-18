package com.mycompany.myapp.account.infrastructure.primary;

import static org.assertj.core.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import com.mycompany.myapp.JsonHelper;
import com.mycompany.myapp.UnitTest;

@UnitTest
class RestAuthenticationQueryTest {

  @Test
  void shouldDeserializeFromJson() {
    RestAuthenticationQuery query = JsonHelper.readFromJson(json(), RestAuthenticationQuery.class);

    assertThat(query.authenticationToken()).isEqualTo(new UsernamePasswordAuthenticationToken("user", "password"));
    assertThat(query.isRememberMe()).isTrue();
  }

  private String json() {
    return """
    {
      "username": "user",
      "password": "password",
      "rememberMe": true
    }
    """;
  }
}
