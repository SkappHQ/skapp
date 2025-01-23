package com.skapp.enterprise.esignature.repository;

import com.skapp.community.common.payload.response.PageDto;
import com.skapp.enterprise.esignature.payload.request.AddressBookFilterDto;
import org.springframework.stereotype.Repository;

@Repository
public interface AddressBookRepository {

	PageDto fetchAddressBookWithPaginationAndSorting(AddressBookFilterDto addressBookFilterDto);

}
