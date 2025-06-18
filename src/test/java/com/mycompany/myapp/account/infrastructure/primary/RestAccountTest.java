package com.mycompany.myapp.account.infrastructure.primary;

import static org.assertj.core.api.Assertions.*;

import java.util.Set;
import org.junit.jupiter.api.Test;
import com.mycompany.myapp.JsonHelper;
import com.mycompany.myapp.UnitTest;

@UnitTest
class RestAccountTest {

  @Test
  void shouldSerializeToJson() {
    assertThat(JsonHelper.writeAsString(new RestAccount("user", Set.of("ROLE_USER")))).isEqualTo(json());
  }

  private String json() {
    return """
    {\
    "login":"user",\
    "authorities":[\
    "ROLE_USER"\
    ]\
    }\
    """;
  }
}
