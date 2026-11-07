package com.example.jobTrack.service;


import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

        @Value("${jwt.secret}")
        private String secret;

        private SecretKey getSigningKey(){
            return Keys.hmacShaKeyFor(
                    secret.getBytes(StandardCharsets.UTF_8)
            );
        }

        public String generateToken(String username){

            long expirationTime = 1000 * 60 * 60;

            return Jwts.builder()
                    .subject(username)
                    .issuedAt(new Date())
                    .expiration(
                            new Date(System.currentTimeMillis()
                            + expirationTime)
                    )
                    .signWith(getSigningKey())
                    .compact();
        }

        public String extractUsername(String token){

            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
        }

        public boolean isTokenValid(String token,
                                    org.springframework.security.core.userdetails.UserDetails userDetails){

            try {
                final String username = extractUsername(token);

                return username.equals(userDetails.getUsername());
            } catch (io.jsonwebtoken.JwtException
                     | IllegalArgumentException exception) {
                return false;
            }
        }

    public String generateExpiredToken(String username) {
        Date now = new Date();
        Date expired = new Date(now.getTime() - 1000);

        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date(now.getTime() - 2000))
                .expiration(expired)
                .signWith(getSigningKey())
                .compact();
    }
}
