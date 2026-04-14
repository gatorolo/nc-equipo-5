package com.crm.enterprise.service;

import com.crm.enterprise.entity.CompanyProfile;
import com.crm.enterprise.repository.CompanyProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyProfileService {

    private final CompanyProfileRepository repository;

    public CompanyProfile getProfile() {
        List<CompanyProfile> profiles = repository.findAll();
        if (profiles.isEmpty()) {
            return new CompanyProfile();
        }
        return profiles.get(0);
    }

    public CompanyProfile updateProfile(CompanyProfile updated) {
        CompanyProfile existing = getProfile();
        if (existing.getId() != null) {
            updated.setId(existing.getId());
        }
        return repository.save(updated);
    }
}
