package com.shinchan.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shinchan.backend.model.Shortlist;
import com.shinchan.backend.model.ShortlistedEvent;

public interface ShortlistRepository extends JpaRepository<ShortlistedEvent, Shortlist> {
    List<ShortlistedEvent> findByIdUserEmail(String userEmail);
    boolean existsByIdUserEmailAndIdEventId(String userEmail, Long eventId);
    void deleteByIdUserEmailAndIdEventId(String userEmail, Long eventId);
}

