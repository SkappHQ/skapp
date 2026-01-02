package com.skapp.enterprise.esignature.service;

import java.io.IOException;

import com.skapp.enterprise.esignature.model.Envelope;

public interface SignatureCertificateService {

	byte[] generateCertificatePdfBytes(Long envelopeId, boolean isDocAccess, Envelope envelope) throws IOException;

}
