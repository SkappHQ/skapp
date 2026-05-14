package com.skapp.community.crmplanner.repository.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.payload.response.CrmCompanyTableViewDto;
import com.skapp.community.crmplanner.repository.CrmCompanyRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class CrmCompanyRepositoryImpl implements CrmCompanyRepository {

  private final EntityManager entityManager;

  @Override
  public Page<CrmCompanyTableViewDto> getCompanyTableViewDetails(Pageable pageable, String searchKeyword) {
    CriteriaBuilder cb = entityManager.getCriteriaBuilder();

    CriteriaQuery<CrmCompanyTableViewDto> query = cb.createQuery(CrmCompanyTableViewDto.class);

    Root<CrmCompany> company = query.from(CrmCompany.class);

    Join<CrmCompany, CrmTask> taskJoin = company.join("tasks", JoinType.LEFT);

    Join<CrmCompany, CrmDeal> dealJoin = company.join("deals", JoinType.LEFT);

    Expression<Long> taskCount = cb.countDistinct((taskJoin.get("id")));

    Expression<Long> overdueCount = cb.countDistinct(
        cb.<Long>selectCase()
            .when(cb.and(
                cb.isFalse(taskJoin.get("isDeleted")),
                cb.isFalse(taskJoin.get("isCompleted")),
                cb.isNotNull(taskJoin.get("dueAt")),
                cb.lessThan(taskJoin.<java.time.LocalDateTime>get("dueAt"), cb.localDateTime())
            ), taskJoin.<Long>get("id"))
            .otherwise(cb.nullLiteral(Long.class))
    );

    Expression<BigDecimal> openDealCase = cb.<BigDecimal>selectCase().when(
        cb.notEqual(dealJoin.get("stage").get("id"), 3),
        dealJoin.get("amount"))
        .otherwise(BigDecimal.ZERO);

    Expression<BigDecimal> closedDealCase = cb.<BigDecimal>selectCase().when(
        cb.equal(dealJoin.get("stage").get("id"), 3),
        dealJoin.get("amount"))
        .otherwise(BigDecimal.ZERO);

    Expression<BigDecimal> openValue = cb.<BigDecimal>sum(openDealCase);

    Expression<BigDecimal> accountValue = cb.<BigDecimal>sum(closedDealCase);

    Expression<Long> closedDealsCount = cb.countDistinct(
        cb.<Long>selectCase()
            .when(cb.equal(dealJoin.get("stage").get("id"), 3), dealJoin.<Long>get("id"))
            .otherwise(cb.nullLiteral(Long.class))
    );

    query.select(
        cb.construct(
            CrmCompanyTableViewDto.class,

            company.get("id"),
            company.get("name"),
            company.get("contactNumber"),

            taskCount,
            overdueCount,
            openValue,
            accountValue,
            closedDealsCount

        ));

    List<Predicate> predicates = new ArrayList<>();

    predicates.add(cb.isFalse(company.get("isDeleted")));

    if (StringUtils.hasText(searchKeyword)) {
      predicates.add(cb.like(cb.lower(company.get("name")),
          "%" + searchKeyword.toLowerCase() + "%"));
    }
    query.where(predicates.toArray(new Predicate[0]));

    query.groupBy(
        company.get("id"),
        company.get("name"),
        company.get("contactNumber"));

    List<CrmCompanyTableViewDto> content = entityManager.createQuery(query)
        .setFirstResult((int) pageable.getOffset())
        .setMaxResults(pageable.getPageSize())
        .getResultList();

    CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
    Root<CrmCompany> countRoot = countQuery.from(CrmCompany.class);
    List<Predicate> countPredicates = new ArrayList<>();
    countPredicates.add(cb.isFalse(countRoot.get("isDeleted")));
    if (StringUtils.hasText(searchKeyword)) {
      countPredicates.add(cb.like(cb.lower(countRoot.get("name")),
          "%" + searchKeyword.toLowerCase() + "%"));
    }
    countQuery.select(cb.countDistinct(countRoot.get("id")))
        .where(countPredicates.toArray(new Predicate[0]));
    Long total = entityManager.createQuery(countQuery).getSingleResult();

    return new PageImpl<>(content, pageable, total);
  }

}
