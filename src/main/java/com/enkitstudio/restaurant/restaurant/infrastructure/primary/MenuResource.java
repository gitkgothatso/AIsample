package com.enkitstudio.restaurant.restaurant.infrastructure.primary;

import com.enkitstudio.restaurant.restaurant.domain.Menu;
import com.enkitstudio.restaurant.restaurant.domain.service.MenuService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller (hexagonal primary adapter) for Menu operations.
 * <p>
 * Endpoints:
 * <ul>
 *   <li><b>POST /api/menus</b>: Create a new menu (ROLE_RESTAURANT only)</li>
 *   <li><b>GET /api/menus</b>: List all menus (authenticated users)</li>
 * </ul>
 * <p>
 * Security: Uses @PreAuthorize for role-based access control.
 */
@Validated
@RestController
@RequestMapping("/api/menus")
public class MenuResource {

  private final MenuService menuService;

  public MenuResource(MenuService menuService) {
    this.menuService = menuService;
  }

  /**
   * Create a new menu.
   * <p>
   * Only users with ROLE_RESTAURANT can create a menu.
   *
   * @param menu the menu to create (validated)
   * @return the created menu
   */
  @PreAuthorize("hasAuthority('ROLE_RESTAURANT')")
  @PostMapping
  public ResponseEntity<Menu> createMenu(@Validated @RequestBody Menu menu) {
    Menu saved = menuService.createMenu(menu);
    return ResponseEntity.ok(saved);
  }

  /**
   * List all menus.
   * <p>
   * Accessible to all authenticated users.
   *
   * @return list of all menus
   */
  @PreAuthorize("isAuthenticated()")
  @GetMapping
  public ResponseEntity<List<Menu>> getAllMenus() {
    return ResponseEntity.ok(menuService.listMenus());
  }
}
