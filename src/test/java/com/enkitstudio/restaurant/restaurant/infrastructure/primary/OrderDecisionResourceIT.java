package com.enkitstudio.restaurant.restaurant.infrastructure.primary;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.enkitstudio.restaurant.restaurant.domain.OrderDecision;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class OrderDecisionResourceIT {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Test
  @DisplayName("GET /api/order-decisions - forbidden for USER role")
  @WithMockUser(username = "user", roles = { "USER" })
  void getAllOrderDecisionsForbiddenForUser() throws Exception {
    mockMvc.perform(get("/api/order-decisions")).andExpect(status().isForbidden());
  }

  @Test
  @DisplayName("GET /api/order-decisions - allowed for RESTAURANT role")
  @WithMockUser(username = "owner", roles = { "RESTAURANT" })
  void getAllOrderDecisionsAllowedForRestaurantRole() throws Exception {
    mockMvc.perform(get("/api/order-decisions")).andExpect(status().isOk());
  }

  @Test
  @DisplayName("POST /api/order-decisions - allowed for RESTAURANT role")
  @WithMockUser(username = "owner", roles = { "RESTAURANT" })
  void createOrderDecisionAllowedForRestaurantRole() throws Exception {
    OrderDecision decision = new OrderDecision();
    // Set required fields if needed
    mockMvc
      .perform(post("/api/order-decisions").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(decision)))
      .andExpect(status().isOk());
  }

  @Test
  @DisplayName("POST /api/order-decisions - forbidden for USER role")
  @WithMockUser(username = "user", roles = { "USER" })
  void createOrderDecisionForbiddenForUser() throws Exception {
    OrderDecision decision = new OrderDecision();
    // Set required fields if needed
    mockMvc
      .perform(post("/api/order-decisions").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(decision)))
      .andExpect(status().isForbidden());
  }
}
