package com.example.jobTrack;

import com.example.jobTrack.entity.User;
import com.example.jobTrack.repository.UserRepository;
import org.springframework.http.MediaType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import com.example.jobTrack.service.JwtService;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest(properties = {
        "jwt.secret=JobTrackTestSecretKeyMustBeAtLeast32BytesLong!"
})
@org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
public class JobApiTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;


    private void ensureTestUserExists(String username) {
        if (userRepository.findByUsername(username).isEmpty()) {
            User user = new User();
            user.setUsername(username);
            user.setPassword("test-password");
            userRepository.save(user);
        }
    }

    @Test
    void jobsWithoutTokenReturns401() throws Exception {
        mockMvc.perform(get("/api/jobs"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void jobsBadToken() throws Exception {
        mockMvc.perform(get("/api/jobs")
                .header("Authorization", "Bearer invalid.token.here"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void jobsValidToken() throws Exception{
        String token = "Bearer " + jwtService.generateToken("ajeet");

        mockMvc.perform(get("/api/jobs")
                .header("Authorization", token))
                .andExpect(status().isOk());
    }

    @Test
    void jobsExpiredToken() throws Exception {
        String token = "Bearer " +
                jwtService.generateExpiredToken("ajeet");

        mockMvc.perform(get("/api/jobs")
                        .header("Authorization", token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void jobsOtherUserReturns404() throws Exception {
        ensureTestUserExists("testOwner");

        String ownerToken = "Bearer " + jwtService.generateToken("testOwner");
        String otherUserToken = "Bearer " + jwtService.generateToken("ajeet");

        String requestBody = """
        {
            "title": "Owner's Java Developer Job",
            "company": "Test Company",
            "location": "Jaipur",
            "jobType": "Full-time",
            "description": "Ownership security test"
        }
        """;

        var result = mockMvc.perform(post("/api/jobs")
                        .header("Authorization", ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andReturn();

        System.out.println("POST STATUS: " + result.getResponse().getStatus());
        System.out.println("POST BODY: " + result.getResponse().getContentAsString());

        String response = result.getResponse().getContentAsString();

        com.fasterxml.jackson.databind.JsonNode json =
                new com.fasterxml.jackson.databind.ObjectMapper()
                        .readTree(response);

        long jobId = json.get("id").asLong();

        mockMvc.perform(get("/api/jobs/" + jobId)
                        .header("Authorization", otherUserToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void jobsOwnJobReturns200() throws Exception {
        String token = "Bearer " + jwtService.generateToken("ajeet");

        String requestBody = """
        {
            "title": "Test Java Developer",
            "company": "Test Company",
            "location": "Jaipur",
            "jobType": "Full-time",
            "description": "Test job for GET"
        }
        """;

        String response = mockMvc.perform(post("/api/jobs")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        com.fasterxml.jackson.databind.JsonNode json =
                new com.fasterxml.jackson.databind.ObjectMapper()
                        .readTree(response);

        long jobId = json.get("id").asLong();

        mockMvc.perform(get("/api/jobs/" + jobId)
                        .header("Authorization", token))
                .andExpect(status().isOk());
    }


    @Test
    void jobsOtherUserUpdateReturns404() throws Exception {
        String ownerToken = "Bearer " + jwtService.generateToken("testOwner");
        String otherUserToken = "Bearer " + jwtService.generateToken("ajeet");

        String createRequest = """
        {
            "title": "Owner's Java Developer Job",
            "company": "Test Company",
            "location": "Jaipur",
            "jobType": "Full-time",
            "description": "Ownership update test"
        }
        """;

        String response = mockMvc.perform(post("/api/jobs")
                        .header("Authorization", ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createRequest))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        com.fasterxml.jackson.databind.JsonNode json =
                new com.fasterxml.jackson.databind.ObjectMapper()
                        .readTree(response);

        long jobId = json.get("id").asLong();

        String updateRequest = """
        {
            "title": "Unauthorized Update",
            "company": "Test Company",
            "location": "Jaipur",
            "jobType": "Full-time",
            "description": "Should not be applied"
        }
        """;

        mockMvc.perform(
                org.springframework.test.web.servlet.request
                        .MockMvcRequestBuilders.put("/api/jobs/" + jobId)
                        .header("Authorization", otherUserToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateRequest)
        ).andExpect(status().isNotFound());
    }


    @Test
    void jobsOtherUserDeleteReturns404() throws Exception {
        String ownerToken = "Bearer " + jwtService.generateToken("testOwner");
        String otherUserToken = "Bearer " + jwtService.generateToken("ajeet");

        String createRequest = """
        {
            "title": "Owner's Java Developer Job",
            "company": "Test Company",
            "location": "Jaipur",
            "jobType": "Full-time",
            "description": "Ownership delete test"
        }
        """;

        String response = mockMvc.perform(post("/api/jobs")
                        .header("Authorization", ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createRequest))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        com.fasterxml.jackson.databind.JsonNode json =
                new com.fasterxml.jackson.databind.ObjectMapper()
                        .readTree(response);

        long jobId = json.get("id").asLong();

        mockMvc.perform(delete("/api/jobs/" + jobId)
                        .header("Authorization", otherUserToken))
                .andExpect(status().isNotFound());

        // Confirm the owner can still access the job.
        mockMvc.perform(get("/api/jobs/" + jobId)
                        .header("Authorization", ownerToken))
                .andExpect(status().isOk());
    }


    @Test
    void jobsOwnJobUpdateReturns200() throws Exception {
        String token = "Bearer " + jwtService.generateToken("ajeet");

        String createRequest = """
        {
            "title": "Java Developer",
            "company": "Test Company",
            "location": "Jaipur",
            "jobType": "Full-time",
            "description": "Job created for update test"
        }
        """;

        String response = mockMvc.perform(post("/api/jobs")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createRequest))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        com.fasterxml.jackson.databind.JsonNode json =
                new com.fasterxml.jackson.databind.ObjectMapper()
                        .readTree(response);

        long jobId = json.get("id").asLong();

        String updateRequest = """
        {
            "title": "Updated Java Developer",
            "company": "Test Company",
            "location": "Jaipur",
            "jobType": "Full-time",
            "description": "Updated description"
        }
        """;

        mockMvc.perform(
                org.springframework.test.web.servlet.request
                        .MockMvcRequestBuilders.put("/api/jobs/" + jobId)
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateRequest)
        ).andExpect(status().isOk());
    }


    @Test
    void jobsOwnJobDeleteReturns200() throws Exception {
        String token = "Bearer " + jwtService.generateToken("ajeet");

        String requestBody = """
            {
                "title": "Temporary Test Job",
                "company": "Test Company",
                "location": "Jaipur",
                "jobType": "Full-time",
                "description": "Temporary job for delete test"
            }
            """;

        String response = mockMvc.perform(post("/api/jobs")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        com.fasterxml.jackson.databind.JsonNode json =
                new com.fasterxml.jackson.databind.ObjectMapper().readTree(response);

        long jobId = json.get("id").asLong();

        mockMvc.perform(delete("/api/jobs/" + jobId)
                        .header("Authorization", token))
                .andExpect(status().isOk());
    }

}
