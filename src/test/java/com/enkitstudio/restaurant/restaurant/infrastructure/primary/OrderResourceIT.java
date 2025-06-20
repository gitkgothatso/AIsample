package com.enkitstudio.restaurant.restaurant.infrastructure.primary;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.enkitstudio.restaurant.restaurant.domain.Order;
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
class OrderResourceIT {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Test
  @DisplayName("GET /api/orders - forbidden for USER role")
  @WithMockUser(username = "user", roles = { "USER" })
  void getAllOrdersForbiddenForUser() throws Exception {
    mockMvc.perform(get("/api/orders")).andExpect(status().isForbidden());
  }

  @Test
  @DisplayName("GET /api/orders - allowed for RESTAURANT role")
  @WithMockUser(username = "owner", roles = { "RESTAURANT" })
  void getAllOrdersAllowedForRestaurantRole() throws Exception {
    mockMvc.perform(get("/api/orders")).andExpect(status().isOk());
  }

  @Test
  @DisplayName("POST /api/orders - allowed for USER role")
  @WithMockUser(username = "user", roles = { "USER" })
  void createOrderAllowedForUserRole() throws Exception {
    Order order = new Order();
    // Set required fields if needed
    mockMvc
      .perform(post("/api/orders").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(order)))
      .andExpect(status().isOk());
  }

  @Test
  @DisplayName("POST /api/orders - forbidden for RESTAURANT role")
  @WithMockUser(username = "owner", roles = { "RESTAURANT" })
  void createOrderForbiddenForRestaurantRole() throws Exception {
    Order order = new Order();
    // Set required fields if needed
    mockMvc
      .perform(post("/api/orders").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(order)))
      .andExpect(status().isForbidden());
  }
}
