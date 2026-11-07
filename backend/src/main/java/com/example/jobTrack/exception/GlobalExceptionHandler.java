package com.example.jobTrack.exception;

import com.example.jobTrack.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex){

        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        errors.put(error.getField(), error.getDefaultMessage()));

        ErrorResponse errorResponse = new ErrorResponse();

        errorResponse.setStatus(400);
        errorResponse.setMessage("Validation failed");
        errorResponse.setErrors(errors);


        return ResponseEntity.badRequest().body(errorResponse);

    }

    @ExceptionHandler(JobNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleJobNotFound(
            JobNotFoundException ex){

        ErrorResponse errorResponse = new ErrorResponse();

        errorResponse.setStatus(404);
        errorResponse.setMessage(ex.getMessage());
        errorResponse.setErrors(new HashMap<>());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);

    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleUserAlreadyExists(
            UserAlreadyExistsException ex
     ){
        ErrorResponse errorResponse = new ErrorResponse();

        errorResponse.setStatus(409);
        errorResponse.setMessage(ex.getMessage());
        errorResponse.setErrors(new HashMap<>());

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex) {

        ErrorResponse errorResponse = new ErrorResponse();

        errorResponse.setStatus(500);
        errorResponse.setMessage("Something went wrong. Please try again later.");
        errorResponse.setErrors(new HashMap<>());

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorResponse);
    }

    @ExceptionHandler(NotificationNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotificationNotFound(
            NotificationNotFoundException ex){

        ErrorResponse errorResponse = new ErrorResponse();

        errorResponse.setStatus(404);
        errorResponse.setMessage(ex.getMessage());
        errorResponse.setErrors(new HashMap<>());

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(errorResponse);
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ErrorResponse> handleMethodValidation(
            HandlerMethodValidationException ex) {

        ErrorResponse errorResponse = new ErrorResponse();

        errorResponse.setStatus(400);
        errorResponse.setMessage("Invalid request parameters");
        errorResponse.setErrors(new HashMap<>());

        return ResponseEntity.badRequest().body(errorResponse);
    }
}
