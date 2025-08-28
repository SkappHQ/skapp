package com.skapp.enterprise.invoice.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InvoiceConfigDto {

    private String logoUrl;

    private String paymentTerms;

    private String payToAddress;


}
