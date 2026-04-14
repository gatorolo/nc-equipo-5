package com.crm.enterprise.repository;

import com.crm.enterprise.entity.PipelineStage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PipelineStageRepository extends JpaRepository<PipelineStage, Long> {
    List<PipelineStage> findAllByOrderByOrdenAsc();
    java.util.Optional<PipelineStage> findByNombre(String nombre);
}
