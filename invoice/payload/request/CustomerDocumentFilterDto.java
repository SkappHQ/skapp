package com.skapp.enterprise.invoice.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerDocumentFilterDto {

    private Long customerId;
    private String name;
    private int page = 0;
    private int size = 10;
    private String sortBy = "id";
    private String sortDirection = "ASC";

}
