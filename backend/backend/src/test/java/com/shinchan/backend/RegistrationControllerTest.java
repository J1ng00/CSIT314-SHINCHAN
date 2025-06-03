package com.shinchan.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shinchan.backend.model.Registration;
import com.shinchan.backend.model.Registration.Status;
import com.shinchan.backend.repository.RegistrationRepository;
import com.shinchan.backend.controller.RegistrationController;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@SpringBootTest
@AutoConfigureMockMvc
class RegistrationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RegistrationRepository registrationRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldAddToCart() throws Exception {
        Registration reg = new Registration();
        reg.setEventId(10L);
        reg.setEventName("Test Event");
        reg.setQuantity(2);
        reg.setTicketPrice(50.0); // will be multiplied
        reg.setUserEmail("test@example.com");
        reg.setStatus(Status.CART);

        Registration saved = new Registration();
        saved.setId(1L);
        saved.setEventId(10L);
        saved.setEventName("Test Event");
        saved.setQuantity(2);
        saved.setTicketPrice(100.0); // 50.0 * 2
        saved.setUserEmail("test@example.com");
        saved.setStatus(Status.CART);

        Mockito.when(registrationRepository.save(Mockito.any())).thenReturn(saved);

        mockMvc.perform(post("/api/cart")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reg)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ticketPrice").value(100.0))
                .andExpect(jsonPath("$.status").value("CART"))
                .andExpect(jsonPath("$.userEmail").value("test@example.com"));
    }
}
