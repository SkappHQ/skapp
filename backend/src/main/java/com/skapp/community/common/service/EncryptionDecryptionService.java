package com.skapp.community.common.service;

public interface EncryptionDecryptionService {

	String encrypt(String stringToEncrypt);

	String decrypt(String stringToDecrypt);

}
