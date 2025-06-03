package com.shinchan.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shinchan.backend.model.Event;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByOrganizerEmail(String organizerEmail);
    
    List<Event> findByCategoryContainingIgnoreCase(String category);
    List<Event> findByLocationContainingIgnoreCase(String location);
    List<Event> findByCategoryContainingIgnoreCaseAndLocationContainingIgnoreCase(String category, String location);
    List<Event> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description);
}
