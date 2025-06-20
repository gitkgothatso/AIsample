package com.enkitstudio.restaurant.restaurant.domain;

import com.enkitstudio.restaurant.account.domain.User;
import jakarta.persistence.*;

/**
 * Entity representing a restaurant profile.
 */
@Entity
public class Restaurant {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  private String description;

  @ManyToOne(optional = false)
  private User owner;

  // Getters and setters omitted for brevity

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public User getOwner() {
    return owner;
  }

  public void setOwner(User owner) {
    this.owner = owner;
  }
}
