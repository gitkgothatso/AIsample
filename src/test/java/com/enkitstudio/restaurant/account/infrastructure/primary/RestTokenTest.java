package com.enkitstudio.restaurant.account.infrastructure.primary;

import static com.enkitstudio.restaurant.account.domain.TokensFixture.*;
import static org.assertj.core.api.Assertions.*;

import com.enkitstudio.restaurant.JsonHelper;
import com.enkitstudio.restaurant.UnitTest;
import org.junit.jupiter.api.Test;

@UnitTest
class RestTokenTest {

  @Test
  void shouldConvertFromDomain() {
    assertThat(JsonHelper.writeAsString(RestToken.from(token()))).isEqualTo(json());
  }

  private String json() {
    return "{\"id_token\":\"token\"}";
  }
}
