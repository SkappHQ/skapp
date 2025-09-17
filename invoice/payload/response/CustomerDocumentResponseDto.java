package com.skapp.enterprise.invoice.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CustomerDocumentResponseDto {

    private Long id;
    private String name;
    private String documentUrl;
    private Long customerId;
    private String customerName;
    private LocalDateTime createdDate;
    private LocalDateTime lastModifiedDate;

}
