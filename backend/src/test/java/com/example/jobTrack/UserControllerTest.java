package com.example.jobTrack;

import com.example.jobTrack.controller.UserController;
import com.example.jobTrack.dto.RegisterRequest;
import com.example.jobTrack.dto.UserResponse;
import com.example.jobTrack.entity.User;
import com.example.jobTrack.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

public class UserControllerTest {

    @Test
    void createUser(){
        UserService userService = mock(UserService.class);
        UserController userController = new UserController(userService);

        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setPassword("password123");

        User savedUser = new User();
        savedUser.setId(10L);
        savedUser.setUsername("testuser");

        when(userService.createUser("testuser", "password123"))
                .thenReturn(savedUser);

        ResponseEntity<UserResponse> response =
                userController.createUser(request);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(10L, response.getBody().getId());
        assertEquals("testuser", response.getBody().getUsername());

        verify(userService).createUser("testuser", "password123");
    }

    @Test
    void createUserDuplicate(){
        UserService userService = mock(UserService.class);
        UserController userController = new UserController(userService);

        RegisterRequest request = new RegisterRequest();
        request.setUsername("ajeet");
        request.setPassword("password123");

        when(userService.createUser("ajeet", "password123"))
                .thenThrow(new com.example.jobTrack.exception.UserAlreadyExistsException(
                        "Username already exists"
                ));

        org.junit.jupiter.api.Assertions.assertThrows(
                com.example.jobTrack.exception.UserAlreadyExistsException.class,
                ()->userController.createUser(request)
        );

        verify(userService).createUser("ajeet", "password123");
    }

    @Test
    void createUserInvalid(){
        UserService userService = mock(UserService.class);
        UserController userController = new UserController(userService);

        RegisterRequest request = new RegisterRequest();
        request.setUsername("");
        request.setPassword("password123");

        when(userService.createUser("", "password123"))
                .thenThrow(new IllegalArgumentException("Invalid username"));

        org.junit.jupiter.api.Assertions.assertThrows(
                IllegalArgumentException.class,
                ()->userController.createUser(request)
        );
    }
}
