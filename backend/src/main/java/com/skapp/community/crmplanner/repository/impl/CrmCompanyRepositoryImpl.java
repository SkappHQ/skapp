package com.skapp.community.crmplanner.repository.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import com.skapp.community.crmplanner.constant.CrmConstants;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.payload.response.CrmCompanyMetricsDto;
import com.skapp.community.crmplanner.repository.CrmCompanyRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.From;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class CrmCompanyRepositoryImpl implements CrmCompanyRepository {

    private final EntityManager entityManager;

    @Override
    public Page<CrmCompanyMetricsDto> getCompanyMetrics(Pageable pageable, String searchKeyword) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<CrmCompanyMetricsDto> query = cb.createQuery(CrmCompanyMetricsDto.class);
        Root<CrmCompany> company = query.from(CrmCompany.class);

        Subquery<Long> taskSubquery = query.subquery(Long.class);
        Root<CrmTask> subTask = taskSubquery.from(CrmTask.class);
        taskSubquery.select(cb.count(subTask.get(CrmConstants.ID)))
            .where(
                cb.equal(subTask.get(CrmConstants.COMPANY), company), // Correlation
                cb.isFalse(subTask.get(CrmConstants.IS_DELETED)),
                cb.isFalse(subTask.get(CrmConstants.IS_COMPLETED))
            );

        Subquery<Long> overdueSubquery = query.subquery(Long.class);
        Root<CrmTask> subOverdueTask = overdueSubquery.from(CrmTask.class);
        overdueSubquery.select(cb.count(subOverdueTask.get(CrmConstants.ID)))
            .where(
                cb.equal(subOverdueTask.get(CrmConstants.COMPANY), company), // Correlation
                cb.isFalse(subOverdueTask.get(CrmConstants.IS_DELETED)),
                cb.isFalse(subOverdueTask.get(CrmConstants.IS_COMPLETED)),
                cb.isNotNull(subOverdueTask.get(CrmConstants.DUE_AT)),
                cb.lessThan(subOverdueTask.get(CrmConstants.DUE_AT), cb.localDateTime())
            );

        Subquery<BigDecimal> openValueSubquery = query.subquery(BigDecimal.class);
        Root<CrmDeal> openDeal = openValueSubquery.from(CrmDeal.class);
        openValueSubquery.select(cb.coalesce(cb.sum(openDeal.get(CrmConstants.AMOUNT)), BigDecimal.ZERO))
            .where(
                cb.equal(openDeal.get(CrmConstants.COMPANY), company), // Correlation
                cb.isFalse(openDeal.get(CrmConstants.IS_DELETED)),
                cb.notEqual(openDeal.get(CrmConstants.STAGE).get(CrmConstants.STAGE_ID), CrmConstants.WON_STAGE_ID)
            );

        Subquery<BigDecimal> accountValueSubquery = query.subquery(BigDecimal.class);
        Root<CrmDeal> closedDeal = accountValueSubquery.from(CrmDeal.class);
        accountValueSubquery.select(cb.coalesce(cb.sum(closedDeal.get(CrmConstants.AMOUNT)), BigDecimal.ZERO))
            .where(
                cb.equal(closedDeal.get(CrmConstants.COMPANY), company), // Correlation
                cb.isFalse(closedDeal.get(CrmConstants.IS_DELETED)),
                cb.equal(closedDeal.get(CrmConstants.STAGE).get(CrmConstants.STAGE_ID), CrmConstants.WON_STAGE_ID)
            );

        Subquery<Long> closedCountSubquery = query.subquery(Long.class);
        Root<CrmDeal> closedCountDeal = closedCountSubquery.from(CrmDeal.class);
        closedCountSubquery.select(cb.count(closedCountDeal.get(CrmConstants.ID)))
            .where(
                cb.equal(closedCountDeal.get(CrmConstants.COMPANY), company),
                cb.isFalse(closedCountDeal.get(CrmConstants.IS_DELETED)),
                cb.equal(closedCountDeal.get(CrmConstants.STAGE).get(CrmConstants.STAGE_ID), CrmConstants.WON_STAGE_ID)
            );

        Subquery<Long> openCountSubquery = query.subquery(Long.class);
        Root<CrmDeal> openCountDeal = openCountSubquery.from(CrmDeal.class);
        openCountSubquery.select(cb.count(openCountDeal.get(CrmConstants.ID)))
            .where(
                cb.equal(openCountDeal.get(CrmConstants.COMPANY), company),
                cb.isFalse(openCountDeal.get(CrmConstants.IS_DELETED)),
                cb.notEqual(openCountDeal.get(CrmConstants.STAGE).get(CrmConstants.STAGE_ID), CrmConstants.WON_STAGE_ID)
            );

        query.select(cb.construct(CrmCompanyMetricsDto.class,
                company.get(CrmConstants.ID), 
                company.get(CrmConstants.NAME), 
                company.get(CrmConstants.CONTACT_NUMBER),
                company.get(CrmConstants.INDUSTRY), 
                company.get(CrmConstants.WEBSITE),
                company.get(CrmConstants.ADDRESS),

                // Subqueries expressions in place of the old broken aggregates
                taskSubquery, 
                overdueSubquery, 
                openValueSubquery, 
                accountValueSubquery, 
                closedCountSubquery, 
                openCountSubquery
        ));

        query.where(buildPredicates(cb, company, searchKeyword));
        query.orderBy(cb.asc(company.get(CrmConstants.NAME)), cb.asc(company.get(CrmConstants.ID)));

        List<CrmCompanyMetricsDto> content = entityManager.createQuery(query)
            .setFirstResult((int) pageable.getOffset())
            .setMaxResults(pageable.getPageSize())
            .getResultList();

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<CrmCompany> countRoot = countQuery.from(CrmCompany.class);

        countQuery.select(cb.countDistinct(countRoot.get(CrmConstants.ID)))
            .where(buildPredicates(cb, countRoot, searchKeyword));
        Long total = entityManager.createQuery(countQuery).getSingleResult();

        return new PageImpl<>(content, pageable, total);
    }

	private <T> Predicate[] buildPredicates(CriteriaBuilder cb, From<?, T> root, String searchKeyword) {
        List<Predicate> predicates = new ArrayList<>();

        predicates.add(cb.isFalse(root.get(CrmConstants.IS_DELETED)));

        if (StringUtils.hasText(searchKeyword)) {
            predicates.add(cb.like(cb.lower(root.get(CrmConstants.NAME)), "%" + searchKeyword.toLowerCase() + "%"));
        }

        return predicates.toArray(new Predicate[0]);
    }
}