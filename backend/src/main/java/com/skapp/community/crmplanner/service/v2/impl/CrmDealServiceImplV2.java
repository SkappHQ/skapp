package com.skapp.community.crmplanner.service.v2.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.crmplanner.constant.CrmConstants;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.mapper.CrmMapperV2;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.payload.request.CrmDealCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealEditRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmTaskTypeResponseDto;
import com.skapp.community.crmplanner.payload.response.board.CrmBoardOwnerResponseDto;
import com.skapp.community.crmplanner.payload.response.board.CrmBoardStageResponseDto;
import com.skapp.community.crmplanner.payload.response.v2.CrmBoardContactResponseDtoV2;
import com.skapp.community.crmplanner.payload.response.v2.CrmBoardInitDataResponseDtoV2;
import com.skapp.community.crmplanner.payload.response.v2.CrmDealResponseDtoV2;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmContactOwnerRepository;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.repository.CrmDealStageDao;
import com.skapp.community.crmplanner.repository.CrmTaskTypeDao;
import com.skapp.community.crmplanner.service.CrmDealService;
import com.skapp.community.crmplanner.service.v2.CrmDealServiceV2;
import com.skapp.community.crmplanner.util.CrmUtil;
import com.skapp.community.crmplanner.util.CrmValidations;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmDealServiceImplV2 implements CrmDealServiceV2 {

	private final CrmDealService crmDealService;

	private final CrmDealDao crmDealDao;

	private final CrmDealStageDao crmDealStageDao;

	private final CrmContactDao crmContactDao;

	private final CrmContactOwnerRepository crmContactOwnerRepository;

	private final CrmTaskTypeDao crmTaskTypeDao;

	private final CrmMapper crmMapper;

	private final CrmMapperV2 crmMapperV2;

	private final UserService userService;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getBoardInitData() {
		log.info("getBoardInitData: execution started");

		List<CrmDealStage> visibleStages = filterVisibleDealStages(
				crmDealStageDao.findAllByIsDeletedFalseOrderByOrderIndexAsc());
		List<CrmBoardStageResponseDto> stages = crmMapper.crmDealStagesToCrmBoardStageResponseDtos(visibleStages);

		List<CrmBoardContactResponseDtoV2> contacts = crmContactDao.findAllContactsForBoardInit()
			.stream()
			.map(crmMapperV2::crmContactToCrmBoardContactResponseDtoV2)
			.toList();

		List<CrmBoardOwnerResponseDto> owners = crmContactOwnerRepository.findAllOwners()
			.stream()
			.map(o -> new CrmBoardOwnerResponseDto(o.getEmployeeId(), o.getFirstName(), o.getLastName(),
					o.getAuthPic()))
			.toList();

		List<CrmTaskTypeResponseDto> taskTypes = crmMapper
			.crmTaskTypesToCrmTaskTypeResponseDtos(crmTaskTypeDao.findAllByOrderByOrderIndexAscIdAsc());

		CrmBoardInitDataResponseDtoV2 responseDto = new CrmBoardInitDataResponseDtoV2();
		responseDto.setStages(stages);
		responseDto.setContacts(contacts);
		responseDto.setCrmRoles(CrmConstants.ASSIGNABLE_CRM_ROLES.stream().map(Enum::name).sorted().toList());
		responseDto.setOwners(owners);
		responseDto.setTaskTypes(taskTypes);

		log.info("getBoardInitData: execution ended");
		return new ResponseEntityDto(false, responseDto);
	}

	protected List<CrmDealStage> filterVisibleDealStages(List<CrmDealStage> stages) {
		return stages;
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getDeals(CrmDealFilterDto filterDto) {
		log.info("getDeals: execution started");

		User currentUser = userService.getCurrentUser();
		Long ownerId = CrmUtil.isCrmSalesRepresentative(currentUser) ? currentUser.getEmployee().getEmployeeId() : null;

		Page<CrmDealResponseDtoV2> dealsPage = crmDealDao.findDealsV2(filterDto, ownerId,
				PageRequest.of(filterDto.getPage(), filterDto.getSize()));

		PageDto pageDto = new PageDto();
		pageDto.setItems(dealsPage.getContent());
		pageDto.setCurrentPage(dealsPage.getNumber());
		pageDto.setTotalItems(dealsPage.getTotalElements());
		pageDto.setTotalPages(dealsPage.getTotalPages());

		log.info("getDeals: execution ended with {} result(s)", dealsPage.getNumberOfElements());
		return new ResponseEntityDto(false, pageDto);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getDealById(Long id) {
		log.info("getDealById: execution started");

		CrmDeal deal = crmDealDao.findByIdWithAssociations(id);
		if (deal == null) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_NOT_FOUND);
		}

		User currentUser = userService.getCurrentUser();
		if (CrmValidations.isOwnerRestrictedForRepresentative(currentUser, deal.getOwner().getEmployeeId())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_VIEW_DENIED);
		}

		log.info("getDealById: execution ended");
		return new ResponseEntityDto(false, CrmUtil.toDealResponseDtoV2(crmMapperV2, deal));
	}

	@Override
	@Transactional
	public ResponseEntityDto createDeal(CrmDealCreateRequestDto requestDto) {
		log.info("createDeal: execution started");

		CrmDeal savedDeal = crmDealService.persistNewDeal(requestDto);

		log.info("createDeal: execution ended");
		return new ResponseEntityDto(false, CrmUtil.toDealResponseDtoV2(crmMapperV2, savedDeal));
	}

	@Override
	@Transactional
	public ResponseEntityDto editDeal(Long id, CrmDealEditRequestDto requestDto) {
		log.info("editDeal: execution started");

		CrmDeal savedDeal = crmDealService.applyDealEdit(id, requestDto);

		log.info("editDeal: execution ended");
		return new ResponseEntityDto(false, CrmUtil.toDealResponseDtoV2(crmMapperV2, savedDeal));
	}

}
