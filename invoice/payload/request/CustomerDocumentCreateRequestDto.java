package com.skapp.enterprise.invoice.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerDocumentCreateRequestDto {

    @NotBlank(message = "Document name is required")
    private String name;

    @NotBlank(message = "Document URL is required")
    private String documentUrl;

    @NotNull(message = "Customer ID is required")
    private Long customerId;

}
