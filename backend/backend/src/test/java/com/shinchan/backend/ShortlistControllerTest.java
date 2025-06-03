package com.shinchan.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shinchan.backend.controller.ShortlistController;
import com.shinchan.backend.model.Shortlist;
import com.shinchan.backend.model.ShortlistedEvent;
import com.shinchan.backend.repository.ShortlistRepository;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@SpringBootTest
@AutoConfigureMockMvc
class ShortlistControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ShortlistRepository shortlistRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldAddToShortlist() throws Exception {
        Shortlist s = new Shortlist();
        s.setUserEmail("test@example.com");
        s.setEventId(123L);

        ShortlistedEvent saved = new ShortlistedEvent(s);

        Mockito.when(shortlistRepository.save(Mockito.any())).thenReturn(saved);

        mockMvc.perform(post("/api/shortlist")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(s)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("Event shortlisted successfully."));
    }

    @Test
    void shouldReturnUserShortlist() throws Exception {
        Shortlist s1 = new Shortlist();
        s1.setUserEmail("test@example.com");
        s1.setEventId(1L);

        Shortlist s2 = new Shortlist();
        s2.setUserEmail("test@example.com");
        s2.setEventId(2L);

        ShortlistedEvent e1 = new ShortlistedEvent(s1);
        ShortlistedEvent e2 = new ShortlistedEvent(s2);


        Mockito.when(shortlistRepository.findByIdUserEmail("test@example.com"))
                .thenReturn(List.of(e1, e2));

        mockMvc.perform(get("/api/shortlist/test@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id.eventId").value(1))
                .andExpect(jsonPath("$[1].id.eventId").value(2));
    }

    @Test
    void shouldDeleteShortlistItem() throws Exception {
        Mockito.when(shortlistRepository.existsByIdUserEmailAndIdEventId("test@example.com", 123L))
       .thenReturn(true);

        Mockito.doNothing().when(shortlistRepository)
               .deleteByIdUserEmailAndIdEventId("test@example.com", 123L);

        mockMvc.perform(delete("/api/shortlist/test@example.com/123"))
               .andDo(print())
               .andExpect(status().isOk())
               .andExpect(content().string("Event removed from shortlist."));
    }
}
