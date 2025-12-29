package com.skapp.enterprise.esignature.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignedPdfResult {
    private byte[] signedPdfBytes;
    private String certificateSerialNumber;
    private String signatureAlgorithm;
}
