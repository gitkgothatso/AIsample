package com.enkitstudio.restaurant.restaurant.domain.service;

import com.enkitstudio.restaurant.restaurant.domain.Menu;
import com.enkitstudio.restaurant.restaurant.domain.port.MenuRepository;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

/**
 * Application service for menu business logic and validation.
 * <p>
 * Handles creation and retrieval of menus, including validation and business rules.
 */
@Service
@Validated
public class MenuService {

  private final MenuRepository menuRepository;

  public MenuService(MenuRepository menuRepository) {
    this.menuRepository = menuRepository;
  }

  /**
   * Create a new menu with validation.
   * <p>
   * Validates the menu and applies business rules (e.g., check for duplicates).
   *
   * @param menu the menu to create (validated)
   * @return the created menu
   */
  public Menu createMenu(@Valid Menu menu) {
    // Add business rules here (e.g., check for duplicates)
    return menuRepository.save(menu);
  }

  /**
   * List all menus.
   * <p>
   * Retrieves all menus from the repository.
   *
   * @return list of all menus
   */
  public List<Menu> listMenus() {
    return menuRepository.findAll();
  }
}
