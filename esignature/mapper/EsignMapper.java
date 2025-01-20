package com.skapp.enterprise.esignature.mapper;

import com.skapp.community.common.model.User;
import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.model.ExternalUser;
import com.skapp.enterprise.esignature.payload.request.ExternalUserDto;
import com.skapp.enterprise.esignature.payload.response.AddressBookResponseDto;
import com.skapp.enterprise.esignature.payload.response.ExternalUserResponseDto;
import com.skapp.enterprise.esignature.payload.response.InternalUserResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface EsignMapper {

	ExternalUser externalUserDtoToExternalUser(ExternalUserDto externalUserDto);

	@Named("externalUserToExternalUserResponseDto")
	@Mapping(source = "externalUser.id", target = "userId")
	ExternalUserResponseDto externalUserToExternalUserResponseDto(ExternalUser externalUser);

	@Named("userToInternalUserResponseDto")
	@Mapping(source = "user.employee.firstName", target = "firstName")
	@Mapping(source = "user.employee.lastName", target = "lastName")
	@Mapping(source = "user.employee.phone", target = "phone")
	@Mapping(source = "user.userId", target = "userId")
	@Mapping(source = "user.email", target = "email")
	InternalUserResponseDto userToInternalUserResponseDto(User user);

	@Mapping(source = "internalUser", target = "internalUserResponseDto",
			qualifiedByName = "userToInternalUserResponseDto")
	@Mapping(source = "externalUser", target = "externalUserResponseDto",
			qualifiedByName = "externalUserToExternalUserResponseDto")
	AddressBookResponseDto addressBookToAddressBookResponseDto(AddressBook addressBook);

}
