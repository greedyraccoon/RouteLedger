package com.routeledger.backend.user.service;

import com.routeledger.backend.user.dto.UpdateRoleRequest;
import com.routeledger.backend.user.dto.UserResponse;
import com.routeledger.backend.user.entity.User;
import com.routeledger.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> new UserResponse(u.getId(), u.getEmail(), u.getName(), u.getPictureUrl(), u.getRole()))
                .toList();
    }

    @Transactional
    public UserResponse updateUserRole(Long userId, UpdateRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        user.setRole(request.role());
        User updatedUser = userRepository.save(user);

        return new UserResponse(
                updatedUser.getId(),
                updatedUser.getEmail(),
                updatedUser.getName(),
                updatedUser.getPictureUrl(),
                updatedUser.getRole()
        );
    }
}