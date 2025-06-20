package com.enkitstudio.restaurant.account.infrastructure.primary;

import com.enkitstudio.restaurant.account.domain.Token;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;

@Schema(name = "token", description = "A JWT token")
final class RestToken {

  private String idToken;

  private RestToken(String idToken) {
    this.idToken = idToken;
  }

  static RestToken from(Token token) {
    return new RestToken(token.get());
  }

  @Schema(description = "JWT token", requiredMode = RequiredMode.REQUIRED)
  @JsonProperty("id_token")
  String getIdToken() {
    return idToken;
  }
}
