package com.shinchan.backend.util;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.shinchan.backend.model.Event;
import com.shinchan.backend.model.Registration;
import com.shinchan.backend.model.User;
import com.shinchan.backend.repository.EventRepository;
import com.shinchan.backend.repository.RegistrationRepository;
import com.shinchan.backend.repository.UserRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    private final Random random = new Random();
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    private final List<String> sampleDescriptions = List.of(
        "An exciting opportunity to network and learn.",
        "Join us for an evening of insights and innovation.",
        "Discover the future of tech in this exclusive session.",
        "A workshop designed to boost your career.",
        "Don't miss this chance to grow your network.",
        "Learn from industry leaders and experts.",
        "A casual gathering with free snacks and fun activities.",
        "Tech talks, demos, and live Q&A sessions.",
        "A must-attend for anyone in the field!",
        "Gain hands-on experience through live activities."
    );

    @Override
    public void run(String... args) {
        if (userRepository.count() < 10) {
            seedUsers();
        }
        if (eventRepository.count() < 10 || registrationRepository.count() < 50) {
            seedEventsAndRegistrations();
        }
    }

    private void seedUsers() {
        for (int i = 1; i <= 10; i++) {
            User organizer = new User();
            organizer.setName("Organizer " + i);
            organizer.setEmail("organizer" + i + "@example.com");
            organizer.setPassword(encoder.encode("password"));
            organizer.setRole("Organizer");
            userRepository.save(organizer);
        }
    }

    private void seedEventsAndRegistrations() {
        List<User> organizers = userRepository.findByRole("Organizer");

        for (int i = 1; i <= 10; i++) {
            Event event = new Event();
            event.setName("Sample Event " + i);
            event.setDate(LocalDate.now().plusDays(i));
            event.setLocation("Auditorium " + i);
            event.setOrganizerEmail(organizers.get(i % organizers.size()).getEmail());
            event.setDescription(sampleDescriptions.get(random.nextInt(sampleDescriptions.size())));

            boolean isVip = random.nextBoolean();
            event.setHasVip(isVip);

            if (isVip) {
                event.setGeneralPrice((double)30 + random.nextInt(21)); // $30–$50
                event.setVipPrice((double)100 + random.nextInt(51));    // $100–$150
            } else {
                event.setGeneralPrice((double)20 + random.nextInt(31)); // $20–$50
            }

            eventRepository.save(event);
        }

        List<Event> events = eventRepository.findAll();
        List<User> users = new ArrayList<>();

        for (int i = 1; i <= 50; i++) {
            User user = new User();
            user.setName("User " + i);
            user.setEmail("user" + i + "@example.com");
            user.setPassword(encoder.encode("password"));
            user.setRole("User");
            users.add(userRepository.save(user));
        }       

        for (User user : users) {
            Event event = events.get(random.nextInt(events.size()));
            Registration reg = new Registration();
            reg.setUserEmail(user.getEmail());
            reg.setEventId(event.getId());
            reg.setEventName(event.getName());
            reg.setStatus(Registration.Status.CONFIRMED);
            reg.setQuantity(1);

            if (Boolean.TRUE.equals(event.getHasVip())) {
                boolean isVip = random.nextBoolean(); // randomly choose VIP or General
                if (isVip) {
                    reg.setTicketType("VIP");
                    reg.setTicketPrice(event.getVipPrice());
                } else {
                    reg.setTicketType("General");
                    reg.setTicketPrice(event.getGeneralPrice());
                }
            } else {
                reg.setTicketType("General");
                reg.setTicketPrice(event.getGeneralPrice());
            }

            registrationRepository.save(reg);
        }
    }
}
