package com.skapp.community.okrplanner.model;

import com.skapp.community.okrplanner.type.KeyResultType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

@Entity
@Table(name = "key_result")
@Getter
@Setter
@NoArgsConstructor
public class KeyResults {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "key_result_id")
    private Long keyResultId;

    @Column(name = "title")
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private KeyResultType type;

    @Column(name = "lower_limit")
    private Double lowerLimit;

    @Column(name = "upper_limit")
    private Double upperLimit;

    @OneToMany(mappedBy = "keyResults", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<KeyResultAssignedTeam> assignedTeams;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_objective_id")
    private TeamObjective teamObjective;
}
