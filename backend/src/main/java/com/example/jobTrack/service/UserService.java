package com.example.jobTrack.service;


import com.example.jobTrack.entity.User;
import com.example.jobTrack.exception.UserAlreadyExistsException;
import com.example.jobTrack.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder ){
        this.userRepository=userRepository;
        this.passwordEncoder=passwordEncoder;
    }

    public User createUser(String username, String password){

        if(userRepository.findByUsername(username).isPresent()){
            throw new UserAlreadyExistsException(
                    "Username already exists"
            );
        }

        User user = new User();

        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));

        return userRepository.save(user);

    }
}
