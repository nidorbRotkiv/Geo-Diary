package com.nidorbrotkiv.backend.follow;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FollowRequestRepository extends JpaRepository<FollowRequest, Long> {
}
