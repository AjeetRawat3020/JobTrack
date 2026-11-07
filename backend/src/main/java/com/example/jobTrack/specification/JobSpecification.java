package com.example.jobTrack.specification;

import com.example.jobTrack.entity.ApplicationStatus;
import com.example.jobTrack.entity.Job;
import org.springframework.beans.factory.BeanRegistry;
import org.springframework.data.jpa.domain.Specification;

public class JobSpecification {
    public static Specification<Job> hasLocation(String location){
        return (root, query, criteriaBuilder)->
                criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get("location")),
                        location.toLowerCase()
                );
    }


    public static Specification<Job> hasKeyword(String keyword){
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.or(
                        criteriaBuilder.like(
                                criteriaBuilder.lower(root.get("title")),
                                "%" + keyword.toLowerCase() + "%"
                        ),
                        criteriaBuilder.like(
                                criteriaBuilder.lower(root.get("description")),
                                "%" + keyword.toLowerCase() + "%"
                        )
                );
    }


    public static Specification<Job> hasCompany(String company){
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get("company")),
                        company.toLowerCase()
                );
    }


    public static Specification<Job> hasJobType(String jobType){
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get("jobType")),
                        jobType.toLowerCase()
                );
    }


    public static Specification<Job> hasStatus(ApplicationStatus status){
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("status"),status);
    }


    public static Specification<Job> hasUsername(String username){

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        root.get("user").get("username"),
                        username
                );
    }
}
