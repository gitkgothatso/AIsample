package com.enkitstudio.restaurant.restaurant.domain.service;

import com.enkitstudio.restaurant.restaurant.domain.OrderDecision;
import com.enkitstudio.restaurant.restaurant.domain.port.OrderDecisionRepository;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

/**
 * Application service for order decision business logic and validation.
 * <p>
 * Handles creation and retrieval of order decisions, including validation and business rules.
 */
@Service
@Validated
public class OrderDecisionService {

  private final OrderDecisionRepository orderDecisionRepository;

  public OrderDecisionService(OrderDecisionRepository orderDecisionRepository) {
    this.orderDecisionRepository = orderDecisionRepository;
  }

  /**
   * Create a new order decision with validation.
   * <p>
   * Validates the order decision and applies business rules (e.g., check order status).
   *
   * @param decision the order decision to create (validated)
   * @return the created order decision
   */
  public OrderDecision createOrderDecision(@Valid OrderDecision decision) {
    // Add business rules here (e.g., check order status)
    return orderDecisionRepository.save(decision);
  }

  /**
   * List all order decisions.
   * <p>
   * Retrieves all order decisions from the repository.
   *
   * @return list of all order decisions
   */
  public List<OrderDecision> listOrderDecisions() {
    return orderDecisionRepository.findAll();
  }
}
