package com.shinchan.backend.controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shinchan.backend.model.Event;
import com.shinchan.backend.model.Registration;
import com.shinchan.backend.repository.EventRepository;
import com.shinchan.backend.repository.RegistrationRepository;

@RestController
@RequestMapping("/api/events")
@CrossOrigin
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private RegistrationRepository registrationRepo;
    
    @Autowired
    private EmailService emailService;

    @Autowired
    private SendGridEmailService sendGridEmailService;

    @Autowired
    private RegistrationRepository registrationRepository;

    @PostMapping
    public ResponseEntity<?> createEvent(@RequestBody Event event) {
    // Basic field checks
    if (event.getName() == null || event.getDate() == null || event.getLocation() == null || event.getGeneralPrice() == null) {
        return ResponseEntity.badRequest().body("Missing required event fields.");
    }

    // VIP-specific validation
    if (Boolean.TRUE.equals(event.getHasVip())) {
        if (event.getVipPrice() == null || event.getVipPrice() < 0) {
            return ResponseEntity.badRequest().body("VIP price must be provided and non-negative.");
        }
        if (event.getVipDescription() == null || event.getVipDescription().isEmpty()) {
            return ResponseEntity.badRequest().body("VIP description must be provided.");
        }
    }

        Event savedEvent = eventRepository.save(event);
        System.out.println("Event saved");
        return ResponseEntity.ok(savedEvent);
    }

    // Get all events for a specific organizer
    @GetMapping("/organizer/{email}")
    public List<Event> getEventsByOrganizer(@PathVariable String email) {
        return eventRepository.findByOrganizerEmail(email);
    }

    // Get a specific event by ID
    @GetMapping("/{id}")
    public Event getEventById(@PathVariable Long id) {
        return eventRepository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable Long id, @RequestBody Event updatedEvent) {
        return eventRepository.findById(id)
            .map(existingEvent -> {

                boolean changed = false;
                StringBuilder message = new StringBuilder("Hi,\n\nThe event you registered for has been updated:\n\n");
                message.append("Event: ").append(existingEvent.getName()).append("\n\n");

                if (!existingEvent.getName().equals(updatedEvent.getName())) {
                    changed = true;
                    message.append("🔤 New Title: ").append(updatedEvent.getName()).append("\n");
                    existingEvent.setName(updatedEvent.getName());
                }

                if (!existingEvent.getDate().equals(updatedEvent.getDate())) {
                    changed = true;
                    message.append("📅 New Date: ").append(updatedEvent.getDate()).append("\n");
                    existingEvent.setDate(updatedEvent.getDate());
                }

                if (!existingEvent.getLocation().equals(updatedEvent.getLocation())) {
                    changed = true;
                    message.append("📍 New Location: ").append(updatedEvent.getLocation()).append("\n");
                    existingEvent.setLocation(updatedEvent.getLocation());
                }

                if (!existingEvent.getDescription().equals(updatedEvent.getDescription())) {
                    changed = true;
                    message.append("📝 New Description: ").append(updatedEvent.getDescription()).append("\n");
                    existingEvent.setDescription(updatedEvent.getDescription());
                }

                // Always update these fields
                existingEvent.setGeneralPrice(updatedEvent.getGeneralPrice());
                existingEvent.setHasVip(updatedEvent.getHasVip());
                existingEvent.setVipPrice(updatedEvent.getVipPrice());
                existingEvent.setVipDescription(updatedEvent.getVipDescription());
                existingEvent.setImageUrl(updatedEvent.getImageUrl());

                Event saved = eventRepository.save(existingEvent);

                if (changed) {
                    System.out.println("✉️ Changes detected. Preparing to notify users...");

                    List<String> emails = registrationRepo.findConfirmedEmailsByEventId(existingEvent.getId());
                    System.out.println("📧 Notifying the following confirmed users:");
                    emails.forEach(email -> System.out.println(" - " + email));

                    emailService.sendBulkEmail(
                        emails,
                        "🔔 Event Updated: " + existingEvent.getName(),
                        message.toString()
                    );

                    System.out.println("✅ Email sent for event update.");
                } else {
                    System.out.println("ℹ️ No significant changes detected — no email sent.");
                }

                return ResponseEntity.ok(saved);
            })
            .orElseGet(() -> {
                System.out.println("❌ Event with ID " + id + " not found.");
                return ResponseEntity.notFound().build();
            });
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        Optional<Event> eventOpt = eventRepository.findById(id);
        if (eventOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Event not found");
        }

        Event event = eventOpt.get();

        // Step 1: Get confirmed participants
        List<Registration> confirmedRegistrations = registrationRepository.findByEventIdAndStatus(id, Registration.Status.CONFIRMED);
        List<String> emails = confirmedRegistrations.stream()
            .map(Registration::getUserEmail)
            .distinct()
            .collect(Collectors.toList());

        // Step 2: Notify users
        String emailBody = String.format(
            "Hi,\n\nWe regret to inform you that the event '%s' on %s has been cancelled. " +
            "Your payment will be refunded shortly.\n\nWe apologize for the inconvenience.\n\nRegards,\nEventBoard Team",
            event.getName(), event.getDate()
        );
        sendGridEmailService.sendBulkEmail(emails, "Event Cancellation Notice", emailBody);

        // Step 3: (Optional) Trigger refund logic here
        // refundService.processRefunds(confirmedRegistrations);

        // Step 4: Delete the event
        eventRepository.deleteById(id);

        return ResponseEntity.ok("Event cancelled and users notified.");
    }

    @GetMapping
    public ResponseEntity<List<Event>> getEvents(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String location,
        @RequestParam(required = false) String q
    ) {
        List<Event> events;
        
        if (q != null && !q.isEmpty()) {
            events = eventRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(q, q);
        } else if (category != null && location != null) {
            events = eventRepository.findByCategoryContainingIgnoreCaseAndLocationContainingIgnoreCase(category, location);
        } else if (category != null) {
            events = eventRepository.findByCategoryContainingIgnoreCase(category);
        } else if (location != null) {
            events = eventRepository.findByLocationContainingIgnoreCase(location);
        } else {
            events = eventRepository.findAll();
        }
    
        return ResponseEntity.ok(events);
    }
}
