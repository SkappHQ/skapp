package com.skapp.enterprise.invoice.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.AmazonS3DeleteItemRequestDto;
import com.skapp.enterprise.common.service.AmazonS3Service;
import com.skapp.enterprise.invoice.constant.InvoiceMessageConstant;
import com.skapp.enterprise.invoice.mapper.CustomerMapper;
import com.skapp.enterprise.invoice.model.Customer;
import com.skapp.enterprise.invoice.model.CustomerDocument;
import com.skapp.enterprise.invoice.payload.request.CustomerDocumentCreateRequestDto;
import com.skapp.enterprise.invoice.payload.request.CustomerDocumentFilterDto;
import com.skapp.enterprise.invoice.payload.request.CustomerDocumentRenameRequestDto;
import com.skapp.enterprise.invoice.payload.response.CustomerDocumentListResponseDto;
import com.skapp.enterprise.invoice.payload.response.CustomerDocumentRenameResponseDto;
import com.skapp.enterprise.invoice.payload.response.CustomerDocumentResponseDto;
import com.skapp.enterprise.invoice.repository.CustomerDao;
import com.skapp.enterprise.invoice.repository.CustomerDocumentDao;
import com.skapp.enterprise.invoice.service.CustomerDocumentService;
import com.skapp.enterprise.invoice.service.CustomerValidationService;
import com.skapp.enterprise.invoice.type.DocumentStatus;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class CustomerDocumentServiceImpl implements CustomerDocumentService {

	private final CustomerDocumentDao customerDocumentDao;

	private final CustomerDao customerDao;

	private final CustomerMapper customerMapper;

	private final CustomerValidationService customerValidationService;

	private final AmazonS3Service amazonS3Service;

	@Value("${aws.s3.bucket-name}")
	private String bucketName;

	@Override
	@Transactional
	public ResponseEntityDto createDocument(CustomerDocumentCreateRequestDto requestDto) {

		customerValidationService.validateCustomerDocumentCreateRequestDto(requestDto);

		Optional<Customer> customer = customerDao.findById(requestDto.getCustomerId());

		if (customer.isEmpty()) {
			throw new EntityNotFoundException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_NOT_FOUND);
		}

		CustomerDocument customerDocument = customerMapper
			.customerDocumentCreateRequestDtoToCustomerDocument(requestDto);

		customerDocument.setCustomer(customer.get());

		CustomerDocument savedDocument = customerDocumentDao.save(customerDocument);
		CustomerDocumentResponseDto responseDto = customerMapper
			.customerDocumentToCustomerDocumentResponseDto(savedDocument);

		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	public ResponseEntityDto getDocumentById(Long id) {

		Optional<CustomerDocument> customerDocument = customerDocumentDao.findById(id);

		if (customerDocument.isEmpty()) {
			throw new EntityNotFoundException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_DOCUMENT_NOT_FOUND);
		}

		CustomerDocumentResponseDto responseDto = customerMapper
			.customerDocumentToCustomerDocumentResponseDto(customerDocument.get());

		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	public ResponseEntityDto filterDocuments(CustomerDocumentFilterDto filterDto) {

		customerValidationService.validateCustomerDocumentFilterDto(filterDto);
		int page = filterDto.getPage();
		int size = filterDto.getSize();
		String sortBy = filterDto.getSortKey().getField();
		String sortDirection = filterDto.getSortOrder().toString();

		Sort.Direction direction = Sort.Direction.fromString(sortDirection.toUpperCase());
		Sort sort = Sort.by(direction, sortBy);
		Pageable pageable = PageRequest.of(page, size, sort);

		Page<CustomerDocument> customerDocumentsPage = customerDocumentDao.findFilteredDocuments(filterDto, pageable);

		List<CustomerDocumentResponseDto> customerDocumentResponseDtos = customerMapper
			.customerDocumentsToCustomerDocumentResponseDtos(customerDocumentsPage.getContent());

		Boolean hasNext = customerDocumentsPage.getNumber() < customerDocumentsPage.getTotalPages() - 1;

		Boolean hasPrevious = customerDocumentsPage.getNumber() > 0;

		CustomerDocumentListResponseDto customerDocumentListResponse = new CustomerDocumentListResponseDto(
				customerDocumentResponseDtos, customerDocumentsPage.getTotalElements(),
				customerDocumentsPage.getTotalPages(), customerDocumentsPage.getNumber(),
				customerDocumentsPage.getSize(), hasNext, hasPrevious);

		return new ResponseEntityDto(false, customerDocumentListResponse);
	}

	@Override
	public ResponseEntity<?> downloadDocument(Long id) {

		Optional<CustomerDocument> optionalCustomerDocument = customerDocumentDao.findById(id);

		if (optionalCustomerDocument.isEmpty()) {
			throw new EntityNotFoundException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_DOCUMENT_NOT_FOUND);
		}

		CustomerDocument customerDocument = optionalCustomerDocument.get();
		String documentUrl = customerDocument.getDocumentUrl();

		try (InputStream imageStream = amazonS3Service.downloadFile(bucketName, bucketName + "/" + documentUrl);
				ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

			imageStream.transferTo(outputStream);
			byte[] response = outputStream.toByteArray();

			if (response.length == 0) {
				log.error("customerDocument: No data found in the document: {}", documentUrl);

				throw new ModuleException(InvoiceMessageConstant.INVOICE_ERROR_FAILED_TO_LOAD_CUSTOMER_DOCUMENT,
						new String[] { documentUrl });
			}

			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
			headers.setContentDisposition(
					ContentDisposition.attachment().filename(customerDocument.getName() + ".pdf").build());
			headers.setContentLength(response.length);

			return new ResponseEntity<>(response, headers, HttpStatus.OK);
		}
		catch (Exception e) {
			log.error("customerDocument: Failed to download customer document: {}", documentUrl, e);
			throw new ModuleException(InvoiceMessageConstant.INVOICE_ERROR_FAILED_TO_LOAD_CUSTOMER_DOCUMENT,
					new String[] { documentUrl });
		}
	}

	@Override
	public ResponseEntityDto renameDocument(CustomerDocumentRenameRequestDto customerDocumentRenameRequestDto) {

		Optional<CustomerDocument> optionalCustomerDocument = customerDocumentDao
			.findById(customerDocumentRenameRequestDto.getDocumentId());

		if (optionalCustomerDocument.isEmpty()) {
			throw new EntityNotFoundException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_DOCUMENT_NOT_FOUND);
		}

		CustomerDocument customerDocument = optionalCustomerDocument.get();
		customerDocument.setName(customerDocumentRenameRequestDto.getNewName());

		CustomerDocument savedCustomerDocument = customerDocumentDao.save(customerDocument);

		CustomerDocumentRenameResponseDto customerDocumentRenameResponseDto = customerMapper
			.customerDocumentToCustomerDocumentRenameResponseDto(savedCustomerDocument);

		return new ResponseEntityDto(false, customerDocumentRenameResponseDto);
	}

	@Override
	public ResponseEntityDto deleteDocument(Long id) {

		Optional<CustomerDocument> optionalCustomerDocument = customerDocumentDao.findById(id);

		if (optionalCustomerDocument.isEmpty()) {
			throw new EntityNotFoundException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_DOCUMENT_NOT_FOUND);
		}

		CustomerDocument customerDocument = optionalCustomerDocument.get();

		customerDocument.setDocumentStatus(DocumentStatus.DELETED);
		customerDocumentDao.save(customerDocument);

		AmazonS3DeleteItemRequestDto amazonS3DeleteItemRequestDto = new AmazonS3DeleteItemRequestDto();
		amazonS3DeleteItemRequestDto.setFolderPath(optionalCustomerDocument.get().getDocumentUrl());

		amazonS3Service.deleteFileFromS3(amazonS3DeleteItemRequestDto);

		return new ResponseEntityDto(false, "File deleted successfully");
	}

}
