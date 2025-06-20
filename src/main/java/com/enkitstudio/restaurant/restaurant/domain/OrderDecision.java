package com.enkitstudio.restaurant.restaurant.domain;

import jakarta.persistence.*;

/**
 * Entity representing a restaurant's decision on an order.
 */
@Entity
public class OrderDecision {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false)
  private Order order;

  @ManyToOne(optional = false)
  private Restaurant restaurant;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Status status;

  public enum Status {
    ACCEPTED,
    REJECTED,
  }
  // Getters and setters omitted for brevity
}
