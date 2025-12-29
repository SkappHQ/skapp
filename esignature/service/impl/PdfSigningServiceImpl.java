package com.skapp.enterprise.esignature.service.impl;

import com.skapp.enterprise.esignature.exception.PdfSigningException;
import com.skapp.enterprise.esignature.payload.response.SignedPdfResult;
import com.skapp.enterprise.esignature.service.PdfSigningService;
import com.skapp.enterprise.esignature.signature.CertificateProvider;
import com.skapp.enterprise.esignature.signature.CertificateProviderException;
import com.skapp.enterprise.esignature.signature.SignatureProvider;
import com.skapp.enterprise.esignature.signature.SignatureProviderException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.interactive.digitalsignature.PDSignature;
import org.apache.pdfbox.pdmodel.interactive.digitalsignature.SignatureInterface;
import org.bouncycastle.asn1.x509.AlgorithmIdentifier;
import org.bouncycastle.cert.jcajce.JcaCertStore;
import org.bouncycastle.cms.CMSProcessableByteArray;
import org.bouncycastle.cms.CMSSignedData;
import org.bouncycastle.cms.CMSSignedDataGenerator;
import org.bouncycastle.cms.CMSTypedData;
import org.bouncycastle.cms.jcajce.JcaSignerInfoGeneratorBuilder;
import org.bouncycastle.operator.ContentSigner;
import org.bouncycastle.operator.DefaultSignatureAlgorithmIdentifierFinder;
import org.bouncycastle.operator.jcajce.JcaDigestCalculatorProviderBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.security.cert.X509Certificate;
import java.util.Arrays;
import java.util.Calendar;

/**
 * Implementation of PDF digital signing service.
 *
 * This service orchestrates the complete PDF signing workflow using: - Apache PDFBox for
 * PDF manipulation - BouncyCastle for cryptographic operations (CMS/PKCS#7) -
 * SignatureProvider interface for actual signing (local or HSM)
 *
 * The implementation is provider-agnostic and works with any SignatureProvider
 * (LocalSignatureProvider, AzureKeyVaultSignatureProvider, etc.).
 */
@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "skapp.pdf-signing.enabled", havingValue = "true")
public class PdfSigningServiceImpl implements PdfSigningService {

	private final SignatureProvider signatureProvider;

	private final CertificateProvider certificateProvider;

	@Value("${skapp.pdf-signing.enabled:false}")
	private boolean signingEnabled;

	@Value("${skapp.pdf-signing.signature.reason:Document completion signature}")
	private String signatureReason;

	@Value("${skapp.pdf-signing.signature.location:Skapp Platform}")
	private String signatureLocation;

	@Value("${skapp.pdf-signing.signature.contact-info:support@skapp.com}")
	private String signatureContactInfo;

	@Value("${skapp.pdf-signing.signature.name:Skapp Inc}")
	private String signatureName;

	@Override
	public SignedPdfResult signPdf(byte[] pdfBytes) throws PdfSigningException {

		if (!signingEnabled) {
			log.warn("PDF signing is disabled. Skipping signature.");
			return null;
		}

		log.info("Starting PDF signing");

		try {
			// 1. Load PDF from provided bytes
			byte[] signedPdfBytes = signPdfDocument(pdfBytes);

			// 2. Get certificate metadata
			X509Certificate[] certChain = certificateProvider.loadCertificateChain();
			X509Certificate orgCert = certChain[0]; // Leaf certificate

			log.info("PDF signed successfully");
			log.info("  - Certificate serial: {}", orgCert.getSerialNumber().toString(16).toUpperCase());
			log.info("  - Signature algorithm: {}", signatureProvider.getSignatureAlgorithm());

			return SignedPdfResult.builder()
				.signedPdfBytes(signedPdfBytes)
				.certificateSerialNumber(orgCert.getSerialNumber().toString(16).toUpperCase())
				.signatureAlgorithm(signatureProvider.getSignatureAlgorithm())
				.build();

		}
		catch (CertificateProviderException e) {
			log.error("Failed to load certificate chain", e);
			throw new PdfSigningException("Failed to load certificate chain", e);
		}
		catch (IOException e) {
			log.error("Failed to process PDF document", e);
			if (e.getCause() instanceof SignatureProviderException) {
				throw new PdfSigningException("Failed to generate signature: " + e.getCause().getMessage(), e);
			}
			throw new PdfSigningException("Failed to process PDF document", e);
		}
		catch (Exception e) {
			log.error("Failed to sign PDF", e);
			throw new PdfSigningException("Failed to sign PDF document", e);
		}
	}


	/**
	 * Sign the PDF document with the organization certificate.
	 */
	private byte[] signPdfDocument(byte[] pdfBytes) throws IOException {
		log.debug("Signing PDF document (size: {} bytes)", pdfBytes.length);

		try (PDDocument document = Loader.loadPDF(pdfBytes)) {

			// Create signature dictionary
			PDSignature signature = new PDSignature();
			signature.setFilter(PDSignature.FILTER_ADOBE_PPKLITE);
			signature.setSubFilter(PDSignature.SUBFILTER_ADBE_PKCS7_DETACHED);

			// Set signature metadata
			signature.setName(signatureName);
			signature.setReason(signatureReason);
			signature.setLocation(signatureLocation);
			signature.setContactInfo(signatureContactInfo);

			// Set signing time
			Calendar signingTime = Calendar.getInstance();
			signature.setSignDate(signingTime);

			// Add signature to document
			document.addSignature(signature, new PAdESSignatureInterface());

			// Save signed PDF to byte array
			try (ByteArrayOutputStream signedPdfStream = new ByteArrayOutputStream()) {
				document.saveIncremental(signedPdfStream);
				byte[] signedBytes = signedPdfStream.toByteArray();

				log.debug("PDF signed successfully (signed size: {} bytes)", signedBytes.length);
				return signedBytes;
			}
		}
	}

	/**
	 * SignatureInterface implementation for PAdES signing.
	 *
	 * This class handles the actual signing process: 1. PDFBox provides the byte ranges
	 * to sign 2. We hash those bytes 3. Send hash to SignatureProvider (local or HSM) 4.
	 * Build CMS/PKCS#7 signature structure 5. Return encoded signature
	 */
	private class PAdESSignatureInterface implements SignatureInterface {

		@Override
		public byte[] sign(InputStream content) throws IOException {
			try {
				log.debug("Signing PDF content");

				// 1. Read content bytes
				byte[] contentBytes = content.readAllBytes();

				// 2. Get certificate chain
				X509Certificate[] certChain = signatureProvider.getCertificateChain();

				// 3. Create CMS data
				CMSTypedData cmsData = new CMSProcessableByteArray(contentBytes);

				// 4. Create ContentSigner
				ContentSigner contentSigner = new DelegatingContentSigner(signatureProvider);

				// 5. Build CMS signature
				CMSSignedDataGenerator generator = new CMSSignedDataGenerator();

				JcaCertStore certStore = new JcaCertStore(Arrays.asList(certChain));
				generator.addCertificates(certStore);

				generator.addSignerInfoGenerator(new JcaSignerInfoGeneratorBuilder(
						new JcaDigestCalculatorProviderBuilder().build())
						.build(contentSigner, certChain[0]));

				CMSSignedData signedData = generator.generate(cmsData, false); // detached

				return signedData.getEncoded();

			}
			catch (Exception e) {
				log.error("Failed to sign PDF content", e);
				throw new IOException("Failed to sign PDF content", e);
			}
		}

	}

	/**
	 * ContentSigner that delegates to SignatureProvider.
	 */
	private static class DelegatingContentSigner implements ContentSigner {

		private final SignatureProvider provider;

		private final ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

		private final AlgorithmIdentifier algorithmIdentifier;

		private boolean signatureGenerated = false;

		public DelegatingContentSigner(SignatureProvider provider) {
			this.provider = provider;
			String algo = provider.getSignatureAlgorithm();
			try {
				this.algorithmIdentifier = new DefaultSignatureAlgorithmIdentifierFinder().find(algo);
			}
			catch (Exception e) {
				throw new RuntimeException("Failed to find algorithm identifier for " + algo, e);
			}
		}

		@Override
		public AlgorithmIdentifier getAlgorithmIdentifier() {
			return algorithmIdentifier;
		}

		@Override
		public OutputStream getOutputStream() {
			if (signatureGenerated) {
				throw new IllegalStateException("Cannot write to stream after signature has been generated");
			}
			return outputStream;
		}

		@Override
		public byte[] getSignature() {
			if (signatureGenerated) {
				throw new IllegalStateException("Signature has already been generated");
			}
			try {
				byte[] dataToSign = outputStream.toByteArray();
				// We pass the raw data (SignedAttributes) to the provider.
				// The provider (if using standard Java Signature) will hash it.
				// If the provider expects a pre-calculated hash (like some HSMs),
				// it should be adapted to hash the input first.
				byte[] signature = provider.signHash(dataToSign);
				signatureGenerated = true;
				return signature;
			}
			catch (Exception e) {
				throw new RuntimeException("Failed to sign data", e);
			}
		}

	}

	@Override
	public boolean isSigningEnabled() {
		return signingEnabled;
	}

}
