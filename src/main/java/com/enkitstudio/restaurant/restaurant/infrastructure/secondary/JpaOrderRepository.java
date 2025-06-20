package com.enkitstudio.restaurant.restaurant.infrastructure.secondary;

import com.enkitstudio.restaurant.restaurant.domain.Order;
import com.enkitstudio.restaurant.restaurant.domain.port.OrderRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * JPA adapter for OrderRepository port (hexagonal architecture).
 */
@Repository
public interface JpaOrderRepository extends JpaRepository<Order, Long>, OrderRepository {
  // JpaRepository provides all required methods
}
