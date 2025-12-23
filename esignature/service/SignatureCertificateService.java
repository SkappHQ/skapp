package com.skapp.enterprise.esignature.service;

public interface SignatureCertificateService {

	byte[] generateCertificatePdfBytes(Long envelopeId, boolean isDocAccess);

}
