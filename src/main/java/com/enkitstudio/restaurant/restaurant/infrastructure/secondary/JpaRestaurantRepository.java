package com.enkitstudio.restaurant.restaurant.infrastructure.secondary;

import com.enkitstudio.restaurant.restaurant.domain.Restaurant;
import com.enkitstudio.restaurant.restaurant.domain.port.RestaurantRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * JPA adapter for RestaurantRepository port (hexagonal architecture).
 */
@Repository
public interface JpaRestaurantRepository extends JpaRepository<Restaurant, Long>, RestaurantRepository {
  // JpaRepository provides all required methods
}
