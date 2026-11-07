package com.example.jobTrack.exception;

public class JobNotFoundException extends RuntimeException{

    public JobNotFoundException (String message){

        super(message);
    }
}
