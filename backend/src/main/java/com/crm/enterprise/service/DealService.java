package com.crm.enterprise.service;

import com.crm.enterprise.dto.DealDto;
import com.crm.enterprise.entity.Client;
import com.crm.enterprise.entity.Deal;
import com.crm.enterprise.entity.PipelineStage;
import com.crm.enterprise.repository.ClientRepository;
import com.crm.enterprise.repository.DealRepository;
import com.crm.enterprise.repository.PipelineStageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DealService {

    private final DealRepository dealRepository;
    private final ClientRepository clientRepository;
    private final PipelineStageRepository stageRepository;
    private final NotificationService notificationService;

    public List<DealDto> getAllDeals() {
        return dealRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public DealDto createDeal(DealDto dto) {
        Client client = clientRepository.findById(Long.parseLong(dto.getClienteId()))
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        PipelineStage stage = stageRepository.findByNombre(dto.getEtapa())
                .orElseGet(() -> stageRepository.findAllByOrderByOrdenAsc().get(0));

        Deal deal = Deal.builder()
                .nombre(dto.getNombre())
                .monto(dto.getMonto())
                .etapa(stage)
                .empresa(client.getEmpresa())
                .client(client)
                .build();
        
        deal = dealRepository.save(deal);
        
        notificationService.saveInternalNotification(
            "Nuevo Trato", 
            "Se ha iniciado la oportunidad: " + deal.getNombre() + " ($" + deal.getMonto() + ")", 
            "info"
        );

        return mapToDto(deal);
    }

    public DealDto updateDealStage(Long id, String newStageName) {
        Deal deal = dealRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trato no encontrado"));
        
        PipelineStage stage = stageRepository.findByNombre(newStageName)
                .orElseThrow(() -> new RuntimeException("Etapa no encontrada: " + newStageName));
        
        String oldStage = deal.getEtapa() != null ? deal.getEtapa().getNombre() : "Sin etapa";
        deal.setEtapa(stage);
        deal = dealRepository.save(deal);

        String type = newStageName.equalsIgnoreCase("Cerrado") ? "success" : "warning";
        String emoji = newStageName.equalsIgnoreCase("Cerrado") ? "🏆 " : "🔄 ";
        
        notificationService.saveInternalNotification(
            "Progreso de Trato", 
            emoji + deal.getNombre() + " movido a " + newStageName + " (antes: " + oldStage + ")", 
            type
        );

        return mapToDto(deal);
    }

    public void deleteDeal(Long id) {
        if (!dealRepository.existsById(id)) {
            throw new RuntimeException("Trato no encontrado");
        }
        dealRepository.deleteById(id);
    }

    private DealDto mapToDto(Deal deal) {
        return DealDto.builder()
                .id(deal.getId().toString())
                .nombre(deal.getNombre())
                .monto(deal.getMonto())
                .etapa(deal.getEtapa() != null ? deal.getEtapa().getNombre() : null)
                .clienteId(deal.getClient() != null ? deal.getClient().getId().toString() : null)
                .empresa(deal.getEmpresa())
                .build();
    }
}
