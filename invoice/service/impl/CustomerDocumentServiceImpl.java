package com.skapp.enterprise.invoice.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.constant.InvoiceMessageConstant;
import com.skapp.enterprise.invoice.mapper.CustomerDocumentMapper;
import com.skapp.enterprise.invoice.model.Customer;
import com.skapp.enterprise.invoice.model.CustomerDocument;
import com.skapp.enterprise.invoice.model.Invoice;
import com.skapp.enterprise.invoice.payload.request.CustomerDocumentCreateRequestDto;
import com.skapp.enterprise.invoice.payload.request.CustomerDocumentFilterDto;
import com.skapp.enterprise.invoice.payload.response.CustomerDocumentResponseDto;
import com.skapp.enterprise.invoice.payload.response.InvoiceListResponseDto;
import com.skapp.enterprise.invoice.payload.response.InvoiceResponseDto;
import com.skapp.enterprise.invoice.repository.CustomerDao;
import com.skapp.enterprise.invoice.repository.CustomerDocumentRepository;
import com.skapp.enterprise.invoice.service.CustomerDocumentService;
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

    private final CustomerDocumentRepository customerDocumentRepository;
    private final CustomerDao customerDao;
    private final CustomerDocumentMapper customerDocumentMapper;

    @Override
    @Transactional
    public ResponseEntityDto saveDocument(CustomerDocumentCreateRequestDto requestDto) {

        Optional<Customer> customer = customerDao.findById(requestDto.getCustomerId());

        if (customer.isEmpty()) {
            return null;
        }

        CustomerDocument customerDocument = customerDocumentMapper
                .customerDocumentCreateRequestDtoToCustomerDocument(requestDto);
        customerDocument.setCustomer(customer.get());

        CustomerDocument savedDocument = customerDocumentRepository.save(customerDocument);
        CustomerDocumentResponseDto responseDto = customerDocumentMapper
                .customerDocumentToCustomerDocumentResponseDto(savedDocument);

        return new ResponseEntityDto(false, responseDto);
    }

    @Override
    public ResponseEntityDto getDocumentById(Long id) {

        Optional<CustomerDocument> customerDocument = customerDocumentRepository.findById(id);

        if (customerDocument.isEmpty()) {
            return null;
        }

        CustomerDocumentResponseDto responseDto = customerDocumentMapper
                .customerDocumentToCustomerDocumentResponseDto(customerDocument.get());

        return new ResponseEntityDto(false, responseDto);
    }

    @Override
    public ResponseEntityDto filterDocuments(CustomerDocumentFilterDto filterDto) {

        int page = filterDto.getPage();
        int size = filterDto.getSize();
        String sortBy = filterDto.getSortBy();
        String sortDirection = filterDto.getSortDirection();

        Sort.Direction direction = Sort.Direction.fromString(sortDirection.toUpperCase());
        Sort sort = Sort.by(direction, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<CustomerDocument> customerDocuments = customerDocumentRepository.findFilteredDocuments(filterDto.getCustomerId(),filterDto.getName(), pageable);

        List<InvoiceResponseDto> invoiceResponseDtos = customerDocumentMapper
                .(customerDocuments.getContent());

        Boolean hasNext = invoicePage.getNumber() < invoicePage.getTotalPages() - 1;

        Boolean hasPrevious = invoicePage.getNumber() > 0;

        InvoiceListResponseDto invoiceListResponse = new InvoiceListResponseDto(invoiceResponseDtos,
                invoicePage.getTotalElements(), invoicePage.getTotalPages(), invoicePage.getNumber(),
                invoicePage.getSize(), hasNext, hasPrevious);

        return new ResponseEntityDto(false, invoiceListResponse);
    }

    @Override
    @Transactional
    public ResponseEntityDto deleteDocumentById(Long id) {

        CustomerDocument customerDocument = customerDocumentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer document not found with ID: " + id));

        customerDocumentRepository.delete(customerDocument);

        return new ResponseEntityDto(false, "Customer document deleted successfully");
    }
}
