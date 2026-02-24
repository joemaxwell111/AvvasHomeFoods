package com.avvahomefoods.controller;

import com.avvahomefoods.model.User;
import com.avvahomefoods.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Value("${google.client.id}")
    private String googleClientId;

    @GetMapping("/google-client-id")
    public ResponseEntity<Map<String, String>> getGoogleClientId() {
        Map<String, String> response = new HashMap<>();
        response.put("clientId", googleClientId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        // Create new user's account
        User newUser = new User();
        newUser.setUsername(user.getUsername());
        newUser.setPassword(passwordEncoder.encode(user.getPassword()));
        newUser.setName(user.getName());
        newUser.setRole("USER");
        newUser.setProvider("LOCAL");

        userRepository.save(newUser);
        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/admin/register")
    public ResponseEntity<?> registerAdmin(@RequestBody User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        User newAdmin = new User();
        newAdmin.setUsername(user.getUsername());
        newAdmin.setPassword(passwordEncoder.encode(user.getPassword()));
        newAdmin.setName(user.getName());
        newAdmin.setRole("ADMIN");
        newAdmin.setProvider("LOCAL");

        userRepository.save(newAdmin);
        return ResponseEntity.ok("Admin registered successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");

        User user = userRepository.findByUsername(username)
                .orElse(null);

        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("username", user.getUsername());
            response.put("name", user.getName());
            response.put("role", user.getRole());
            response.put("token", "dummy-token-for-now"); // In real app, use JWT
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body("Error: Invalid username or password!");
        }
    }

    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> requestBody) {
        try {
            String idTokenString = requestBody.get("credential");

            // Verify the Google ID token
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);

            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();

                String email = payload.getEmail();
                String name = (String) payload.get("name");

                // Check if user exists
                User user = userRepository.findByUsername(email).orElse(null);

                if (user == null) {
                    // Create new user with Google provider
                    user = new User();
                    user.setUsername(email);
                    user.setName(name);
                    user.setRole("USER");
                    user.setProvider("GOOGLE");
                    user.setPassword(""); // No password for Google users
                    userRepository.save(user);
                }

                // Return user data
                Map<String, Object> response = new HashMap<>();
                response.put("id", user.getId());
                response.put("username", user.getUsername());
                response.put("name", user.getName());
                response.put("role", user.getRole());
                response.put("token", "dummy-token-for-now");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body("Invalid ID token");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error verifying Google token: " + e.getMessage());
        }
    }
}
