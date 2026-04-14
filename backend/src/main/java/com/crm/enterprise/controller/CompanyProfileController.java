package com.crm.enterprise.controller;

import com.crm.enterprise.entity.CompanyProfile;
import com.crm.enterprise.service.CompanyProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/company")
@RequiredArgsConstructor
public class CompanyProfileController {

    private final CompanyProfileService service;

    @GetMapping
    public ResponseEntity<CompanyProfile> getCompany() {
        return ResponseEntity.ok(service.getProfile());
    }

    @PutMapping
    public ResponseEntity<CompanyProfile> updateCompany(@RequestBody CompanyProfile profile) {
        return ResponseEntity.ok(service.updateProfile(profile));
    }
}
