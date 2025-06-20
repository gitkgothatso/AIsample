package com.enkitstudio.restaurant.restaurant.domain.service;

import com.enkitstudio.restaurant.restaurant.domain.Restaurant;
import com.enkitstudio.restaurant.restaurant.domain.port.RestaurantRepository;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

/**
 * Application service for restaurant business logic and validation.
 * <p>
 * Handles creation and retrieval of restaurants, including validation and business rules.
 */
@Service
@Validated
public class RestaurantService {

  private final RestaurantRepository restaurantRepository;

  public RestaurantService(RestaurantRepository restaurantRepository) {
    this.restaurantRepository = restaurantRepository;
  }

  /**
   * Create a new restaurant with validation.
   * <p>
   * Validates the restaurant and applies business rules (e.g., unique name).
   *
   * @param restaurant the restaurant to create (validated)
   * @return the created restaurant
   */
  public Restaurant createRestaurant(@Valid Restaurant restaurant) {
    // Add business rules here (e.g., check for unique name)
    return restaurantRepository.save(restaurant);
  }

  /**
   * List all restaurants.
   * <p>
   * Retrieves all restaurants from the repository.
   *
   * @return list of all restaurants
   */
  public List<Restaurant> listRestaurants() {
    return restaurantRepository.findAll();
  }
}
