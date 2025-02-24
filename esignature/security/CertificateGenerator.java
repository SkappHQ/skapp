package com.skapp.enterprise.esignature.security;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import lombok.extern.slf4j.Slf4j;
import org.bouncycastle.asn1.x500.X500Name;
import org.bouncycastle.asn1.x500.X500NameBuilder;
import org.bouncycastle.asn1.x500.style.BCStyle;
import org.bouncycastle.asn1.x509.AccessDescription;
import org.bouncycastle.asn1.x509.AuthorityInformationAccess;
import org.bouncycastle.asn1.x509.AuthorityKeyIdentifier;
import org.bouncycastle.asn1.x509.BasicConstraints;
import org.bouncycastle.asn1.x509.ExtendedKeyUsage;
import org.bouncycastle.asn1.x509.Extension;
import org.bouncycastle.asn1.x509.GeneralName;
import org.bouncycastle.asn1.x509.KeyPurposeId;
import org.bouncycastle.asn1.x509.KeyUsage;
import org.bouncycastle.asn1.x509.SubjectKeyIdentifier;
import org.bouncycastle.asn1.x509.SubjectPublicKeyInfo;
import org.bouncycastle.cert.CertIOException;
import org.bouncycastle.cert.jcajce.JcaX509v3CertificateBuilder;
import org.bouncycastle.operator.ContentSigner;
import org.bouncycastle.operator.jcajce.JcaContentSignerBuilder;
import org.bouncycastle.cert.jcajce.JcaX509CertificateConverter;
import org.bouncycastle.cert.X509v3CertificateBuilder;
import org.bouncycastle.operator.OperatorCreationException;

import java.math.BigInteger;
import java.security.KeyPair;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.SecureRandom;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Objects;

@Slf4j
public final class CertificateGenerator {

	private static final String SIGNATURE_ALGORITHM = "SHA512withECDSA";

	private static final String PROVIDER = "BC";

	private static final String ORGANIZATION = "Rootocde";

	private static final String COUNTRY_CODE = "LK";

	private static final String STATE = "Western";

	private static final String CITY = "Colombo";

	private static final String DEPARTMENT = "Digital Signatures";

	private static final String OCSP_URL = "https://ocsp.organization.com";

	private static final String EMAIL_DOMAIN = "@organization.com";

	private CertificateGenerator() {
	}

	public static X509Certificate generateCertificate(KeyPair keyPair, String email) {
		Objects.requireNonNull(keyPair, "KeyPair cannot be null");
		Objects.requireNonNull(email, "UserId cannot be null");

		try {
			Instant now = Instant.now();
			Date startDate = Date.from(now.minus(5, ChronoUnit.MINUTES));
			Date endDate = Date.from(now.plus(365, ChronoUnit.DAYS));

			BigInteger serialNumber = generateSecureSerialNumber();
			X500Name subject = createX500Name(email);

			X509v3CertificateBuilder certBuilder = createCertificateBuilder(keyPair, subject, serialNumber, startDate,
					endDate);

			addCertificateExtensions(certBuilder, keyPair, serialNumber);

			return signAndGenerateCertificate(certBuilder, keyPair.getPrivate());

		}
		catch (Exception e) {
			log.error("Failed to generate certificate", e);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_GENERATE_CERTIFICATE,
					new String[] { e.getMessage() });
		}
	}

	private static BigInteger generateSecureSerialNumber() throws NoSuchAlgorithmException {
		byte[] serialBytes = new byte[20];
		SecureRandom.getInstanceStrong().nextBytes(serialBytes);
		return new BigInteger(1, serialBytes);
	}

	private static X500Name createX500Name(String email) {
		return new X500NameBuilder(BCStyle.INSTANCE).addRDN(BCStyle.CN, email)
			.addRDN(BCStyle.O, ORGANIZATION)
			.addRDN(BCStyle.OU, DEPARTMENT)
			.addRDN(BCStyle.C, COUNTRY_CODE)
			.addRDN(BCStyle.ST, STATE)
			.addRDN(BCStyle.L, CITY)
			.addRDN(BCStyle.E, email + EMAIL_DOMAIN)
			.build();
	}

	private static X509v3CertificateBuilder createCertificateBuilder(KeyPair keyPair, X500Name subject,
			BigInteger serialNumber, Date startDate, Date endDate) {
		return new JcaX509v3CertificateBuilder(subject, serialNumber, startDate, endDate, subject, keyPair.getPublic());
	}

	private static void addCertificateExtensions(X509v3CertificateBuilder certBuilder, KeyPair keyPair,
			BigInteger serialNumber) {
		try {

			SubjectPublicKeyInfo pubKeyInfo = SubjectPublicKeyInfo.getInstance(keyPair.getPublic().getEncoded());

			byte[] skiBytes = calculateIdentifier(pubKeyInfo);

			// Subject Key Identifier
			certBuilder.addExtension(Extension.subjectKeyIdentifier, false, new SubjectKeyIdentifier(skiBytes));

			// Authority Key Identifier
			addAuthorityKeyIdentifier(certBuilder, skiBytes, serialNumber);

			// Basic Constraints
			certBuilder.addExtension(Extension.basicConstraints, true, new BasicConstraints(false));

			// Key Usage
			certBuilder.addExtension(Extension.keyUsage, true,
					new KeyUsage(KeyUsage.digitalSignature | KeyUsage.nonRepudiation | KeyUsage.keyEncipherment));

			// Extended Key Usage
			certBuilder.addExtension(Extension.extendedKeyUsage, false,
					new ExtendedKeyUsage(new KeyPurposeId[] { KeyPurposeId.id_kp_emailProtection,
							KeyPurposeId.id_kp_codeSigning, KeyPurposeId.id_kp_timeStamping }));

			// OCSP Access Information
			addOCSPAccessInfo(certBuilder);

		}
		catch (Exception e) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_FAILED_GENERATE_CERTIFICATE,
					new String[] { e.getMessage() });
		}

	}

	private static void addAuthorityKeyIdentifier(X509v3CertificateBuilder certBuilder, byte[] skiBytes,
			BigInteger serialNumber) throws CertIOException {

		AuthorityKeyIdentifier aki = new AuthorityKeyIdentifier(skiBytes, null, serialNumber);

		certBuilder.addExtension(Extension.authorityKeyIdentifier, false, aki);
	}

	private static void addOCSPAccessInfo(X509v3CertificateBuilder certBuilder) throws CertIOException {
		certBuilder.addExtension(Extension.authorityInfoAccess, false,
				new AuthorityInformationAccess(new AccessDescription(AccessDescription.id_ad_ocsp,
						new GeneralName(GeneralName.uniformResourceIdentifier, OCSP_URL))));
	}

	private static byte[] calculateIdentifier(SubjectPublicKeyInfo pubKeyInfo) throws NoSuchAlgorithmException {
		MessageDigest digest = MessageDigest.getInstance("SHA-256");
		return digest.digest(pubKeyInfo.getPublicKeyData().getBytes());
	}

	private static X509Certificate signAndGenerateCertificate(X509v3CertificateBuilder certBuilder,
			PrivateKey privateKey) throws OperatorCreationException, CertificateException {

		ContentSigner signer = new JcaContentSignerBuilder(SIGNATURE_ALGORITHM).setProvider(PROVIDER).build(privateKey);

		return new JcaX509CertificateConverter().setProvider(PROVIDER).getCertificate(certBuilder.build(signer));
	}

}
