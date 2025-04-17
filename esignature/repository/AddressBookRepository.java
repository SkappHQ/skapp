package com.skapp.enterprise.esignature.repository;

import com.skapp.community.common.payload.response.PageDto;
import com.skapp.enterprise.esignature.payload.request.AddressBookFilterDto;
import com.skapp.enterprise.esignature.repository.projection.AddressBookUserData;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AddressBookRepository {

	PageDto fetchAddressBookWithPaginationAndSorting(AddressBookFilterDto addressBookFilterDto);

	List<AddressBookUserData> fetchAddressBookContactsByEmailPriority(String keyword);

	List<AddressBookUserData> fetchAddressBookEsignSenderByEmailPriority(String keyword);

}
