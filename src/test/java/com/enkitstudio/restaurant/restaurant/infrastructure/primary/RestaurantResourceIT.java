package com.enkitstudio.restaurant.restaurant.infrastructure.primary;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.enkitstudio.restaurant.restaurant.domain.Restaurant;
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
class RestaurantResourceIT {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Test
  @DisplayName("GET /api/restaurants - authenticated user")
  @WithMockUser(username = "user", roles = { "USER" })
  void getAllRestaurantsAuthenticated() throws Exception {
    mockMvc.perform(get("/api/restaurants")).andExpect(status().isOk());
  }

  @Test
  @DisplayName("POST /api/restaurants - forbidden for USER role")
  @WithMockUser(username = "user", roles = { "USER" })
  void createRestaurantForbiddenForUser() throws Exception {
    Restaurant restaurant = new Restaurant();
    restaurant.setName("Testaurant");
    restaurant.setDescription("A test restaurant");
    mockMvc
      .perform(post("/api/restaurants").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(restaurant)))
      .andExpect(status().isForbidden());
  }

  @Test
  @DisplayName("POST /api/restaurants - allowed for RESTAURANT role")
  @WithMockUser(username = "owner", roles = { "RESTAURANT" })
  void createRestaurantAllowedForRestaurantRole() throws Exception {
    Restaurant restaurant = new Restaurant();
    restaurant.setName("Testaurant");
    restaurant.setDescription("A test restaurant");
    mockMvc
      .perform(post("/api/restaurants").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(restaurant)))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.name").value("Testaurant"));
  }
}
