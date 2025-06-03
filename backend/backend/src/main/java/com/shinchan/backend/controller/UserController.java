package com.shinchan.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shinchan.backend.model.LoginRequest;
import com.shinchan.backend.model.User;
import com.shinchan.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    private final UserRepository repo;

    public UserController(UserRepository repo) {
        this.repo = repo;
    }

    // Signup endpoint
    @PostMapping("/signup")
public ResponseEntity<?> signup(@RequestBody User user) {
    String hashedPassword = BCrypt.hashpw(user.getPassword(), BCrypt.gensalt());
    user.setPassword(hashedPassword);

    if (repo.existsByEmail(user.getEmail())) {
        System.out.println("⚠️ Email already exists");
        return ResponseEntity.badRequest().body("Email already in use");
    }
    
    User savedUser = repo.save(user);
    return ResponseEntity.ok(savedUser);
}

@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request) {

    User user = repo.findByEmail(request.getEmail());

    if (user == null || !BCrypt.checkpw(request.getPassword(), user.getPassword())) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
    }
    return ResponseEntity.ok(user);
}

/*
@PostMapping("/create-admin")
public ResponseEntity<?> createAdmin() {
    User admin = new User();
    admin.setName("System Admin");
    admin.setEmail("admin@example.com");
    
    // Hash password using your current method
    String hashedPassword = BCrypt.hashpw("adminpass", BCrypt.gensalt());
    admin.setPassword(hashedPassword);

    // Set role as ADMIN
    admin.setRole("ADMIN");

    repo.save(admin);
    return ResponseEntity.ok("Admin user created");
}
*/

@GetMapping("/admin/users")
public ResponseEntity<?> getAllUsers(@RequestHeader String email) {
    User requester = repo.findByEmail(email);
    if (requester == null || !"ADMIN".equals(requester.getRole())) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
    }

    return ResponseEntity.ok(repo.findAll());
}

@GetMapping("/all")
public ResponseEntity<List<User>> getAllUsers() {
    return ResponseEntity.ok(repo.findAll());
}

@DeleteMapping("/{email}")
public ResponseEntity<?> deleteUser(@PathVariable String email) {
    User user = repo.findByEmail(email);
    if (user == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
    }
    repo.delete(user);
    return ResponseEntity.ok("User deleted");
}

}


