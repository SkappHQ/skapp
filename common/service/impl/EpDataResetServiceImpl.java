package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.enterprise.common.repository.EpDataResetDao;
import com.skapp.enterprise.common.service.EpDataResetService;
import jakarta.transaction.Transactional;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import static org.hibernate.query.sqm.tree.SqmNode.log;

@RequiredArgsConstructor
@Service
public class EpDataResetServiceImpl implements EpDataResetService {

	@NonNull
	private final EpDataResetDao epDataResetDao;

	@NonNull
	private final MessageUtil messageUtil;

	@Override
	@Transactional
	public ResponseEntityDto resetDatabase() {
		log.info("resetDatabase: execution started");
		epDataResetDao.resetDatabase();
		log.info("resetDatabase: execution ended");
		return new ResponseEntityDto(messageUtil.getMessage(CommonMessageConstant.COMMON_DATABASE_RESET_SUCCESS),
				false);
	}

}
