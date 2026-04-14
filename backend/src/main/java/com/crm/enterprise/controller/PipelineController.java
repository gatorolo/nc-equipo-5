package com.crm.enterprise.controller;

import com.crm.enterprise.entity.PipelineStage;
import com.crm.enterprise.service.PipelineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pipeline")
@RequiredArgsConstructor
public class PipelineController {

    private final PipelineService pipelineService;

    @GetMapping("/stages")
    public ResponseEntity<List<PipelineStage>> getAllStages() {
        return ResponseEntity.ok(pipelineService.getAllStages());
    }

    @PostMapping("/stages")
    public ResponseEntity<PipelineStage> saveStage(@RequestBody PipelineStage stage) {
        return ResponseEntity.ok(pipelineService.saveStage(stage));
    }

    @DeleteMapping("/stages/{id}")
    public ResponseEntity<Void> deleteStage(@PathVariable Long id) {
        pipelineService.deleteStage(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/stages/reorder")
    public ResponseEntity<Void> reorderStages(@RequestBody List<PipelineStage> stages) {
        pipelineService.updateStagesOrder(stages);
        return ResponseEntity.ok().build();
    }
}
