package com.example.jobTrack.controller;

import com.example.jobTrack.dto.RegisterRequest;
import com.example.jobTrack.dto.UserResponse;
import com.example.jobTrack.entity.User;
import com.example.jobTrack.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService){

        this.userService = userService;

    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody RegisterRequest request){

        User user = userService.createUser(request.getUsername(),request.getPassword());

        UserResponse response = new UserResponse(user.getId(),user.getUsername());

        return ResponseEntity.ok(response);
    }

}
