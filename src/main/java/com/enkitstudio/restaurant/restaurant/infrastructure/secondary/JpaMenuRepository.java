package com.enkitstudio.restaurant.restaurant.infrastructure.secondary;

import com.enkitstudio.restaurant.restaurant.domain.Menu;
import com.enkitstudio.restaurant.restaurant.domain.port.MenuRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * JPA adapter for MenuRepository port (hexagonal architecture).
 */
@Repository
public interface JpaMenuRepository extends JpaRepository<Menu, Long>, MenuRepository {
  // JpaRepository provides all required methods
}
