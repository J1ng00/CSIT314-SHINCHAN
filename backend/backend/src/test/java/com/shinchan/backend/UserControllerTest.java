    package com.shinchan.backend;

    import com.shinchan.backend.config.SecurityConfig;
    import com.shinchan.backend.controller.UserController;
    import com.shinchan.backend.model.User;
    import com.shinchan.backend.repository.UserRepository;

    import org.junit.jupiter.api.Test;
    import org.mockito.Mockito;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
    import org.springframework.boot.test.mock.mockito.MockBean;
    import org.springframework.context.annotation.Import;
    import org.springframework.http.MediaType;
    import org.springframework.test.web.servlet.MockMvc;
    import org.springframework.security.crypto.bcrypt.BCrypt;

    import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
    import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

    @Import(SecurityConfig.class)
    @WebMvcTest(UserController.class)
    class UserControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @MockBean
        private UserRepository userRepository;

        @Test
        void shouldReturnUserWhenLoginIsSuccessful() throws Exception {
            User mockUser = new User();
            mockUser.setEmail("test@example.com");
            mockUser.setPassword(BCrypt.hashpw("password", BCrypt.gensalt()));

            Mockito.when(userRepository.findByEmail("test@example.com"))
                    .thenReturn(mockUser);

            mockMvc.perform(post("/api/users/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"email\":\"test@example.com\",\"password\":\"password\"}"))
                .andExpect(status().isOk());
        }
    }
