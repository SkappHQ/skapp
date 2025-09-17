package com.skapp.enterprise.invoice.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.payload.request.CustomerDocumentCreateRequestDto;
import com.skapp.enterprise.invoice.payload.request.CustomerDocumentFilterDto;
import com.skapp.enterprise.invoice.service.CustomerDocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/ep/invoice/document")
public class CustomerDocumentController {

    private final CustomerDocumentService customerDocumentService;

    @PostMapping
    public ResponseEntity<ResponseEntityDto> saveDocument(@Valid @RequestBody CustomerDocumentCreateRequestDto requestDto) {
        ResponseEntityDto response = customerDocumentService.saveDocument(requestDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseEntityDto> getDocumentById(@PathVariable Long id) {
        ResponseEntityDto response = customerDocumentService.getDocumentById(id);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/filter")
    public ResponseEntity<ResponseEntityDto> filterDocuments(@RequestBody CustomerDocumentFilterDto filterDto) {
        ResponseEntityDto response = customerDocumentService.filterDocuments(filterDto);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseEntityDto> deleteDocumentById(@PathVariable Long id) {
        ResponseEntityDto response = customerDocumentService.deleteDocumentById(id);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
