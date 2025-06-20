package com.enkitstudio.restaurant.restaurant.infrastructure.primary;

import com.enkitstudio.restaurant.restaurant.domain.OrderDecision;
import com.enkitstudio.restaurant.restaurant.domain.service.OrderDecisionService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller (hexagonal primary adapter) for OrderDecision operations.
 * <p>
 * Endpoints:
 * <ul>
 *   <li><b>POST /api/order-decisions</b>: Create a new order decision (ROLE_RESTAURANT only)</li>
 *   <li><b>GET /api/order-decisions</b>: List all order decisions (ROLE_RESTAURANT only)</li>
 * </ul>
 * <p>
 * Security: Uses @PreAuthorize for role-based access control.
 */
@Validated
@RestController
@RequestMapping("/api/order-decisions")
public class OrderDecisionResource {

  private final OrderDecisionService orderDecisionService;

  public OrderDecisionResource(OrderDecisionService orderDecisionService) {
    this.orderDecisionService = orderDecisionService;
  }

  /**
   * Create a new order decision.
   * <p>
   * Only users with ROLE_RESTAURANT can create an order decision.
   *
   * @param decision the order decision to create (validated)
   * @return the created order decision
   */
  @PreAuthorize("hasAuthority('ROLE_RESTAURANT')")
  @PostMapping
  public ResponseEntity<OrderDecision> createOrderDecision(@Validated @RequestBody OrderDecision decision) {
    OrderDecision saved = orderDecisionService.createOrderDecision(decision);
    return ResponseEntity.ok(saved);
  }

  /**
   * List all order decisions.
   * <p>
   * Only users with ROLE_RESTAURANT can view all order decisions.
   *
   * @return list of all order decisions
   */
  @PreAuthorize("hasAuthority('ROLE_RESTAURANT')")
  @GetMapping
  public ResponseEntity<List<OrderDecision>> getAllOrderDecisions() {
    return ResponseEntity.ok(orderDecisionService.listOrderDecisions());
  }
}
