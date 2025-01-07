package com.skapp.enterprise.common.mapper;

import com.skapp.community.common.payload.request.SuperAdminSignUpRequestDto;
import com.skapp.enterprise.common.model.DeviceToken;
import com.skapp.enterprise.common.model.EpOrganization;
import com.skapp.enterprise.common.model.master.SuperAdmin;
import com.skapp.enterprise.common.payload.request.EpOrganizationDto;
import com.skapp.enterprise.common.payload.request.EpSignUpGoogleDataDto;
import com.skapp.enterprise.common.payload.response.DeviceTokenResponseDto;
import com.skapp.enterprise.common.payload.response.EpOrganizationResponseDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface EpCommonMapper {

	EpOrganization epOrganizationDtoToEPOrganization(EpOrganizationDto organizationDto);

	EpOrganizationResponseDto epOrganizationToEpOrganizationResponseDto(EpOrganization epOrganization);

	SuperAdmin createSuperAdminRequestDtoToSuperAdmin(SuperAdminSignUpRequestDto superAdminSignUpRequestDto);

	SuperAdmin createEpGoogleDataDtoToSuperAdmin(EpSignUpGoogleDataDto epSignUpGoogleDataDto);

	DeviceTokenResponseDto deviceTokenToDeviceTokenResponse(DeviceToken deviceToken);

}
