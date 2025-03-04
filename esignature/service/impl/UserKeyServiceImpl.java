package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.model.UserKey;
import com.skapp.enterprise.esignature.repository.UserKeyRepository;
import com.skapp.enterprise.esignature.security.AESKeyLoader;
import com.skapp.enterprise.esignature.security.CertificateGenerator;
import com.skapp.enterprise.esignature.security.ECDSAKeyGenerator;
import com.skapp.enterprise.esignature.service.UserKeyService;
import com.skapp.enterprise.esignature.utill.IVGenerator;
import com.skapp.enterprise.esignature.utill.encryptor.AESEncrypt;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.KeyPair;
import java.security.cert.X509Certificate;
import java.util.Base64;
import java.util.Optional;

@Service
@AllArgsConstructor
public class UserKeyServiceImpl implements UserKeyService {

	private final UserKeyRepository userKeyRepository;

	private final AESKeyLoader aesKeyLoader;

	public void generateAndStoreKeys(AddressBook addressBook) {
		try {
			KeyPair keyPair = ECDSAKeyGenerator.generateKeyPair();
			X509Certificate certificate = CertificateGenerator.generateCertificate(keyPair, addressBook.getEmail());

			byte[] publicKeyBytes = keyPair.getPublic().getEncoded();
			byte[] certBytes = certificate.getEncoded();

			UserKey userKey = new UserKey();

			byte[] iv = IVGenerator.generateIV();

			String encryptPrivateKey = AESEncrypt.encryptPrivateKey(keyPair.getPrivate(),
					aesKeyLoader.getAESKeyFromEnv(), iv);
			userKey.setPrivateKey(encryptPrivateKey);
			userKey.setPublicKey(Base64.getEncoder().encodeToString(publicKeyBytes));
			userKey.setCertificate(Base64.getEncoder().encodeToString(certBytes));
			userKey.setAddressBook(addressBook);
			userKey.setVector(Base64.getEncoder().encodeToString(iv));
			userKeyRepository.save(userKey);
		}
		catch (Exception e) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_USER_KEY_GENERATE,
					new String[] { e.getMessage() });
		}
	}

	@Override
	public UserKey getKeyPairByAddressBookId(@NotNull Long addressBookId) {
		Optional<UserKey> userKeyOptional = userKeyRepository.findByAddressBookId(addressBookId);
		if (userKeyOptional.isPresent()) {
			return userKeyOptional.get();
		}
		throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_USER_KEY_PAIR_NOT_FOUND);
	}

}
