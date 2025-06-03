package com.shinchan.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shinchan.backend.controller.PaymentController;
import com.shinchan.backend.controller.SendGridEmailService;
import com.shinchan.backend.model.Registration;
import com.shinchan.backend.repository.RegistrationRepository;
import com.shinchan.backend.controller.PaymentController.PaymentRequest;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@SpringBootTest
@AutoConfigureMockMvc
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RegistrationRepository registrationRepository;

    @MockBean
    private SendGridEmailService sendGridEmailService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldHandlePaymentAndReturnAccepted() throws Exception {
        // Setup dummy cart item (map form like frontend sends)
        Map<String, Object> item = new HashMap<>();
        item.put("eventId", 10);
        item.put("eventName", "Test Event");
        item.put("quantity", 2);
        item.put("ticketPrice", 20.0);
        item.put("ticketType", "General");
        item.put("userEmail", "test@example.com");

                Map<String, Object> paymentRequest = new HashMap<>();
        paymentRequest.put("cartItems", List.of(
            Map.of(
                "eventId", 10,
                "eventName", "Test Event",
                "quantity", 2,
                "ticketPrice", 20.0,
                "ticketType", "General",
                "userEmail", "test@example.com"
            )
        ));

        mockMvc.perform(post("/api/payment")
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(paymentRequest)))
        .andDo(print())
        .andExpect(status().isOk());
    }
}
