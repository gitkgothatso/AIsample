package com.enkitstudio.restaurant.restaurant.domain.port;

import com.enkitstudio.restaurant.restaurant.domain.Order;
import java.util.List;
import java.util.Optional;

/**
 * Hexagonal port for Order persistence.
 */
public interface OrderRepository {
  Order save(Order order);
  Optional<Order> findById(Long id);
  List<Order> findAll();
  void deleteById(Long id);
}
