package com.skapp.enterprise.esignature.payload.request;

import com.skapp.enterprise.esignature.type.AddressBookSort;
import com.skapp.enterprise.esignature.type.UserType;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

import java.util.List;

@Getter
@Setter
public class AddressBookFilterDto {

	@Min(0)
	private int page = 0;

	@Min(1)
	private int size = 7;

	private Sort.Direction sortOrder = Sort.Direction.ASC;

	private AddressBookSort sortKey = AddressBookSort.NAME;

	private String searchKeyword;

	private List<UserType> userType;

}
