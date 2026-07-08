package com.skapp.community.peopleplanner.service.impl;

import com.skapp.community.common.model.Organization;
import com.skapp.community.common.model.OrganizationConfig;
import com.skapp.community.common.model.User;
import com.skapp.community.common.repository.OrganizationConfigDao;
import com.skapp.community.common.repository.OrganizationDao;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.service.EmailService;
import com.skapp.community.common.service.EncryptionDecryptionService;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.common.type.LoginMethod;
import com.skapp.community.common.type.OrganizationConfigType;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.CommonModuleUtils;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.payload.email.PeopleEmailDynamicFields;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeRoleDao;
import com.skapp.community.peopleplanner.service.RolesService;
import com.skapp.community.peopleplanner.service.StagingReviewService;
import com.skapp.community.peopleplanner.type.AccountStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.skapp.community.peopleplanner.model.ExternalSyncStaging;
import com.skapp.community.peopleplanner.model.ExternalSyncStaging.Decision;
import com.skapp.community.peopleplanner.repository.ExternalSyncStagingDao;
import com.skapp.community.peopleplanner.model.ExternalPersonSyncLog;
import com.skapp.community.peopleplanner.repository.ExternalPersonSyncLogDao;
import java.util.HashMap;
import java.util.Map;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class StagingReviewServiceImpl implements StagingReviewService {

    private final ExternalSyncStagingDao stagingDao;
    private final UserDao userDao;
    private final EmployeeDao employeeDao;
    private final EmployeeRoleDao employeeRoleDao;
    private final RolesService rolesService;
    private final PasswordEncoder passwordEncoder;
    private final EncryptionDecryptionService encryptionDecryptionService;
    private final EmailService emailService;
    private final OrganizationDao organizationDao;
    private final OrganizationConfigDao organizationConfigDao;
    private final ExternalPersonSyncLogDao syncLogDao;

    @Override
    public List<ExternalSyncStaging> getPendingRecords() {
        return stagingDao.findAllByDecision(Decision.PENDING);
    }

    @Override
    public Map<String, Object> getLastSyncChanges() {
        Map<String, Object> result = new HashMap<>();

        List<ExternalSyncStaging> changes = stagingDao.findAllByChangeTypeIn(
                List.of(ExternalSyncStaging.ChangeType.NEW,
                        ExternalSyncStaging.ChangeType.UPDATED));
        result.put("changes", changes);

        syncLogDao.findTopByOrderByStartedAtDesc().ifPresent(log -> {
            result.put("syncType", log.getSyncType());
            result.put("syncedAt", log.getStartedAt());
        });

        return result;
    }


    @Override
    @Transactional
    public Map<String, Integer> approve(List<Long> ids) {
        String reviewer = currentUserEmail();
        List<ExternalSyncStaging> records = stagingDao.findAllById(ids);
        int imported = 0;
        int skippedDuplicate = 0;

        for (ExternalSyncStaging record : records) {
            try {
                // A NEW-staged record whose email already belongs to a real
                // Employee is a duplicate (e.g. created manually, or via a
                // different sync channel, since this row was staged) — skip
                // the upsert so it doesn't clobber that employee's existing
                // data. UPDATED/REMOVED are excluded from this check since
                // they're expected to target an existing employee by design.
                boolean isDuplicate = record.getChangeType() == ExternalSyncStaging.ChangeType.NEW
                        && employeeDao.findEmployeeByEmail(record.getEmail()) != null;

                if (isDuplicate) {
                    skippedDuplicate++;
                } else {
                    switch (record.getChangeType()) {
                        case NEW, UPDATED -> applyUpsert(record);
                        case REMOVED -> applyDeactivation(record);
                    }
                    imported++;

                    if (record.getChangeType() == ExternalSyncStaging.ChangeType.NEW) {
                        sendInviteEmail(record.getEmail());
                    }
                }

                record.setDecision(Decision.APPROVED);
                record.setReviewedAt(Instant.now());
                record.setReviewedBy(reviewer);
                stagingDao.save(record);
            } catch (Exception e) {
                log.error("Failed to approve staging record id={}, email={}: {}",
                        record.getId(), record.getEmail(), e.getMessage(), e);
            }
        }

        return Map.of("imported", imported, "skippedDuplicate", skippedDuplicate);
    }

    @Override
    @Transactional
    public void reject(List<Long> ids) {
        String reviewer = currentUserEmail();
        List<ExternalSyncStaging> records = stagingDao.findAllById(ids);
        for (ExternalSyncStaging record : records) {
            record.setDecision(Decision.REJECTED);
            record.setReviewedAt(Instant.now());
            record.setReviewedBy(reviewer);
        }
        stagingDao.saveAll(records);
    }

    private void applyUpsert(ExternalSyncStaging record) {
        String email = record.getEmail();
        boolean suspended = "SUSPENDED".equals(record.getGoogleStatus());

        Optional<User> existingUser = userDao.findByEmail(email);
        boolean isNew = existingUser.isEmpty();

        User user = existingUser.orElseGet(User::new);
        user.setEmail(email);
        user.setIsActive(!suspended);

        if (isNew) {
            String tempPassword = CommonModuleUtils.generateSecureRandomPassword();
            CommonModuleUtils.setIfExists(
                    () -> encryptionDecryptionService.encrypt(tempPassword),
                    user::setTempPassword);
            CommonModuleUtils.setIfExists(
                    () -> passwordEncoder.encode(tempPassword),
                    user::setPassword);
            user.setLoginMethod(LoginMethod.CREDENTIALS);
            user.setIsPasswordChangedForTheFirstTime(false);
        }

        User savedUser = userDao.saveAndFlush(user);

        Employee employee = employeeDao.findEmployeeByEmail(email);
        if (employee == null) {
            employee = new Employee();
        }
        employee.setUser(savedUser);
        employee.setFirstName(record.getFirstName());
        employee.setLastName(record.getLastName());
        employee.setAccountStatus(suspended ? AccountStatus.DEACTIVATED : AccountStatus.ACTIVE);
        if (employee.getJoinDate() == null) {
            employee.setJoinDate(LocalDate.now());
        }
        employee.setExternalSyncLastSyncedAt(Instant.now());
        employee.setExternalSyncChannel(record.getSyncChannel().name());
        Employee savedEmployee = employeeDao.save(employee);

        if (!employeeRoleDao.existsById(savedEmployee.getEmployeeId())) {
            EmployeeRole role = rolesService.setupBulkEmployeeRoles(savedEmployee);
            role.setEsignRole(Role.ESIGN_EMPLOYEE);
            role.setOkrRole(Role.OKR_EMPLOYEE);
            role.setPmRole(Role.PM_EMPLOYEE);
            role.setInvoiceRole(Role.INVOICE_NONE);
            role.setCrmRole(Role.CRM_NONE);
            employeeRoleDao.save(role);
        }

        log.info("Approved upsert for {}", email);
    }

    private void applyDeactivation(ExternalSyncStaging record) {
        String email = record.getEmail();

        userDao.findByEmail(email).ifPresent(user -> {
            user.setIsActive(false);
            userDao.save(user);
        });

        Employee employee = employeeDao.findEmployeeByEmail(email);
        if (employee != null) {
            employee.setAccountStatus(AccountStatus.DEACTIVATED);
            employee.setExternalSyncLastSyncedAt(Instant.now());
            employee.setExternalSyncChannel(record.getSyncChannel().name());
            employeeDao.save(employee);
        }

        log.info("Approved deactivation for {}", email);
    }

    private void sendInviteEmail(String email) {
        Optional<OrganizationConfig> emailConfig = organizationConfigDao
                .findOrganizationConfigByOrganizationConfigType(
                        OrganizationConfigType.EMAIL_CONFIGS.name());

        if (emailConfig.isEmpty()) {
            log.warn("SMTP not configured — skipping invite email for {}", email);
            return;
        }

        userDao.findByEmail(email).ifPresent(user -> {
            Employee employee = employeeDao.findEmployeeByEmail(email);
            if (employee == null) return;

            PeopleEmailDynamicFields fields = new PeopleEmailDynamicFields();
            fields.setEmployeeOrManagerName(
                    employee.getFirstName() + " " + employee.getLastName());
            fields.setOrganizationName(organizationDao.findTopByOrderByOrganizationIdDesc()
                    .map(Organization::getOrganizationName).orElse(""));
            fields.setWorkEmail(email);
            fields.setTemporaryPassword(
                    encryptionDecryptionService.decrypt(user.getTempPassword()));
            fields.setAppUrl("http://localhost:3000/signin");

            emailService.sendEmail(
                    EmailBodyTemplates.PEOPLE_MODULE_GOOGLE_SYNC_INVITATION, fields, email);
            log.info("Invite email sent to {}", email);
        });
    }

    private String currentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
