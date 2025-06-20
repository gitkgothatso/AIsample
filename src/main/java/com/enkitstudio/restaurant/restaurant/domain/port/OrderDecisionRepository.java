package com.enkitstudio.restaurant.restaurant.domain.port;

import com.enkitstudio.restaurant.restaurant.domain.OrderDecision;
import java.util.List;
import java.util.Optional;

/**
 * Hexagonal port for OrderDecision persistence.
 */
public interface OrderDecisionRepository {
  OrderDecision save(OrderDecision decision);
  Optional<OrderDecision> findById(Long id);
  List<OrderDecision> findAll();
  void deleteById(Long id);
}
