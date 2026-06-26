package com.skapp.community.common.service.impl;

import com.skapp.community.common.constant.CommonConstants;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.exception.TooManyRequestsException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.peopleplanner.payload.response.EmployeeBulkResponseDto;
import com.skapp.community.peopleplanner.service.PeopleEmailService;
import com.skapp.community.peopleplanner.type.BulkItemStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AsyncEmailServiceImpl {

	private final UserDao userDao;

	private final PeopleEmailService peopleEmailService;

	@Async
	public void sendEmailsInBackground(List<EmployeeBulkResponseDto> results) {
		int batchSize = 100;

		List<List<EmployeeBulkResponseDto>> batches = createBatches(results, batchSize);

		for (List<EmployeeBulkResponseDto> batch : batches) {
			processBatch(batch);
		}
	}

	private List<List<EmployeeBulkResponseDto>> createBatches(List<EmployeeBulkResponseDto> results, int batchSize) {
		return new ArrayList<>(results.stream()
			.filter(result -> result.getStatus() == BulkItemStatus.SUCCESS)
			.collect(Collectors.groupingBy(result -> results.indexOf(result) / batchSize))
			.values());
	}

	private void processBatch(List<EmployeeBulkResponseDto> batch) {
		batch.forEach(result -> {
			try {
				User user = userDao.findByEmail(result.getEmail())
					.orElseThrow(() -> new IllegalArgumentException("User not found for email: " + result.getEmail()));
				retrySendEmail(user, result.getTempPassword());
				log.info("Email sent successfully to: {}", result.getEmail());
			}
			catch (Exception exception) {
				log.error("Failed to send email to: {}", result.getEmail(), exception);
			}
		});
	}

	private void retrySendEmail(User user, String tempPassword) throws Exception {
		int retries = 0;
		while (retries < CommonConstants.MAX_RETRIES_COUNT) {
			try {
				peopleEmailService.sendUserInvitationEmail(user, tempPassword);
				return;
			}
			catch (TooManyRequestsException exception) {
				retries++;
				log.warn("Rate limit hit. Retrying... (Attempt {}/{})", retries, CommonConstants.MAX_RETRIES_COUNT);
				Thread.sleep((long) Math.pow(2, retries) * 1000);
			}
		}
		throw new ModuleException(CommonMessageConstant.COMMON_ERROR_MAX_RETRIES_REACHED,
				new String[] { user.getEmail() });
	}

}
