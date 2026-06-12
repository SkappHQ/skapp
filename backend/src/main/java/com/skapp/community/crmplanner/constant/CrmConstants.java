package com.skapp.community.crmplanner.constant;

import com.skapp.community.common.type.Role;
import com.skapp.community.crmplanner.type.CrmDealStageColors;
import com.skapp.community.crmplanner.type.CrmDealStageName;
import com.skapp.community.crmplanner.type.CrmDealStageType;
import com.skapp.community.crmplanner.type.CrmTaskPriority;
import com.skapp.community.crmplanner.type.DefaultCrmDealStageValues;
import lombok.experimental.UtilityClass;

import java.util.List;
import java.util.Set;

@UtilityClass
public class CrmConstants {

	public static final int DEAL_NAME_MAX_LENGTH = 255;

	public static final String DEAL_NAME_REGEX = "^[\\p{L}\\p{N} \\-.,&'()/:@#|]+$";

	public static final int DEAL_DESCRIPTION_MAX_LENGTH = 2000;

	public static final int DEAL_AMOUNT_MAX_LENGTH = 20;

	public static final String DEAL_AMOUNT_REGEX = "^\\d+(\\.\\d{1,2})?$";

	public static final int DEAL_STAGE_NAME_MIN_LENGTH = 2;

	public static final int DEAL_STAGE_NAME_MAX_LENGTH = 50;

	public static final String DEAL_STAGE_NAME_REGEX = "^(?=.*\\p{L})[\\p{L}\\p{N} \\-.']+$";

	public static final int DEAL_STAGE_DESCRIPTION_MAX_LENGTH = 250;

	public static final String DEAL_STAGE_DESCRIPTION_REGEX = "^[\\p{L}\\p{N} \\-.,']+$";

	public static final CrmDealStageType DEFAULT_DEAL_STAGE_TYPE = CrmDealStageType.OPEN;

	public static final int DEAL_STAGE_OPEN_LIMIT_FREE_TIER = 2;

	public static final List<DefaultCrmDealStageValues> FREE_TIER_HIDDEN_DEAL_STAGES = List.of(
			new DefaultCrmDealStageValues(CrmDealStageName.PROPOSAL_SENT, CrmDealStageColors.LAVENDER, 4,
					CrmDealStageType.OPEN),
			new DefaultCrmDealStageValues(CrmDealStageName.NEGOTIATION, CrmDealStageColors.SUNSHINE, 5,
					CrmDealStageType.OPEN));

	public static final int DEALS_PER_STAGE_LIMIT = 20;

	public static final Set<Role> ASSIGNABLE_CRM_ROLES = Set.of(Role.CRM_ADMIN, Role.CRM_SALES_MANAGER,
			Role.CRM_SALES_REPRESENTATIVE);

	public static final String CONTACT_NAME_REGEX = "^[\\p{L} \\-.,]+$";

	public static final int COMPANY_NAME_MAX_LENGTH = 30;

	public static final int CONTACT_NAME_MAX_LENGTH = 255;

	public static final int ADDRESS_MAX_LENGTH = 100;

	public static final int CHARACTER_MAX_LENGTH = 50;

	public static final int PHONE_MAX_LENGTH = 15;

	public static final int TASK_NAME_MAX_LENGTH = 255;

	public static final int TASK_NOTES_MAX_LENGTH = 1000;

	public static final CrmTaskPriority DEFAULT_TASK_PRIORITY = CrmTaskPriority.MEDIUM;

}
