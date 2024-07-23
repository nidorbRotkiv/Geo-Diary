package com.nidorbrotkiv.backend.follow;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.nidorbrotkiv.backend.user.User;
import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "follow_request")
public class FollowRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "requester_id", referencedColumnName = "id")
    @JsonIgnore
    private User requester;

    @ManyToOne
    @JoinColumn(name = "target_id", referencedColumnName = "id")
    @JsonIgnore
    private User target;

    private String status;

    public FollowRequest(User requester, User target, String status) {
        this.requester = requester;
        this.target = target;
        this.status = status;
    }

    @Transient
    @JsonProperty("targetEmail")
    public String getTargetEmail() {
        return this.target != null ? this.target.getEmail() : null;
    }
}
