package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.transformer.PageTransformer;
import com.skapp.community.crmplanner.constant.CrmConstants;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.payload.request.CrmDealCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmDealResponseDto;
import com.skapp.community.crmplanner.payload.response.board.CrmBoardContactResponseDto;
import com.skapp.community.crmplanner.payload.response.board.CrmBoardInitDataResponseDto;
import com.skapp.community.crmplanner.payload.response.board.CrmBoardOwnerResponseDto;
import com.skapp.community.crmplanner.payload.response.board.CrmBoardStageResponseDto;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmContactOwnerRepository;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.repository.CrmDealStageDao;
import com.skapp.community.crmplanner.service.CrmDealService;
import com.skapp.community.crmplanner.util.CrmOwnerResolver;
import com.skapp.community.crmplanner.util.CrmValidations;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmDealServiceImpl implements CrmDealService {

	private final CrmDealDao crmDealDao;

	private final CrmDealStageDao crmDealStageDao;

	private final CrmCompanyDao crmCompanyDao;

	private final CrmContactDao crmContactDao;

	private final EmployeeDao employeeDao;

	private final CrmContactOwnerRepository crmContactOwnerRepository;

	private final CrmMapper crmMapper;

	private final UserService userService;

	private final PageTransformer pageTransformer;

	@Override
	@Transactional
	public ResponseEntityDto createDeal(CrmDealCreateRequestDto requestDto) {
		log.info("createDeal: creating deal with name={}", requestDto.getName());

		CrmValidations.validateDealName(requestDto.getName());
		CrmValidations.validateDealDescription(requestDto.getDescription());
		CrmValidations.validateDealAmount(requestDto.getAmount());
		CrmValidations.validateDealPriority(requestDto.getPriority());
		CrmValidations.validateDealStageId(requestDto.getStageId());
		CrmValidations.validateDealContactId(requestDto.getContactId());
		CrmValidations.validateDealOwnerId(requestDto.getOwnerId());

		User currentUser = userService.getCurrentUser();

		CrmDealStage stage = crmDealStageDao.findByIdAndIsDeletedFalse(requestDto.getStageId())
			.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_NOT_FOUND));

		CrmContact contact = crmContactDao.findByIdAndIsDeletedFalse(requestDto.getContactId())
			.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_CONTACT_NOT_FOUND));

		CrmCompany company = null;
		if (contact.getCompany() != null) {
			company = crmCompanyDao.findByIdAndIsDeletedFalse(contact.getCompany().getId()).orElse(null);
		}

		Employee owner = CrmOwnerResolver.resolveOwner(requestDto.getOwnerId(), currentUser, employeeDao);

		CrmDeal deal = new CrmDeal();
		deal.setName(requestDto.getName());
		deal.setDescription(requestDto.getDescription());
		deal.setStage(stage);
		deal.setPriority(requestDto.getPriority());
		deal.setClosingAt(requestDto.getClosingAt());
		deal.setAmount(requestDto.getAmount());
		deal.setCompany(company);
		deal.setContact(contact);
		deal.setOwner(owner);

		CrmDeal savedDeal = crmDealDao.save(deal);
		CrmDealResponseDto responseDto = crmMapper.crmDealToCrmDealResponseDto(savedDeal);

		log.info("createDeal: deal created with id={}", savedDeal.getId());
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getDeals(CrmDealFilterDto filterDto) {
		log.info("getDeals: execution started");

		Sort sort = Sort.by(filterDto.getSortOrder(), filterDto.getSortKey().getSortField());
		Page<CrmDeal> dealsPage = crmDealDao.findDeals(filterDto,
				PageRequest.of(filterDto.getPage(), filterDto.getSize(), sort));

		List<CrmDealResponseDto> deals = crmMapper.crmDealsToCrmDealResponseDtos(dealsPage.getContent());

		PageDto pageDto = pageTransformer.transform(dealsPage);
		pageDto.setItems(deals);

		log.info("getDeals: execution ended with {} result(s)", deals.size());
		return new ResponseEntityDto(false, pageDto);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getBoardInitData() {
		log.info("getBoardInitData: execution started");

		List<CrmBoardStageResponseDto> stages = crmMapper
			.crmDealStagesToCrmBoardStageResponseDtos(crmDealStageDao.findAllByIsDeletedFalseOrderByOrderIndexAsc());

		List<CrmBoardContactResponseDto> contacts = crmMapper
			.crmContactsToCrmBoardContactResponseDtos(crmContactDao.findAllContactsForBoardInit());

		List<CrmBoardOwnerResponseDto> owners = crmContactOwnerRepository.findAllOwners()
			.stream()
			.map(o -> new CrmBoardOwnerResponseDto(o.getEmployeeId(), o.getFirstName(), o.getLastName(),
					o.getAuthPic()))
			.toList();

		CrmBoardInitDataResponseDto responseDto = new CrmBoardInitDataResponseDto();
		responseDto.setStages(stages);
		responseDto.setContacts(contacts);
		responseDto.setCrmRoles(CrmConstants.ASSIGNABLE_CRM_ROLES.stream().map(Enum::name).sorted().toList());
		responseDto.setOwners(owners);

		log.info("getBoardInitData: execution ended");
		return new ResponseEntityDto(false, responseDto);
	}

}
