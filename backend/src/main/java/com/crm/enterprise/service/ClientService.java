package com.crm.enterprise.service;

import com.crm.enterprise.entity.Client;
import com.crm.enterprise.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final NotificationService notificationService;

    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    public Client getClientById(Long id) {
        return clientRepository.findById(id).orElseThrow(() -> new RuntimeException("Client not found"));
    }

    public Client createClient(Client client) {
        Client saved = clientRepository.save(client);
        notificationService.saveInternalNotification(
            "Nuevo Cliente", 
            "Se ha registrado a " + saved.getNombre() + " de la empresa " + saved.getEmpresa(),
            "info"
        );
        return saved;
    }

    public Client updateClient(Long id, Client clientDetails) {
        Client client = getClientById(id);
        client.setNombre(clientDetails.getNombre());
        client.setEmpresa(clientDetails.getEmpresa());
        client.setEmail(clientDetails.getEmail());
        client.setTelefono(clientDetails.getTelefono());
        client.setEstado(clientDetails.getEstado());
        client.setAvatarUrl(clientDetails.getAvatarUrl());
        return clientRepository.save(client);
    }

    public void deleteClient(Long id) {
        clientRepository.deleteById(id);
    }
}
