package com.skapp.enterprise.invoice.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.constant.InvoiceMessageConstant;
import com.skapp.enterprise.invoice.mapper.CustomerMapper;
import com.skapp.enterprise.invoice.model.Customer;
import com.skapp.enterprise.invoice.model.CustomerDocument;
import com.skapp.enterprise.invoice.payload.request.CustomerDocumentCreateRequestDto;
import com.skapp.enterprise.invoice.payload.request.CustomerDocumentFilterDto;
import com.skapp.enterprise.invoice.payload.response.CustomerDocumentListResponseDto;
import com.skapp.enterprise.invoice.payload.response.CustomerDocumentResponseDto;
import com.skapp.enterprise.invoice.repository.CustomerDao;
import com.skapp.enterprise.invoice.repository.CustomerDocumentDao;
import com.skapp.enterprise.invoice.service.CustomerDocumentService;
import com.skapp.enterprise.invoice.service.CustomerValidationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

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
		String sortBy = filterDto.getSortBy();
		String sortDirection = filterDto.getSortDirection();

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

}
