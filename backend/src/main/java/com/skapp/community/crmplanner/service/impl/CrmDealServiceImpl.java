package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.FractionalIndexUtil;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.common.util.transformer.PageTransformer;
import com.skapp.community.crmplanner.constant.CrmConstants;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.payload.request.CrmDealCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealEditRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmDealUpdateStageRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealReorderRequestDto;
import com.skapp.community.crmplanner.payload.request.board.CrmDealsByStagesRequestDto;
import com.skapp.community.crmplanner.payload.response.CrmNameExistsResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmDealResponseDto;
import com.skapp.community.crmplanner.payload.response.board.CrmBoardContactResponseDto;
import com.skapp.community.crmplanner.payload.response.board.CrmBoardInitDataResponseDto;
import com.skapp.community.crmplanner.payload.response.board.CrmBoardOwnerResponseDto;
import com.skapp.community.crmplanner.payload.response.board.CrmBoardStageResponseDto;
import com.skapp.community.crmplanner.payload.response.board.CrmDealByStageItemResponseDto;
import com.skapp.community.crmplanner.payload.response.board.CrmDealsByStageResponseDto;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmContactOwnerRepository;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.repository.CrmDealStageDao;
import com.skapp.community.crmplanner.repository.CrmTaskDao;
import com.skapp.community.crmplanner.service.CrmDealService;
import com.skapp.community.crmplanner.service.CrmOwnerResolverService;
import com.skapp.community.crmplanner.util.CrmUtil;
import com.skapp.community.crmplanner.util.CrmValidations;
import com.skapp.community.peopleplanner.model.Employee;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmDealServiceImpl implements CrmDealService {

	private final CrmDealDao crmDealDao;

	private final CrmDealStageDao crmDealStageDao;

	private final CrmCompanyDao crmCompanyDao;

	private final CrmContactDao crmContactDao;

	private final CrmContactOwnerRepository crmContactOwnerRepository;

	private final CrmMapper crmMapper;

	private final PageTransformer pageTransformer;

	private final UserService userService;

	private final CrmOwnerResolverService crmOwnerResolver;

	private final CrmTaskDao crmTaskDao;

	private final MessageUtil messageUtil;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto checkDealNameExists(String name) {
		log.info("checkDealNameExists: execution started");
		CrmValidations.validateDealName(name);
		boolean exists = crmDealDao.existsByNameAndIsDeletedFalse(name);

		CrmNameExistsResponseDto responseDto = new CrmNameExistsResponseDto();
		responseDto.setIsExists(exists);

		log.info("checkDealNameExists: execution ended");
		return new ResponseEntityDto(false, responseDto);
	}

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
		validateDealCreationLimit();

		User currentUser = userService.getCurrentUser();

		if (crmDealDao.existsByNameAndContact_IdAndIsDeletedFalse(requestDto.getName(), requestDto.getContactId())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_EXISTS);
		}

		CrmDealStage stage = crmDealStageDao.findByIdAndIsDeletedFalse(requestDto.getStageId())
			.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_NOT_FOUND));
		validateDealStageAccess(stage);

		CrmContact contact = crmContactDao.findByIdAndIsDeletedFalse(requestDto.getContactId())
			.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_CONTACT_NOT_FOUND));

		CrmCompany company = null;
		if (contact.getCompany() != null) {
			company = crmCompanyDao.findByIdAndIsDeletedFalse(contact.getCompany().getId()).orElse(null);
		}

		Employee owner = crmOwnerResolver.resolveOwner(requestDto.getOwnerId(), currentUser);

		CrmDeal deal = new CrmDeal();
		deal.setName(requestDto.getName());
		deal.setDescription(requestDto.getDescription());
		deal.setStage(stage);
		deal.setPriority(requestDto.getPriority());
		String lastOrderIndex = crmDealDao.findMaxOrderIndexByStageId(stage.getId());
		deal.setOrderIndex(FractionalIndexUtil.generateKeyBetween(lastOrderIndex, null));
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

	protected void validateDealCreationLimit() {
		// This method is a placeholder for enterprise deal creation limit validation
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getDeals(CrmDealFilterDto filterDto) {
		log.info("getDeals: execution started");

		Page<CrmDeal> dealsPage = crmDealDao.findDeals(filterDto,
				PageRequest.of(filterDto.getPage(), filterDto.getSize()));

		List<CrmDealResponseDto> deals = dealsPage.getContent().stream().map(this::toDealResponseDto).toList();

		PageDto pageDto = pageTransformer.transform(dealsPage);
		pageDto.setItems(deals);

		log.info("getDeals: execution ended with {} result(s)", deals.size());
		return new ResponseEntityDto(false, pageDto);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getDealsByStages(CrmDealsByStagesRequestDto requestDto) {
		log.info("getDealsByStages: execution started for {} stage(s)",
				requestDto.getStageIds() != null ? requestDto.getStageIds().size() : 0);

		if (requestDto.getStageIds() == null || requestDto.getStageIds().isEmpty()) {
			return new ResponseEntityDto(false, new ArrayList<>());
		}

		List<Long> uniqueStageIds = new ArrayList<>(new LinkedHashSet<>(requestDto.getStageIds()));

		List<CrmDealStage> stages = filterVisibleDealStages(
				crmDealStageDao.findAllByIdInAndIsDeletedFalse(uniqueStageIds));
		if (stages.size() != uniqueStageIds.size()) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_NOT_FOUND);
		}

		int limit = requestDto.getLimit() > 0 ? requestDto.getLimit() : CrmConstants.DEALS_PER_STAGE_LIMIT;
		Integer requestedPage = requestDto.getPage();
		int page = (requestedPage != null && requestedPage >= 0 && uniqueStageIds.size() == 1) ? requestedPage : 0;
		PageRequest pageRequest = PageRequest.of(page, limit);

		Map<Long, Long> stageCounts = crmDealDao.countDealsByStageIds(uniqueStageIds, requestDto);

		Map<Long, Page<CrmDeal>> dealPagesByStage = new LinkedHashMap<>();
		for (Long stageId : uniqueStageIds) {
			long totalCount = stageCounts.getOrDefault(stageId, 0L);
			dealPagesByStage.put(stageId, crmDealDao.findDealsByStageId(stageId, requestDto, pageRequest, totalCount));
		}

		List<Long> allDealIds = dealPagesByStage.values()
			.stream()
			.flatMap(p -> p.getContent().stream())
			.map(CrmDeal::getId)
			.toList();
		Map<Long, Long> taskCountMap = crmTaskDao.countTasksByDealIds(allDealIds);

		List<CrmDealsByStageResponseDto> result = uniqueStageIds.stream().map(stageId -> {
			Page<CrmDeal> dealsPage = dealPagesByStage.get(stageId);

			List<CrmDealByStageItemResponseDto> deals = dealsPage.getContent()
				.stream()
				.map(deal -> toStageItemDto(deal, taskCountMap))
				.toList();

			CrmDealsByStageResponseDto stageResult = new CrmDealsByStageResponseDto();
			stageResult.setStageId(stageId);
			stageResult.setTotalCount(dealsPage.getTotalElements());
			stageResult.setCurrentPage(dealsPage.getNumber());
			stageResult.setTotalPages(dealsPage.getTotalPages());
			stageResult.setPageSize(dealsPage.getSize());
			stageResult.setHasNextPage(dealsPage.hasNext());
			stageResult.setDeals(deals);
			return stageResult;
		}).toList();

		log.info("getDealsByStages: execution ended");
		return new ResponseEntityDto(false, result);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getBoardInitData() {
		log.info("getBoardInitData: execution started");

		List<CrmDealStage> visibleStages = filterVisibleDealStages(
				crmDealStageDao.findAllByIsDeletedFalseOrderByOrderIndexAsc());
		List<CrmBoardStageResponseDto> stages = crmMapper.crmDealStagesToCrmBoardStageResponseDtos(visibleStages);

		List<CrmBoardContactResponseDto> contacts = crmContactDao.findAllContactsForBoardInit()
			.stream()
			.map(this::toBoardContactDto)
			.toList();

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

	private CrmBoardContactResponseDto toBoardContactDto(CrmContact contact) {
		return CrmUtil.toBoardContactDto(crmMapper, contact);
	}

	private CrmDealResponseDto toDealResponseDto(CrmDeal deal) {
		return CrmUtil.toDealResponseDto(crmMapper, deal);
	}

	private CrmDealByStageItemResponseDto toStageItemDto(CrmDeal deal, Map<Long, Long> taskCountMap) {
		CrmDealByStageItemResponseDto dto = CrmUtil.toDealByStageItemDto(crmMapper, deal);
		dto.setTaskCount(taskCountMap.getOrDefault(deal.getId(), 0L));
		return dto;
	}

	@Override
	@Transactional
	public ResponseEntityDto reorderDeal(CrmDealReorderRequestDto requestDto) {
		log.info("reorderDeal: reordering deal with id={}", requestDto.getDealId());
		if (requestDto.getDealId() == null) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_ID_REQUIRED);
		}
		if (requestDto.getPreviousDealId() == null && requestDto.getNextDealId() == null) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_ORDER_NEIGHBOURS_REQUIRED);
		}

		CrmDeal deal = crmDealDao.findByIdAndIsDeletedFalse(requestDto.getDealId())
			.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_NOT_FOUND));

		User currentUser = userService.getCurrentUser();
		if (CrmValidations.isOwnerRestrictedForRepresentative(currentUser, deal.getOwner().getEmployeeId())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_EDIT_DENIED);
		}

		String newOrderIndex = generateOrderIndex(deal.getId(), deal.getStage().getId(), requestDto.getPreviousDealId(),
				requestDto.getNextDealId());
		deal.setOrderIndex(newOrderIndex);

		CrmDeal savedDeal = crmDealDao.save(deal);
		CrmDealResponseDto responseDto = crmMapper.crmDealToCrmDealResponseDto(savedDeal);

		log.info("reorderDeal: deal reordered with id={}, new orderIndex={}", savedDeal.getId(), newOrderIndex);
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	@Transactional
	public ResponseEntityDto updateDealStage(CrmDealUpdateStageRequestDto requestDto) {
		log.info("updateDealStage: execution started");

		CrmDeal deal = crmDealDao.findByIdAndIsDeletedFalse(requestDto.getDealId())
			.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_NOT_FOUND));

		User currentUser = userService.getCurrentUser();
		if (CrmValidations.isOwnerRestrictedForRepresentative(currentUser, deal.getOwner().getEmployeeId())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_EDIT_DENIED);
		}

		if (requestDto.getDealId() == null) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_ID_REQUIRED);
		}

		if (requestDto.getNewStageId() == null) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_ID_REQUIRED);
		}

		CrmDealStage newStage = crmDealStageDao.findByIdAndIsDeletedFalse(requestDto.getNewStageId())
			.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_NOT_FOUND));
		validateDealStageAccess(newStage);

		if (deal.getStage().getId().equals(newStage.getId())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_ALREADY_IN_STAGE);
		}

		String newOrderIndex = generateOrderIndex(deal.getId(), newStage.getId(), requestDto.getPreviousDealId(),
				requestDto.getNextDealId());

		deal.setStage(newStage);
		deal.setOrderIndex(newOrderIndex);

		CrmDeal savedDeal = crmDealDao.save(deal);
		CrmDealResponseDto responseDto = crmMapper.crmDealToCrmDealResponseDto(savedDeal);

		log.info("updateDealStage: execution ended");
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getDealById(Long id) {
		log.info("getDealById: execution started", id);

		CrmDeal deal = crmDealDao.findByIdWithAssociations(id);
		if (deal == null) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_NOT_FOUND);
		}

		log.info("getDealById: execution ended", id);
		return new ResponseEntityDto(false, crmMapper.crmDealToCrmDealResponseDto(deal));
	}

	private String generateOrderIndex(Long dealId, Long stageId, Long previousDealId, Long nextDealId) {
		if (dealId.equals(previousDealId) || dealId.equals(nextDealId)) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_INVALID_NEIGHBOUR);
		}

		String previousOrderIndex = null;
		if (previousDealId != null) {
			CrmDeal previousDeal = crmDealDao.findByIdAndIsDeletedFalse(previousDealId)
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_NOT_FOUND));
			if (!stageId.equals(previousDeal.getStage().getId())) {
				throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_NEIGHBOUR_STAGE_MISMATCH);
			}
			previousOrderIndex = previousDeal.getOrderIndex();
		}

		String nextOrderIndex = null;
		if (nextDealId != null) {
			CrmDeal nextDeal = crmDealDao.findByIdAndIsDeletedFalse(nextDealId)
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_NOT_FOUND));
			if (!stageId.equals(nextDeal.getStage().getId())) {
				throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_NEIGHBOUR_STAGE_MISMATCH);
			}
			nextOrderIndex = nextDeal.getOrderIndex();
		}

		if (previousDealId == null && nextDealId == null) {
			String existingOrderIndex = crmDealDao.findMaxOrderIndexByStageId(stageId);
			if (existingOrderIndex != null) {
				throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_ORDER_NEIGHBOURS_REQUIRED);
			}
			return FractionalIndexUtil.generateKeyBetween(null, null);
		}

		return FractionalIndexUtil.generateKeyBetween(previousOrderIndex, nextOrderIndex);
	}

	protected List<CrmDealStage> filterVisibleDealStages(List<CrmDealStage> stages) {
		return stages;
	}

	protected void validateDealStageAccess(CrmDealStage stage) {
		// This method is a placeholder for enterprise deal stage access validation
	}

	@Override
	@Transactional
	public ResponseEntityDto editDeal(Long id, CrmDealEditRequestDto requestDto) {
		log.info("editDeal: execution started");

		CrmDeal deal = crmDealDao.findByIdAndIsDeletedFalse(id)
			.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_NOT_FOUND));

		User currentUser = userService.getCurrentUser();
		if (CrmValidations.isOwnerRestrictedForRepresentative(currentUser, deal.getOwner().getEmployeeId())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_EDIT_DENIED);
		}

		if (requestDto.getName() != null && !requestDto.getName().equals(deal.getName())) {
			CrmValidations.validateDealName(requestDto.getName());
			Long effectiveContactId = (requestDto.getContactId() != null) ? requestDto.getContactId()
					: deal.getContact().getId();
			if (crmDealDao.existsByNameAndContact_IdAndIsDeletedFalseAndIdNot(requestDto.getName(), effectiveContactId,
					deal.getId())) {
				throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_EXISTS);
			}
			deal.setName(requestDto.getName());
		}

		if (requestDto.getAmount() != null) {
			CrmValidations.validateDealAmount(requestDto.getAmount());
			deal.setAmount(requestDto.getAmount());
		}

		if (requestDto.getPriority() != null) {
			CrmValidations.validateDealPriority(requestDto.getPriority());
			deal.setPriority(requestDto.getPriority());
		}

		if (requestDto.getDescription() != null) {
			CrmValidations.validateDealDescription(requestDto.getDescription());
			deal.setDescription(requestDto.getDescription());
		}

		if (requestDto.getStageId() != null) {
			CrmValidations.validateDealStageId(requestDto.getStageId());
			CrmDealStage stage = crmDealStageDao.findByIdAndIsDeletedFalse(requestDto.getStageId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_NOT_FOUND));
			deal.setStage(stage);

			String lastOrderIndex = crmDealDao.findMaxOrderIndexByStageId(stage.getId());
			deal.setOrderIndex(FractionalIndexUtil.generateKeyBetween(lastOrderIndex, null));
		}

		if (requestDto.getContactId() != null) {
			CrmValidations.validateDealContactId(requestDto.getContactId());
			CrmContact contact = crmContactDao.findByIdAndIsDeletedFalse(requestDto.getContactId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_CONTACT_NOT_FOUND));

			if (!requestDto.getContactId().equals(deal.getContact().getId())) {
				if (crmDealDao.existsByNameAndContact_IdAndIsDeletedFalse(deal.getName(), requestDto.getContactId())) {
					throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_EXISTS);
				}
			}

			deal.setContact(contact);

			CrmCompany company = null;
			if (contact.getCompany() != null) {
				company = crmCompanyDao.findByIdAndIsDeletedFalse(contact.getCompany().getId()).orElse(null);
			}
			deal.setCompany(company);
		}

		if (requestDto.getOwnerId() != null && !requestDto.getOwnerId().equals(deal.getOwner().getEmployeeId())) {
			Employee newOwner = crmOwnerResolver.resolveOwner(requestDto.getOwnerId(), currentUser);
			deal.setOwner(newOwner);
		}

		CrmDeal savedDeal = crmDealDao.save(deal);

		CrmDealResponseDto responseDto = crmMapper.crmDealToCrmDealResponseDto(savedDeal);

		log.info("editDeal: execution ended");
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	@Transactional
	public ResponseEntityDto deleteDeal(Long id) {
		log.info("deleteDeal: execution started");

		CrmDeal deal = crmDealDao.findByIdAndIsDeletedFalse(id)
			.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_NOT_FOUND));

		User currentUser = userService.getCurrentUser();
		if (CrmValidations.isOwnerRestrictedForRepresentative(currentUser, deal.getOwner().getEmployeeId())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_EDIT_DENIED);
		}

		List<CrmTask> linkedTasks = crmTaskDao.findByDeal_IdAndIsDeletedFalse(id);
		linkedTasks.forEach(task -> task.setIsDeleted(true));
		crmTaskDao.saveAll(linkedTasks);

		deal.setIsDeleted(true);
		crmDealDao.save(deal);

		log.info("deleteDeal: execution ended");
		return new ResponseEntityDto(messageUtil.getMessage(CrmMessageConstant.CRM_SUCCESS_DEAL_DELETED), false);
	}

}
