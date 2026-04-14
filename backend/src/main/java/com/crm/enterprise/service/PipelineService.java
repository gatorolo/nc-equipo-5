package com.crm.enterprise.service;

import com.crm.enterprise.entity.PipelineStage;
import com.crm.enterprise.repository.PipelineStageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PipelineService {

    private final PipelineStageRepository repository;

    public List<PipelineStage> getAllStages() {
        return repository.findAllByOrderByOrdenAsc();
    }

    public PipelineStage saveStage(PipelineStage stage) {
        if (stage.getOrden() == null) {
            stage.setOrden(repository.findAll().size());
        }
        return repository.save(stage);
    }

    public void deleteStage(Long id) {
        repository.deleteById(id);
    }

    public void updateStagesOrder(List<PipelineStage> stages) {
        for (int i = 0; i < stages.size(); i++) {
            PipelineStage stage = stages.get(i);
            stage.setOrden(i);
            repository.save(stage);
        }
    }
}
