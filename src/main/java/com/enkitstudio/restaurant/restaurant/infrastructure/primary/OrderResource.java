package com.enkitstudio.restaurant.restaurant.infrastructure.primary;

import com.enkitstudio.restaurant.restaurant.domain.Order;
import com.enkitstudio.restaurant.restaurant.domain.service.OrderService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller (hexagonal primary adapter) for Order operations.
 * <p>
 * Endpoints:
 * <ul>
 *   <li><b>POST /api/orders</b>: Create a new order (ROLE_USER only)</li>
 *   <li><b>GET /api/orders</b>: List all orders (ROLE_RESTAURANT only)</li>
 * </ul>
 * <p>
 * Security: Uses @PreAuthorize for role-based access control.
 */
@Validated
@RestController
@RequestMapping("/api/orders")
public class OrderResource {

  private final OrderService orderService;

  public OrderResource(OrderService orderService) {
    this.orderService = orderService;
  }

  /**
   * Create a new order.
   * <p>
   * Only users with ROLE_USER can create an order.
   *
   * @param order the order to create (validated)
   * @return the created order
   */
  @PreAuthorize("hasAuthority('ROLE_USER')")
  @PostMapping
  public ResponseEntity<Order> createOrder(@Validated @RequestBody Order order) {
    Order saved = orderService.createOrder(order);
    return ResponseEntity.ok(saved);
  }

  /**
   * List all orders.
   * <p>
   * Only users with ROLE_RESTAURANT can view all orders.
   *
   * @return list of all orders
   */
  @PreAuthorize("hasAuthority('ROLE_RESTAURANT')")
  @GetMapping
  public ResponseEntity<List<Order>> getAllOrders() {
    return ResponseEntity.ok(orderService.listOrders());
  }
}
