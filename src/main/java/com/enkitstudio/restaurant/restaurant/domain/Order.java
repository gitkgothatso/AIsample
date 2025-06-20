package com.enkitstudio.restaurant.restaurant.domain;

import com.enkitstudio.restaurant.account.domain.User;
import jakarta.persistence.*;

/**
 * Entity representing an order created by a customer for a menu.
 */
@Entity
@Table(name = "orders")
public class Order {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false)
  private Menu menu;

  @ManyToOne(optional = false)
  private User customer;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Status status;

  public enum Status {
    QUEUED,
    ACCEPTED,
    REJECTED,
    IN_PROGRESS,
    COMPLETED,
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Menu getMenu() {
    return menu;
  }

  public void setMenu(Menu menu) {
    this.menu = menu;
  }

  public User getCustomer() {
    return customer;
  }

  public void setCustomer(User customer) {
    this.customer = customer;
  }

  public Status getStatus() {
    return status;
  }

  public void setStatus(Status status) {
    this.status = status;
  }
  // Getters and setters omitted for brevity
}
