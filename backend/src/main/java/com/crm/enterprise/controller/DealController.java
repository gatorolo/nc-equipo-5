package com.crm.enterprise.controller;

import com.crm.enterprise.dto.DealDto;
import com.crm.enterprise.service.DealService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tratos")
@RequiredArgsConstructor
public class DealController {

    private final DealService dealService;

    @GetMapping
    public ResponseEntity<List<DealDto>> getAllDeals() {
        return ResponseEntity.ok(dealService.getAllDeals());
    }

    @PostMapping
    public ResponseEntity<DealDto> createDeal(@RequestBody DealDto dto) {
        return ResponseEntity.ok(dealService.createDeal(dto));
    }

    @PutMapping("/{id}/etapa")
    public ResponseEntity<DealDto> updateDealStage(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        String newStageName = body.get("etapa");
        return ResponseEntity.ok(dealService.updateDealStage(id, newStageName));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDeal(@PathVariable Long id) {
        dealService.deleteDeal(id);
        return ResponseEntity.noContent().build();
    }
}
