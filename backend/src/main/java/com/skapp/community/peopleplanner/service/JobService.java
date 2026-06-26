package com.skapp.community.peopleplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.payload.request.JobFamilyDto;
import com.skapp.community.peopleplanner.payload.request.TransferJobFamilyRequestDto;
import com.skapp.community.peopleplanner.payload.request.TransferJobTitleRequestDto;
import com.skapp.community.peopleplanner.payload.request.UpdateJobFamilyRequestDto;

import java.util.List;

public interface JobService {

	ResponseEntityDto getAllJobFamilies();

	ResponseEntityDto getJobFamilyById(Long id);

	ResponseEntityDto getJobTitleById(Long id);

	ResponseEntityDto addJobFamily(JobFamilyDto jobFamilyDto);

	ResponseEntityDto updateJobFamily(Long id, UpdateJobFamilyRequestDto updateJobFamilyRequestDto);

	ResponseEntityDto transferJobFamily(Long id, List<TransferJobFamilyRequestDto> transferJobFamilyRequestDto);

	ResponseEntityDto transferJobTitle(Long id, List<TransferJobTitleRequestDto> transferJobTitleRequestDto);

	ResponseEntityDto deleteJobTitle(Long id);

	ResponseEntityDto deleteJobFamily(Long id);

}
