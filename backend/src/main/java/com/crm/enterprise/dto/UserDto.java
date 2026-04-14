package com.crm.enterprise.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {
    private Long id;
    @JsonProperty("nombre")
    private String name;
    private String email;
    private String telefono;
    @JsonProperty("avatar")
    private String avatarUrl;
}
