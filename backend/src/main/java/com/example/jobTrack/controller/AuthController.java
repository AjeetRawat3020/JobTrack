package com.example.jobTrack.controller;


import com.example.jobTrack.dto.LoginRequest;
import com.example.jobTrack.service.CustomUserDetailsService;
import com.example.jobTrack.service.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService customUserDetailsService;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager,
                          CustomUserDetailsService customUserDetailsService,
                          JwtService jwtService){
        this.authenticationManager = authenticationManager;
        this.customUserDetailsService = customUserDetailsService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String,String>> login(@RequestBody LoginRequest loginRequest){

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        var userDetails = customUserDetailsService.loadUserByUsername(
                loginRequest.getUsername()
        );

        String token = jwtService.generateToken(
                userDetails.getUsername()
        );

        return ResponseEntity.ok(Map.of("token", token));
    }

}
