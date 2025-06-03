package com.shinchan.backend.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shinchan.backend.model.Shortlist;
import com.shinchan.backend.model.ShortlistedEvent;
import com.shinchan.backend.model.ShortlistedEventDTO;
import com.shinchan.backend.repository.EventRepository;
import com.shinchan.backend.repository.ShortlistRepository;


@RestController
@RequestMapping("/api/shortlist")
@CrossOrigin(origins = "http://localhost:5173")
public class ShortlistController {

    @Autowired
    private ShortlistRepository shortlistRepository;
    @Autowired
    private EventRepository eventRepository;

     @GetMapping("/{userEmail}")
    public ResponseEntity<List<ShortlistedEventDTO>> getShortlistedEvents(@PathVariable String userEmail) {
        List<ShortlistedEvent> shortlist = shortlistRepository.findByIdUserEmail(userEmail);

        List<ShortlistedEventDTO> dtoList = shortlist.stream()
            .map(se -> new ShortlistedEventDTO(
                se.getId(),
                eventRepository.findById(se.getId().getEventId()).orElse(null)
            ))
            .collect(Collectors.toList());

        return ResponseEntity.ok(dtoList);
    }

    @PostMapping
    public ResponseEntity<String> addShortlistedEvent(@RequestBody Shortlist id) {
        if (shortlistRepository.existsByIdUserEmailAndIdEventId(id.getUserEmail(), id.getEventId())) {
            return ResponseEntity.badRequest().body("Event already shortlisted.");
        }

        ShortlistedEvent newEntry = new ShortlistedEvent(id);
        shortlistRepository.save(newEntry);
        return ResponseEntity.ok("Event shortlisted successfully.");
    }

    @DeleteMapping("/{userEmail}/{eventId}")
    @Transactional
    public ResponseEntity<String> removeShortlistedEvent(
    @PathVariable String userEmail,
    @PathVariable Long eventId) {

    if (!shortlistRepository.existsByIdUserEmailAndIdEventId(userEmail, eventId)) {
        return ResponseEntity.notFound().build();
    }

    shortlistRepository.deleteByIdUserEmailAndIdEventId(userEmail, eventId);
    return ResponseEntity.ok("Event removed from shortlist.");
    }
}
