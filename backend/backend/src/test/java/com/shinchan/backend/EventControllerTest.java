package com.shinchan.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shinchan.backend.model.Event;
import com.shinchan.backend.repository.EventRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class EventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EventRepository eventRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldReturnAllEvents() throws Exception {
        Event event1 = new Event();
        event1.setId(1L);
        event1.setName("Event A");

        Event event2 = new Event();
        event2.setId(2L);
        event2.setName("Event B");

        List<Event> events = Arrays.asList(event1, event2);
        Mockito.when(eventRepository.findAll()).thenReturn(events);

        mockMvc.perform(get("/api/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Event A"))
                .andExpect(jsonPath("$[1].name").value("Event B"));
    }

    @Test
void shouldCreateEvent() throws Exception {
    Event newEvent = new Event();
    newEvent.setName("New Event");
    newEvent.setLocation("Hall A");
    newEvent.setDate(LocalDate.parse("2025-12-31"));
    newEvent.setDescription("An exciting new event.");
    newEvent.setCategory("Tech");
    newEvent.setImageUrl("http://example.com/image.png");
    newEvent.setGeneralPrice(20.0);
    newEvent.setHasVip(true);
    newEvent.setVipPrice(50.0);
    newEvent.setVipDescription("VIP seats with drinks");
    newEvent.setOrganizerEmail("organizer@example.com");

    Event savedEvent = new Event();
savedEvent.setId(1L);
savedEvent.setName("New Event");
savedEvent.setLocation("Hall A");
savedEvent.setDate(LocalDate.parse("2025-12-31"));
savedEvent.setDescription("An exciting new event.");
savedEvent.setCategory("Tech");
savedEvent.setImageUrl("http://example.com/image.png");
savedEvent.setGeneralPrice(20.0);
savedEvent.setHasVip(true);
savedEvent.setVipPrice(50.0);
savedEvent.setVipDescription("VIP seats with drinks");
savedEvent.setOrganizerEmail("organizer@example.com");

    Mockito.when(eventRepository.save(Mockito.any(Event.class))).thenReturn(savedEvent);

    mockMvc.perform(post("/api/events")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(newEvent)))
            .andDo(print()) // helpful for debugging response
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.name").value("New Event"));
}
}
