package com.skapp.community.peopleplanner.service.impl;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.component.DefaultSkillLoader;
import com.skapp.community.peopleplanner.model.CustomSkill;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeSkill;
import com.skapp.community.peopleplanner.payload.request.EmployeeSkillDto;
import com.skapp.community.peopleplanner.payload.response.SkillResponseDto;
import com.skapp.community.peopleplanner.repository.CustomSkillDao;
import com.skapp.community.peopleplanner.repository.EmployeeSkillDao;
import com.skapp.community.peopleplanner.service.SkillService;
import com.skapp.community.peopleplanner.type.SkillType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SkillServiceImpl implements SkillService {

	private final DefaultSkillLoader defaultSkillLoader;

	private final CustomSkillDao customSkillDao;

	private final EmployeeSkillDao employeeSkillDao;

	@Override
	@Transactional
	public List<EmployeeSkill> saveEmployeeSkills(Employee employee, List<EmployeeSkillDto> skills) {
		employeeSkillDao.deleteByEmployeeEmployeeId(employee.getEmployeeId());
		employeeSkillDao.flush();

		if (skills == null || skills.isEmpty()) {
			return new ArrayList<>();
		}

		List<EmployeeSkill> employeeSkills = new ArrayList<>();

		for (EmployeeSkillDto skillDto : skills) {
			EmployeeSkill employeeSkill = new EmployeeSkill();
			employeeSkill.setEmployee(employee);

			if (skillDto.getSkillType() == SkillType.DEFAULT) {
				Optional<DefaultSkillLoader.DefaultSkill> defaultSkill = defaultSkillLoader
					.findById(skillDto.getSkillId());
				if (defaultSkill.isEmpty()) {
					log.warn("Default skill not found with id: {}", skillDto.getSkillId());
					continue;
				}
				employeeSkill.setSkillId(skillDto.getSkillId());
				employeeSkill.setSkillType(SkillType.DEFAULT);
			}
			else if (skillDto.getSkillType() == SkillType.CUSTOM) {
				CustomSkill customSkill = findOrCreateCustomSkill(skillDto.getName());
				employeeSkill.setSkillId(customSkill.getId());
				employeeSkill.setSkillType(SkillType.CUSTOM);
			}

			employeeSkills.add(employeeSkill);
		}

		return employeeSkillDao.saveAll(employeeSkills);
	}

	@Override
	public List<SkillResponseDto> getEmployeeSkillResponses(Long employeeId) {
		List<EmployeeSkill> employeeSkills = employeeSkillDao.findByEmployeeEmployeeId(employeeId);

		return employeeSkills.stream().map(es -> {
			if (es.getSkillType() == SkillType.DEFAULT) {
				Optional<DefaultSkillLoader.DefaultSkill> defaultSkill = defaultSkillLoader.findById(es.getSkillId());
				String name = defaultSkill.map(DefaultSkillLoader.DefaultSkill::name).orElse("Unknown");
				return new SkillResponseDto(es.getSkillId(), name, SkillType.DEFAULT);
			}
			else {
				Optional<CustomSkill> customSkill = customSkillDao.findById(es.getSkillId());
				String name = customSkill.map(CustomSkill::getName).orElse("Unknown");
				return new SkillResponseDto(es.getSkillId(), name, SkillType.CUSTOM);
			}
		}).sorted(Comparator.comparing(SkillResponseDto::getName, String.CASE_INSENSITIVE_ORDER)).toList();
	}

	private CustomSkill findOrCreateCustomSkill(String name) {
		Optional<CustomSkill> existing = customSkillDao.findByNameIgnoreCase(name);
		if (existing.isPresent()) {
			return existing.get();
		}
		CustomSkill customSkill = new CustomSkill();
		customSkill.setName(name);
		return customSkillDao.save(customSkill);
	}

	@Override
	public ResponseEntityDto getAllSkills() {
		List<SkillResponseDto> customSkills = customSkillDao.findAll()
			.stream()
			.map(s -> new SkillResponseDto(s.getId(), s.getName(), SkillType.CUSTOM))
			.sorted(Comparator.comparing(SkillResponseDto::getName, String.CASE_INSENSITIVE_ORDER))
			.toList();

		return new ResponseEntityDto(false, (Object) customSkills);
	}

}
