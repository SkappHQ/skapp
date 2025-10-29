package com.skapp.community.peopleplanner.service.impl;

import com.skapp.community.common.constant.ValidationConstant;
import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.peopleplanner.constant.PeopleMessageConstant;
import com.skapp.community.peopleplanner.mapper.PeopleMapper;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.JobFamily;
import com.skapp.community.peopleplanner.model.JobFamilyTitle;
import com.skapp.community.peopleplanner.model.JobTitle;
import com.skapp.community.peopleplanner.payload.request.JobFamilyDto;
import com.skapp.community.peopleplanner.payload.request.JobTitleDto;
import com.skapp.community.peopleplanner.payload.request.TransferJobFamilyRequestDto;
import com.skapp.community.peopleplanner.payload.request.TransferJobTitleRequestDto;
import com.skapp.community.peopleplanner.payload.request.UpdateJobFamilyRequestDto;
import com.skapp.community.peopleplanner.payload.response.JobFamilyResponseDetailDto;
import com.skapp.community.peopleplanner.payload.response.JobFamilyResponseDto;
import com.skapp.community.peopleplanner.payload.response.JobTitleResponseDetailDto;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.JobFamilyDao;
import com.skapp.community.peopleplanner.repository.JobFamilyTitleDao;
import com.skapp.community.peopleplanner.repository.JobTitleDao;
import com.skapp.community.peopleplanner.service.JobService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

	private final JobFamilyDao jobFamilyDao;

	private final JobTitleDao jobTitleDao;

	private final JobFamilyTitleDao jobFamilyTitleDao;

	private final EmployeeDao employeeDao;

	private final PeopleMapper peopleMapper;

	private final MessageUtil messageUtil;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getAllJobFamilies() {
		log.info("getAllJobFamilies: execution started");

		List<JobFamily> jobFamilies = jobFamilyDao.getJobFamiliesByEmployeeCount();
		for (JobFamily jobFamily : jobFamilies) {
			jobFamily.setJobTitles(filterActiveJobTitles(jobFamily.getJobTitles()));
		}

		List<JobFamilyResponseDetailDto> jobFamilyResponseDetailDtos = peopleMapper
			.jobFamilyListToJobFamilyResponseDetailDtoList(jobFamilies);

		log.info("getAllJobFamilies: execution ended");
		return new ResponseEntityDto(false, jobFamilyResponseDetailDtos);
	}

	@Override
	@Transactional
	public ResponseEntityDto getJobFamilyById(Long id) {
		log.info("getJobFamilyById: execution started");

		Optional<JobFamily> optionalJobFamily = jobFamilyDao.findById(id);
		if (optionalJobFamily.isEmpty() || !optionalJobFamily.get().isActive()) {
			throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_JOB_FAMILY_NOT_FOUND);
		}
		JobFamily jobFamily = optionalJobFamily.get();
		jobFamily.setJobTitles(filterActiveJobTitles(jobFamily.getJobTitles()));

		JobFamilyResponseDetailDto jobFamilyResponseDetailDto = peopleMapper
			.jobFamilyToJobFamilyResponseDetailDto(jobFamily);

		log.info("getJobFamilyById: execution ended");
		return new ResponseEntityDto(false, jobFamilyResponseDetailDto);
	}

	@Override
	@Transactional
	public ResponseEntityDto getJobTitleById(Long id) {
		log.info("getJobTitleById: execution started");

		Optional<JobTitle> optionalJobTitle = jobTitleDao.findById(id);
		if (optionalJobTitle.isEmpty()) {
			throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_JOB_TITLE_NOT_FOUND);
		}
		JobTitle jobTitle = optionalJobTitle.get();

		JobTitleResponseDetailDto jobTitleResponseDetailDto = peopleMapper
			.jobTitleToJobTitleResponseDetailDto(jobTitle);

		log.info("getJobTitleById: execution ended");
		return new ResponseEntityDto(false, jobTitleResponseDetailDto);
	}

	@Override
	public ResponseEntityDto addJobFamily(JobFamilyDto jobFamilyDto) {
		log.info("addJobFamily: execution started");

		if (jobFamilyDto.getTitles().isEmpty()) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_JOB_FAMILY_INSUFFICIENT_DATA);
		}

		if (!isJobFamilyNameORTitleNameValid(jobFamilyDto.getName())) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_JOB_FAMILY_AND_JOB_TITLE_NAME_INVALID);
		}

		jobFamilyDto.getTitles().forEach(this::isJobFamilyNameORTitleNameValid);

		JobFamily jobFamily = peopleMapper.jobFamilyDtoToJobFamily(jobFamilyDto);
		Set<JobTitle> jobTitles = getJobTitle(jobFamilyDto.getTitles());

		Set<JobTitle> activeJobTitles = filterActiveJobTitles(jobTitles);
		if (activeJobTitles.isEmpty()) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_NO_ACTIVE_JOB_TITLES);
		}

		jobFamily.setJobTitles(activeJobTitles);
		jobFamily = jobFamilyDao.save(jobFamily);

		JobFamilyResponseDto jobFamilyResponseDto = peopleMapper.jobFamilyToJobFamilyResponseDto(jobFamily);

		invalidateJobsCache();

		log.info("addJobFamily: execution ended");
		return new ResponseEntityDto(false, jobFamilyResponseDto);
	}

	@Override
	public ResponseEntityDto updateJobFamily(Long id, UpdateJobFamilyRequestDto updateJobFamilyRequestDto) {
		log.info("updateJobFamily: execution started");

		Optional<JobFamily> jobFamilyById = jobFamilyDao.findById(id);
		if (jobFamilyById.isEmpty() || !jobFamilyById.get().isActive()) {
			throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_JOB_FAMILY_NOT_FOUND);
		}
		JobFamily jobFamily = jobFamilyById.get();

		if (updateJobFamilyRequestDto.getName() != null
				&& isJobFamilyNameORTitleNameValid(updateJobFamilyRequestDto.getName())) {
			jobFamily.setName(updateJobFamilyRequestDto.getName());
		}

		List<JobTitle> newJobTitles = new ArrayList<>();
		HashMap<JobTitle, String> jobTitleNamePairs = new HashMap<>();

		if (updateJobFamilyRequestDto.getTitles() != null && !updateJobFamilyRequestDto.getTitles().isEmpty()) {
			updateJobFamilyRequestDto.getTitles()
				.stream()
				.map(JobTitleDto::getName)
				.forEach(this::isJobFamilyNameORTitleNameValid);

			updateJobFamilyRequestDto.getTitles().forEach(level -> {
				if (level.getJobTitleId() == null && !level.getName().isEmpty()) {
					JobTitle jobTitle = new JobTitle();
					jobTitle.setName(level.getName());
					if (Boolean.TRUE.equals(jobTitle.getIsActive())) {
						newJobTitles.add(jobTitle);
					}
				}
			});

			updateJobFamilyRequestDto.getTitles().removeIf(jobTitleDto -> jobTitleDto.getJobTitleId() == null);
			jobFamily.getJobTitles().forEach(jobTitle -> {
				Optional<JobTitleDto> containValueList = updateJobFamilyRequestDto.getTitles()
					.stream()
					.filter(data -> data.getJobTitleId().equals(jobTitle.getJobTitleId())
							&& !data.getName().equals(jobTitle.getName()))
					.findFirst();
				containValueList.ifPresent(jobTitleDto -> {
					if (Boolean.TRUE.equals(jobTitle.getIsActive())) {
						jobTitleNamePairs.put(jobTitle, jobTitle.getName());
						jobTitle.setName(jobTitleDto.getName());
					}
				});
			});

			if (!newJobTitles.isEmpty()) {
				jobFamily.getJobTitles().addAll(newJobTitles);
			}
		}

		jobFamily = jobFamilyDao.save(jobFamily);

		jobFamily.setJobTitles(filterActiveJobTitles(jobFamily.getJobTitles()));
		JobFamilyResponseDto jobFamilyResponseDto = peopleMapper.jobFamilyToJobFamilyResponseDto(jobFamily);

		invalidateJobsCache();

		log.info("updateJobFamily: execution ended");
		return new ResponseEntityDto(false, jobFamilyResponseDto);
	}

	@Override
	@Transactional
	public ResponseEntityDto transferJobFamily(Long id, List<TransferJobFamilyRequestDto> transferJobFamilyRequestDto) {
		log.info("transferJobFamily: execution started");

		if (transferJobFamilyRequestDto.isEmpty()) {
			throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_JOB_FAMILY_REQUEST_EMPTY);
		}

		Optional<JobFamily> optionalJobFamily = jobFamilyDao.findById(id);
		if (optionalJobFamily.isEmpty()) {
			throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_JOB_FAMILY_NOT_FOUND);
		}
		JobFamily jobFamily = optionalJobFamily.get();

		transferJobFamilyRequestDto.forEach(transfer -> {
			Optional<Employee> optionalEmployee = employeeDao.findById(transfer.getEmployeeId());
			Optional<JobFamily> optionalTransferJobFamily = jobFamilyDao.findById(transfer.getJobFamilyId());
			Optional<JobTitle> optionalTransferJobTitle = jobTitleDao.findById(transfer.getJobTitleId());

			if (optionalEmployee.isPresent() && optionalTransferJobFamily.isPresent()
					&& optionalTransferJobTitle.isPresent()) {
				Employee employee = optionalEmployee.get();
				JobFamily transferJobFamily = optionalTransferJobFamily.get();
				JobTitle transferJobTitle = optionalTransferJobTitle.get();
				if (jobFamily != transferJobFamily && transferJobFamily.getJobTitles().contains(transferJobTitle)) {
					employee.setJobFamily(transferJobFamily);
					employee.setJobTitle(transferJobTitle);
					employeeDao.save(employee);

				}
				else {
					throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_JOB_FAMILY_AND_JOB_TITLE_NOT_MATCH);
				}
			}
			else {
				throw new EntityNotFoundException(
						PeopleMessageConstant.PEOPLE_ERROR_JOB_FAMILY_AND_JOB_TITLE_NOT_MATCH);
			}
		});

		jobFamilyDao.save(jobFamily);

		log.info("transferJobFamily: execution ended");
		return new ResponseEntityDto(messageUtil.getMessage(PeopleMessageConstant.PEOPLE_SUCCESS_TRANSFER_JOB_FAMILY),
				false);
	}

	@Override
	@Transactional
	public ResponseEntityDto transferJobTitle(Long id, List<TransferJobTitleRequestDto> transferJobTitleRequestDto) {
		log.info("transferJobTitle: execution started");

		if (transferJobTitleRequestDto.isEmpty()) {
			throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_JOB_TITLE_REQUEST_EMPTY);
		}

		Optional<JobTitle> optionalJobTitle = jobTitleDao.findById(id);
		if (optionalJobTitle.isEmpty()) {
			throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_JOB_TITLE_NOT_FOUND);
		}
		JobTitle jobTitle = optionalJobTitle.get();

		transferEmployeeJobTitles(transferJobTitleRequestDto, jobTitle);
		jobTitleDao.save(jobTitle);

		log.info("transferJobTitle: execution ended");
		return new ResponseEntityDto(messageUtil.getMessage(PeopleMessageConstant.PEOPLE_SUCCESS_TRANSFER_JOB_TITLE),
				false);
	}

	@Override
	public ResponseEntityDto deleteJobTitle(Long id) {
		log.info("deleteJobTitle: execution started");

		Optional<JobTitle> optionalJobTitle = jobTitleDao.findById(id);
		if (optionalJobTitle.isEmpty() || !optionalJobTitle.get().getIsActive()) {
			throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_JOB_TITLE_NOT_FOUND);
		}
		JobTitle jobTitle = optionalJobTitle.get();

		List<Long> employeeIds = jobTitle.getEmployees().stream().map(Employee::getEmployeeId).sorted().toList();
		if (!employeeIds.isEmpty()) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_JOB_FAMILY_JOB_TITLE_EMPLOYEE_MISMATCH);
		}

		jobTitle.setIsActive(false);
		jobTitleDao.save(jobTitle);

		invalidateJobsCache();

		log.info("deleteJobTitle: execution ended");
		return new ResponseEntityDto(messageUtil.getMessage(PeopleMessageConstant.PEOPLE_SUCCESS_DELETE_JOB_TITLE),
				false);
	}

	@Override
	public ResponseEntityDto deleteJobFamily(Long id) {
		log.info("deleteJobFamily: execution started");

		Optional<JobFamily> optionalJobFamily = jobFamilyDao.findById(id);
		if (optionalJobFamily.isEmpty() || !optionalJobFamily.get().isActive()) {
			throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_JOB_FAMILY_NOT_FOUND);
		}
		JobFamily jobFamily = optionalJobFamily.get();

		List<Long> employeeIds = jobFamily.getEmployees().stream().map(Employee::getEmployeeId).sorted().toList();

		if (!employeeIds.isEmpty()) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_JOB_FAMILY_EMPLOYEE_MISMATCH);
		}

		List<JobFamilyTitle> jobFamilyTitles = jobFamily.getJobFamilyTitle();
		jobFamilyTitleDao.deleteAllInBatch(jobFamilyTitles);

		jobFamily.setActive(false);
		jobFamilyDao.save(jobFamily);

		invalidateJobsCache();

		log.info("deleteJobFamily: execution ended");
		return new ResponseEntityDto(messageUtil.getMessage(PeopleMessageConstant.PEOPLE_SUCCESS_DELETE_JOB_FAMILY),
				false);
	}

	protected void invalidateJobsCache() {
		// This method is a placeholder for enterprise cache invalidation logic
	}

	private boolean isJobFamilyNameORTitleNameValid(String roleOrLevel) {
		if (!roleOrLevel.matches(ValidationConstant.JOB_FAMILY_NAME_TITLE_REGEX)) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_JOB_FAMILY_AND_JOB_TITLE_NAME_INVALID);
		}
		return true;
	}

	private Set<JobTitle> getJobTitle(List<String> levels) {
		Set<JobTitle> jobTitles = new HashSet<>();
		levels.forEach(level -> {
			if (level != null && !level.isEmpty()) {
				JobTitle jobTitle = new JobTitle();
				jobTitle.setName(level);
				jobTitles.add(jobTitle);
			}
		});
		return jobTitles;
	}

	private void transferEmployeeJobTitles(List<TransferJobTitleRequestDto> transferJobTitleRequestDto,
			JobTitle jobTitle) {
		transferJobTitleRequestDto.forEach(transfer -> {
			Optional<Employee> optionalEmployee = employeeDao.findById(transfer.getEmployeeId());
			Optional<JobTitle> optionalJobTitle = jobTitleDao.findById(transfer.getJobTitleId());

			if (optionalEmployee.isPresent() && optionalJobTitle.isPresent()) {
				Employee employee = optionalEmployee.get();
				JobTitle transferJobTitle = optionalJobTitle.get();
				if (employee.getJobFamily().getJobTitles().contains(transferJobTitle) && jobTitle != transferJobTitle) {
					employee.setJobTitle(transferJobTitle);
					employeeDao.save(employee);
				}
				else {
					throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_JOB_FAMILY_AND_JOB_TITLE_NOT_MATCH);
				}

			}
			else {
				throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_JOB_TITLE_NOT_FOUND);
			}
		});
	}

	private Set<JobTitle> filterActiveJobTitles(Set<JobTitle> jobTitles) {
		return jobTitles.stream().filter(JobTitle::getIsActive).collect(Collectors.toSet());
	}

}
