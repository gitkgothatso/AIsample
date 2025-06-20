package com.enkitstudio.restaurant.restaurant.infrastructure.primary;

import com.enkitstudio.restaurant.restaurant.domain.Restaurant;
import com.enkitstudio.restaurant.restaurant.domain.service.RestaurantService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller (hexagonal primary adapter) for Restaurant operations.
 * <p>
 * Endpoints:
 * <ul>
 *   <li><b>POST /api/restaurants</b>: Create a new restaurant (ROLE_RESTAURANT only)</li>
 *   <li><b>GET /api/restaurants</b>: List all restaurants (authenticated users)</li>
 * </ul>
 * <p>
 * Security: Uses @PreAuthorize for role-based access control.
 */
@Validated
@RestController
@RequestMapping("/api/restaurants")
public class RestaurantResource {

  private final RestaurantService restaurantService;

  public RestaurantResource(RestaurantService restaurantService) {
    this.restaurantService = restaurantService;
  }

  /**
   * Create a new restaurant.
   * <p>
   * Only users with ROLE_RESTAURANT can create a restaurant.
   *
   * @param restaurant the restaurant to create (validated)
   * @return the created restaurant
   */
  @PreAuthorize("hasAuthority('ROLE_RESTAURANT')")
  @PostMapping
  public ResponseEntity<Restaurant> createRestaurant(@Validated @RequestBody Restaurant restaurant) {
    Restaurant saved = restaurantService.createRestaurant(restaurant);
    return ResponseEntity.ok(saved);
  }

  /**
   * List all restaurants.
   * <p>
   * Accessible to all authenticated users.
   *
   * @return list of all restaurants
   */
  @PreAuthorize("isAuthenticated()")
  @GetMapping
  public ResponseEntity<List<Restaurant>> getAllRestaurants() {
    return ResponseEntity.ok(restaurantService.listRestaurants());
  }
}
