package com.enkitstudio.restaurant.restaurant.infrastructure.primary;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.enkitstudio.restaurant.restaurant.domain.Menu;
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
class MenuResourceIT {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Test
  @DisplayName("GET /api/menus - authenticated user")
  @WithMockUser(username = "user", roles = { "USER" })
  void getAllMenusAuthenticated() throws Exception {
    mockMvc.perform(get("/api/menus")).andExpect(status().isOk());
  }

  @Test
  @DisplayName("POST /api/menus - forbidden for USER role")
  @WithMockUser(username = "user", roles = { "USER" })
  void createMenuForbiddenForUser() throws Exception {
    Menu menu = new Menu();
    menu.setName("Lunch Menu");
    menu.setDescription("A test menu");
    mockMvc
      .perform(post("/api/menus").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(menu)))
      .andExpect(status().isForbidden());
  }

  @Test
  @DisplayName("POST /api/menus - allowed for RESTAURANT role")
  @WithMockUser(username = "owner", roles = { "RESTAURANT" })
  void createMenuAllowedForRestaurantRole() throws Exception {
    Menu menu = new Menu();
    menu.setName("Lunch Menu");
    menu.setDescription("A test menu");
    mockMvc
      .perform(post("/api/menus").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(menu)))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.name").value("Lunch Menu"));
  }
}
