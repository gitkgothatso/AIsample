package com.enkitstudio.restaurant.restaurant.domain.port;

import com.enkitstudio.restaurant.restaurant.domain.Menu;
import java.util.List;
import java.util.Optional;

/**
 * Hexagonal port for Menu persistence.
 */
public interface MenuRepository {
  Menu save(Menu menu);
  Optional<Menu> findById(Long id);
  List<Menu> findAll();
  void deleteById(Long id);
}
