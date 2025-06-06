package com.shinchan.backend.repository;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shinchan.backend.model.User;


public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    User findByEmail(String email);
    List<User> findByRole(String role);
}
