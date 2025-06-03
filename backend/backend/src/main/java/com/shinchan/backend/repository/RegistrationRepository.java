package com.shinchan.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.shinchan.backend.model.Registration;
import com.shinchan.backend.model.Registration.Status;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByUserEmailAndStatus(String userEmail, Status status);
    long countByEventIdAndStatus(Long eventId, Status status);
    void deleteByUserEmailAndEventIdAndStatus(String userEmail, Long eventId, Status status);
    @Query("SELECT r.userEmail FROM Registration r WHERE r.eventId = :eventId AND r.status = 'CONFIRMED'")
    List<String> findConfirmedEmailsByEventId(@Param("eventId") Long eventId);
    List<Registration> findByEventIdAndStatus(Long eventId, Status status);
}
