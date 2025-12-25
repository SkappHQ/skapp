package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.service.AmazonS3Service;
import com.skapp.enterprise.esignature.exception.PdfSigningException;
import com.skapp.enterprise.esignature.model.DocumentVersion;
import com.skapp.enterprise.esignature.model.SignatureValidationResult;
import com.skapp.enterprise.esignature.repository.DocumentVersionDao;
import com.skapp.enterprise.esignature.service.PdfSigningService;
import com.skapp.enterprise.esignature.signature.CertificateProvider;
import com.skapp.enterprise.esignature.signature.SignatureProvider;
import com.skapp.enterprise.esignature.util.EsignUtil;

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
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.security.cert.X509Certificate;
import java.time.LocalDateTime;
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
	public static final String UPLOAD_DOCUMENT_URL_PATH = "/eSign/envelop/process/documents/";

	private final SignatureProvider signatureProvider;

	private final CertificateProvider certificateProvider;

	private final AmazonS3Service s3Service;

	private final DocumentVersionDao documentVersionDao;

	@Value("${skapp.pdf-signing.enabled:false}")
	private boolean signingEnabled;

	@Value("${skapp.pdf-signing.signature.reason:Document completion signature}")
	private String signatureReason;

	@Value("${skapp.pdf-signing.signature.location:Skapp Platform}")
	private String signatureLocation;

	@Value("${skapp.pdf-signing.signature.contact-info:support@skapp.com}")
	private String signatureContactInfo;

	@Value("${aws.s3.bucket-name}")
	private String s3BucketName;

	@Override
	@Transactional
	public DocumentVersion signCompletedDocument(Long documentVersionId, byte[] pdfBytes) throws PdfSigningException {

		if (!signingEnabled) {
			log.warn("PDF signing is disabled. Skipping signature for document version: {}", documentVersionId);
			return documentVersionDao.findById(documentVersionId)
				.orElseThrow(() -> new PdfSigningException("Document version not found: " + documentVersionId));
		}

		log.info("Starting PDF signing for document version: {}", documentVersionId);

		try {
			// 1. Fetch document version
			DocumentVersion docVersion = documentVersionDao.findById(documentVersionId)
				.orElseThrow(() -> new PdfSigningException("Document version not found: " + documentVersionId));

			// 2. Validate that signing hasn't already been done
			if (Boolean.TRUE.equals(docVersion.getIsPdfSigned())) {
				log.warn("Document version {} is already signed. Skipping.", documentVersionId);
				return docVersion;
			}

			// 3. Load PDF from provided bytes
			byte[] signedPdfBytes = signPdfDocument(pdfBytes);

			// 4. Upload signed PDF to S3
			String signedPath = uploadSignedPdfToS3(signedPdfBytes);

			// 5. Update document version with signature metadata
			updateDocumentVersionMetadata(docVersion, signedPath);

			// 6. Save updated document version
			documentVersionDao.save(docVersion);

			log.info("PDF signed successfully for document version: {}", documentVersionId);
			log.info("  - Signed PDF uploaded to: {}", signedPath);
			log.info("  - Certificate serial: {}", docVersion.getCertificateSerialNumber());
			log.info("  - Signature algorithm: {}", docVersion.getSignatureAlgorithm());

			return docVersion;

		}
		catch (Exception e) {
			log.error("Failed to sign PDF for document version: " + documentVersionId, e);
			throw new PdfSigningException("Failed to sign PDF document", e);
		}
	}

	/**
	 * Sign the PDF document with the organization certificate.
	 */
	private byte[] signPdfDocument(byte[] pdfBytes) throws Exception {
		log.debug("Signing PDF document (size: {} bytes)", pdfBytes.length);

		try (PDDocument document = Loader.loadPDF(pdfBytes)) {

			// Create signature dictionary
			PDSignature signature = new PDSignature();
			signature.setFilter(PDSignature.FILTER_ADOBE_PPKLITE);
			signature.setSubFilter(PDSignature.SUBFILTER_ADBE_PKCS7_DETACHED);

			// Set signature metadata
			signature.setName("Skapp Inc"); // Organization name
			signature.setReason(signatureReason);
			signature.setLocation(signatureLocation);
			signature.setContactInfo(signatureContactInfo);

			// Set signing time
			Calendar signingTime = Calendar.getInstance();
			signature.setSignDate(signingTime);

			// Add signature to document
			document.addSignature(signature, new PAdESSignatureInterface());

			// Save signed PDF to byte array
			ByteArrayOutputStream signedPdfStream = new ByteArrayOutputStream();
			document.saveIncremental(signedPdfStream);
			byte[] signedBytes = signedPdfStream.toByteArray();

			log.debug("PDF signed successfully (signed size: {} bytes)", signedBytes.length);
			return signedBytes;
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
			return outputStream;
		}

		@Override
		public byte[] getSignature() {
			try {
				byte[] dataToSign = outputStream.toByteArray();
				// We pass the raw data (SignedAttributes) to the provider.
				// The provider (if using standard Java Signature) will hash it.
				// If the provider expects a pre-calculated hash (like some HSMs),
				// it should be adapted to hash the input first.
				return provider.signHash(dataToSign);
			}
			catch (Exception e) {
				throw new RuntimeException("Failed to sign data", e);
			}
		}

	}

	/**
	 * Upload signed PDF to S3.
	 *
	 * Follows the same pattern as uploadProcessedDocumentVersion in DocumentServiceImpl:
	 * generates a unique random path for the signed document version.
	 * @param signedPdfBytes the signed PDF bytes to upload
	 * @return the S3 file path where the PDF was uploaded
	 */
	private String uploadSignedPdfToS3(byte[] signedPdfBytes) {
		String tenantId = TenantContext.getCurrentTenant();

		if (tenantId == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_ID_NOT_FOUND);
		}

		// Generate random URL path (same approach as document versions)
		String randomUrl = EsignUtil.randomUrlPath();

		// Build file path:
		// bucketName/eSign/envelop/process/documents/{tenantId}/{randomUrl}
		String fileUrl = s3BucketName + UPLOAD_DOCUMENT_URL_PATH + tenantId + "/" + randomUrl;

		log.debug("Uploading signed PDF to S3: {}", fileUrl);

		try (InputStream inputStream = new ByteArrayInputStream(signedPdfBytes)) {
			s3Service.uploadFile(s3BucketName, fileUrl, inputStream);
			log.debug("Signed PDF uploaded successfully");
		}
		catch (Exception e) {
			log.error("Failed to upload signed PDF to S3", e);
			throw new PdfSigningException("Failed to upload signed PDF to S3", e);
		}

		return fileUrl;
	}

	/**
	 * Update DocumentVersion entity with signature metadata.
	 */
	private void updateDocumentVersionMetadata(DocumentVersion docVersion, String signedPath) throws Exception {

		// Get certificate metadata
		X509Certificate[] certChain = certificateProvider.loadCertificateChain();
		X509Certificate orgCert = certChain[0]; // Leaf certificate

		// Update document version fields
		docVersion.setIsPdfSigned(true);
		docVersion.setPdfSignedAt(LocalDateTime.now());
		docVersion.setFilePath(signedPath); // Update path to signed version
		docVersion.setCertificateSerialNumber(orgCert.getSerialNumber().toString(16).toUpperCase());
		docVersion.setSignatureAlgorithm(signatureProvider.getSignatureAlgorithm());

		// Note: timestampToken field can be added later for TSA integration
	}

	@Override
	public SignatureValidationResult verifyPdfSignature(byte[] pdfBytes) throws PdfSigningException {
		throw new UnsupportedOperationException("Signature verification is not yet implemented");
	}

	@Override
	public boolean isSigningEnabled() {
		return signingEnabled;
	}

}
