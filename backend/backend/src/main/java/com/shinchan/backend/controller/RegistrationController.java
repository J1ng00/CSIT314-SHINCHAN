package com.shinchan.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shinchan.backend.model.Registration;
import com.shinchan.backend.repository.RegistrationRepository;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin
public class RegistrationController {

    @Autowired
    private SendGridEmailService sendGridEmailService;

    @Autowired
    private RegistrationRepository repo;

    @PostMapping
    public ResponseEntity<?> addToCart(@RequestBody Registration reg) {
        reg.setStatus(Registration.Status.CART);
        reg.setTicketPrice(reg.getTicketPrice() * reg.getQuantity());
        return ResponseEntity.ok(repo.save(reg));
    }

    @GetMapping("/{email}")
    public List<Registration> viewCart(@PathVariable String email) {
        return repo.findByUserEmailAndStatus(email, Registration.Status.CART);
    }

    @DeleteMapping("/{email}/{eventId}")
    @Transactional
    public ResponseEntity<?> removeFromCart(@PathVariable String email, @PathVariable Long eventId) {
        repo.deleteByUserEmailAndEventIdAndStatus(email, eventId, Registration.Status.CART);
        return ResponseEntity.ok("Removed from cart");
    }

    @PutMapping("/checkout/{email}")
    public ResponseEntity<?> checkout(@PathVariable String email) {
        List<Registration> cartItems = repo.findByUserEmailAndStatus(email, Registration.Status.CART);
        for (Registration r : cartItems) {
            r.setStatus(Registration.Status.CONFIRMED);
        }
        repo.saveAll(cartItems);
        return ResponseEntity.ok("✅ Checkout successful!");
    }

    @GetMapping("/user/{email}/CONFIRMED")
    public ResponseEntity<List<Registration>> getCompletedRegistrations(@PathVariable String email) {
    List<Registration> registrations = repo.findByUserEmailAndStatus(email, Registration.Status.CONFIRMED);
    return ResponseEntity.ok(registrations);
    }

    @GetMapping("/stats/{eventId}")
    public ResponseEntity<Map<String, Object>> getEventStats(@PathVariable Long eventId) {
        List<Registration> registrations = repo.findByEventIdAndStatus(eventId, Registration.Status.CONFIRMED);
    
        int totalParticipants = 0;
        int generalCount = 0;
        int vipCount = 0;
        int totalRevenue = 0;
    
        for (Registration reg : registrations) {
            int qty = reg.getQuantity();
            double price = reg.getTicketPrice(); // Assuming this is per ticket
            totalParticipants += qty;
            totalRevenue += price * qty;
        
            if ("VIP".equalsIgnoreCase(reg.getTicketType())) {
                vipCount += qty;
            } else {
                generalCount += qty;
            }
        }
    
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalParticipants", totalParticipants);
        stats.put("generalCount", generalCount);
        stats.put("vipCount", vipCount);
        stats.put("totalRevenue", totalRevenue);
    
        return ResponseEntity.ok(stats);
    }

    @PutMapping("/approve/{id}")
    @CrossOrigin
    public ResponseEntity<?> approve(@PathVariable Long id) {
        return updateStatusAndNotify(id, Registration.Status.CONFIRMED);
    }

    @PutMapping("/reject/{id}")
    @CrossOrigin
    public ResponseEntity<?> reject(@PathVariable Long id) {
        return updateStatusAndNotify(id, Registration.Status.REJECTED);
    }

    private ResponseEntity<?> updateStatusAndNotify(Long id, Registration.Status newStatus) {
        return repo.findById(id).map(reg -> {
            reg.setStatus(newStatus);
            repo.save(reg);

            String subject;
            String body;

            if (newStatus == Registration.Status.CONFIRMED) {
                subject = "🎉 Registration Approved: " + reg.getEventName();
                body = String.format("""
                    Hi,

                    You've been approved for the event: %s!

                    🎟 Ticket Type: %s
                    🧮 Quantity: %d
                    💵 Total Price: $%.2f

                    We look forward to seeing you there!

                    — EventBoard Team
                    """, reg.getEventName(), reg.getTicketType(), reg.getQuantity(), reg.getTicketPrice());
            } else if (newStatus == Registration.Status.REJECTED) {
                subject = "📬 Registration Update: " + reg.getEventName();
                body = String.format("""
                    Hi,

                    Thank you for registering for the event: %s.

                    Unfortunately, your registration has not been approved.

                    We appreciate your interest and hope you consider joining future events!

                    — EventBoard Team
                    """, reg.getEventName());
            } else {
                return ResponseEntity.badRequest().body("Unsupported status.");
            }

            try {
                sendGridEmailService.sendBulkEmail(List.of(reg.getUserEmail()), subject, body);
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.status(500).body("Failed to send email.");
            }

            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/pending/{eventId}")
    @CrossOrigin // Optional, if needed
    public List<Registration> getPendingRegistrations(@PathVariable Long eventId) {
        return repo.findByEventIdAndStatus(eventId, Registration.Status.PENDING);
    }

    @PostMapping("/notify/{eventId}")
    public ResponseEntity<String> notifyParticipants(@PathVariable Long eventId, @RequestBody String messageBody) {
        List<Registration> registrations = repo.findByEventIdAndStatus(eventId, Registration.Status.CONFIRMED);

        List<String> recipientEmails = registrations.stream()
           .map(Registration::getUserEmail)
           .distinct() // Avoid duplicates just in case
           .collect(Collectors.toList());

        if (recipientEmails.isEmpty()) {
           return ResponseEntity.badRequest().body("No confirmed participants to notify.");
        }

        sendGridEmailService.sendBulkEmail(recipientEmails, "Event Update", messageBody);
        return ResponseEntity.ok("Emails sent to confirmed participants.");
    }
}
