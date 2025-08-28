package com.skapp.enterprise.invoice.model;

import com.skapp.enterprise.esignature.type.DateFormatType;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "invoice_config")
public class InvoiceConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "payment_terms")
    private String paymentTerms;

    @Column(name = "pay_to_address")
    private String payToAddress;

}
