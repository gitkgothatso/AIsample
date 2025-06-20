package com.enkitstudio.restaurant.restaurant.domain.service;

import com.enkitstudio.restaurant.restaurant.domain.Order;
import com.enkitstudio.restaurant.restaurant.domain.port.OrderRepository;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

/**
 * Application service for order business logic and validation.
 * <p>
 * Handles creation and retrieval of orders, including validation and business rules.
 */
@Service
@Validated
public class OrderService {

  private final OrderRepository orderRepository;

  public OrderService(OrderRepository orderRepository) {
    this.orderRepository = orderRepository;
  }

  /**
   * Create a new order with validation.
   * <p>
   * Validates the order and applies business rules (e.g., check menu availability).
   *
   * @param order the order to create (validated)
   * @return the created order
   */
  public Order createOrder(@Valid Order order) {
    // Add business rules here (e.g., check menu availability)
    return orderRepository.save(order);
  }

  /**
   * List all orders.
   * <p>
   * Retrieves all orders from the repository.
   *
   * @return list of all orders
   */
  public List<Order> listOrders() {
    return orderRepository.findAll();
  }
}
