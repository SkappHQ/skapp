package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.model.DocumentVersion;
import com.skapp.enterprise.esignature.payload.request.DocumentDto;
import com.skapp.enterprise.esignature.payload.request.DocumentFieldSignDto;
import com.skapp.enterprise.esignature.payload.request.DocumentSignDto;
import com.skapp.enterprise.esignature.payload.request.EditDocumentDto;

import java.io.InputStream;
import java.security.KeyPair;
import java.security.PrivateKey;
import java.security.PublicKey;

public interface DocumentService {

	ResponseEntityDto saveDocument(DocumentDto document);

	DocumentVersion signFirstVersionDocument(DocumentSignDto documentSignDto);

	ResponseEntityDto sequentialSignDocument(DocumentSignDto documentSignDto);

	ResponseEntityDto sequentialSignField(DocumentFieldSignDto documentFieldSignDto);

	ResponseEntityDto editDocument(Long id, EditDocumentDto editDocumentDto);

	ResponseEntityDto deleteDocument(Long id);

	KeyPair loadKeyPair(Long addressBookId);

	void verifyDocumentSignature(byte[] documentBytes, DocumentVersion currentVersion, PublicKey publicKey);

	String signDocument(byte[] documentHash, PrivateKey privateKey);

	String hashDocument(InputStream file);

	DocumentVersion buildNewDocumentVersion(DocumentVersion currentVersion, String filePath, String hash,
			String signature, AddressBook addressBook);

}
