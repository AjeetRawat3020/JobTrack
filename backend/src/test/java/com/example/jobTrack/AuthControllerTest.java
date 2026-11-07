package com.example.jobTrack;

import com.example.jobTrack.controller.AuthController;
import com.example.jobTrack.dto.LoginRequest;
import com.example.jobTrack.service.CustomUserDetailsService;
import com.example.jobTrack.service.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class AuthControllerTest {

    @Test
    void loginReturnJwtTokenWhenCredentialsAreValid(){
        AuthenticationManager authenticationManager =
                mock(AuthenticationManager.class);

        CustomUserDetailsService userDetailsService =
                mock(CustomUserDetailsService.class);

        JwtService jwtService = mock(JwtService.class);

        AuthController authController = new AuthController(
                authenticationManager,
                userDetailsService,
                jwtService
        );

        LoginRequest request = new LoginRequest();
        request.setUsername("ajeet");
        request.setPassword("password123");

        UserDetails userDetails = User.withUsername("ajeet")
                .password("encodedPassword")
                .authorities("ROLE_USER")
                .build();

        when(userDetailsService.loadUserByUsername("ajeet"))
                .thenReturn(userDetails);

        when(jwtService.generateToken("ajeet"))
                .thenReturn("fake-jwt-token");

        ResponseEntity<Map<String, String>> response =
                authController.login(request);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(
                "fake-jwt-token",
                response.getBody().get("token")
        );

        verify(authenticationManager).authenticate(
                any(UsernamePasswordAuthenticationToken.class)
        );
        verify(jwtService).generateToken("ajeet");

    }

    @Test
    void loginThrowsExceptionWhenAuthenticationFails(){
        AuthenticationManager authenticationManager =
                mock(AuthenticationManager.class);

        CustomUserDetailsService userDetailsService =
                mock(CustomUserDetailsService.class);

        JwtService jwtService = mock(JwtService.class);

        AuthController authController = new AuthController(
                authenticationManager,
                userDetailsService,
                jwtService
        );

        LoginRequest request = new LoginRequest();
        request.setUsername("ajeet");
        request.setPassword("wrongPassword");

        when(authenticationManager.authenticate(
                any(UsernamePasswordAuthenticationToken.class)
        )).thenThrow(
                new org.springframework.security.core.AuthenticationException(
                        "Invalid credentials"
                ){}
        );

        assertThrows(
                org.springframework.security.core.AuthenticationException.class,
                ()->authController.login(request)
        );

        org.mockito.Mockito.verifyNoInteractions(
                userDetailsService,
                jwtService
        );
    }
}
