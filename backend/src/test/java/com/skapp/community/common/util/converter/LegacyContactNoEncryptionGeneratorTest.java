package com.skapp.community.common.util.converter;

import com.skapp.community.common.service.impl.EncryptionDecryptionServiceImpl;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

/**
 * Manual, throwaway helper that mints legacy-encrypted {@code contact_no} values for
 * testing the revert migration. It encrypts with the <b>same scheme and secret</b> the
 * app uses ({@link EncryptionDecryptionServiceImpl}), so the produced {@code ENC:...}
 * values decrypt correctly when the migration runs against the same database.
 *
 * <p>
 * Run on demand, passing the target environment's {@code encryptDecryptAlgorithm.secret}
 * (i.e. its {@code ENCRYPT_DECRYPT_SECRET}) as an environment variable so the forked test
 * JVM inherits it:
 * </p>
 *
 * <pre>
 * # PowerShell
 * $env:ENCRYPT_DECRYPT_SECRET="&lt;your-secret&gt;"; mvn test "-Dtest=LegacyContactNoEncryptionGeneratorTest"
 *
 * # bash
 * ENCRYPT_DECRYPT_SECRET="&lt;your-secret&gt;" mvn test -Dtest=LegacyContactNoEncryptionGeneratorTest
 * </pre>
 *
 * The printed {@code ENC:...} strings go straight into {@code organization.contact_no}.
 * The test is <b>skipped</b> (not failed) when no secret is provided, so it never breaks
 * CI. Delete this file once seeding/testing is done.
 */
class LegacyContactNoEncryptionGeneratorTest {

	private static final String[] CONTACT_NOS = { "0712233445", "0724455667" };

	@Test
	@DisplayName("Print ENC: contact_no values for the given secret (manual run)")
	void printEncryptedContactNos() {
		String secret = System.getenv("ENCRYPT_DECRYPT_SECRET");
		if (secret == null || secret.isBlank()) {
			secret = System.getProperty("encryptSecret");
		}
		Assumptions.assumeTrue(secret != null && !secret.isBlank(),
				"Set ENCRYPT_DECRYPT_SECRET (or -DencryptSecret) to the target environment's secret to run this generator");

		EncryptionDecryptionServiceImpl service = new EncryptionDecryptionServiceImpl();
		ReflectionTestUtils.setField(service, "encryptSecret", secret);

		System.out.println("=== original -> stored ENC: value -> migration-reverted plaintext ===");
		for (String contactNo : CONTACT_NOS) {
			// Seed value as the old converter wrote it.
			String stored = "ENC:" + service.encrypt(contactNo);
			// Exactly what the revert migration does: strip "ENC:" then decrypt.
			String reverted = service.decrypt(stored.substring("ENC:".length()));
			System.out.println(contactNo + "  ->  " + stored + "  ->  " + reverted);
		}
	}

}
