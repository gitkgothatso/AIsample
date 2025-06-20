package com.enkitstudio.restaurant.restaurant.infrastructure.secondary;

import com.enkitstudio.restaurant.restaurant.domain.OrderDecision;
import com.enkitstudio.restaurant.restaurant.domain.port.OrderDecisionRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * JPA adapter for OrderDecisionRepository port (hexagonal architecture).
 */
@Repository
public interface JpaOrderDecisionRepository extends JpaRepository<OrderDecision, Long>, OrderDecisionRepository {
  // JpaRepository provides all required methods
}
