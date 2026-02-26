package com.skapp.enterprise.esignature.service;

import com.skapp.enterprise.esignature.model.Envelope;

import java.io.IOException;

public interface SignatureCertificateService {

	byte[] generateCertificatePdfBytes(Long envelopeId, boolean isDocAccess, Envelope envelope) throws IOException;

}
