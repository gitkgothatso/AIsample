package com.enkitstudio.restaurant.restaurant.domain.port;

import com.enkitstudio.restaurant.restaurant.domain.Restaurant;
import java.util.List;
import java.util.Optional;

/**
 * Hexagonal port for Restaurant persistence.
 */
public interface RestaurantRepository {
  Restaurant save(Restaurant restaurant);
  Optional<Restaurant> findById(Long id);
  List<Restaurant> findAll();
  void deleteById(Long id);
}
