package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.DocumentVersion;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.payload.request.*;
import com.skapp.enterprise.esignature.payload.response.SignedDocumentResponse;
import jakarta.validation.constraints.NotNull;

import java.io.InputStream;
import java.security.KeyPair;
import java.security.PrivateKey;
import java.security.PublicKey;

public interface DocumentService {

	ResponseEntityDto saveDocument(DocumentDto document);

	Document getDocumentById(Long id);

	SignedDocumentResponse signFirstVersionDocument(Envelope envelope, DocumentSignDto documentSignDto, String uuid);

	ResponseEntityDto sequentialSignDocument(DocumentSignDto documentSignDto, boolean isDocAccess, String ipAddress);

	ResponseEntityDto parallelSignDocument(DocumentSignDto documentSignDto, boolean isDocAccess, String ipAddress);

	ResponseEntityDto signField(DocumentFieldSignDto documentFieldSignDto, String ipAddress);

	ResponseEntityDto editDocument(Long id, EditDocumentDto editDocumentDto);

	ResponseEntityDto deleteDocument(Long id);

	String getCurrentUsername();

	KeyPair loadKeyPair(Long addressBookId);

	void verifyDocumentSignature(byte[] documentBytes, DocumentVersion currentVersion, PublicKey publicKey);

	String signDocument(byte[] documentHash, PrivateKey privateKey);

	String hashDocument(InputStream file);

	AddressBook getCurrentAddressBookUser(@NotNull String userName);

	DocumentVersion buildNewDocumentVersion(DocumentVersion currentVersion, String filePath, String hash,
			String signature, AddressBook addressBook);

	ResponseEntityDto getDocumentDimensions(Long id);

	ResponseEntityDto generateImageListFromPdf(Long id);

	ResponseEntityDto getImageListMetadataFromPdf(Long id);

	ResponseEntityDto generateImageListFromPdfPage(
			DocumentPdfConvertFilterRequestDto documentPdfConvertFilterRequestDto);

}
