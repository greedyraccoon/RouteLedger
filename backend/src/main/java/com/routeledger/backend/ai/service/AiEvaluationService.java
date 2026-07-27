package com.routeledger.backend.ai.service;

import com.routeledger.backend.ai.dto.AiRiskAssessment;
import com.routeledger.backend.alert.service.AlertService;
import com.routeledger.backend.alert.enums.AlertSeverity;
import com.routeledger.backend.alert.enums.AlertType;
import com.routeledger.backend.alert.dto.CreateAlertRequest;
import com.routeledger.backend.exception.ResourceNotFoundException;
import com.routeledger.backend.predictor.service.PredictionService;
import com.routeledger.backend.predictor.enums.RiskLevel;
import com.routeledger.backend.predictor.dto.CreatePredictionRequest;
import com.routeledger.backend.predictor.dto.PredictionResponse;
import com.routeledger.backend.trip.entity.Trip;
import com.routeledger.backend.trip.repository.TripRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.stereotype.Service;

@Service
public class AiEvaluationService {

    private final ChatClient chatClient;
    private final TripRepository tripRepository;
    private final PredictionService predictionService;
    private final AlertService alertService;

    public AiEvaluationService(ChatClient.Builder chatClientBuilder,
                               TripRepository tripRepository,
                               PredictionService predictionService,
                               AlertService alertService) {
        this.chatClient = chatClientBuilder.build();
        this.tripRepository = tripRepository;
        this.predictionService = predictionService;
        this.alertService = alertService;
    }

    public PredictionResponse evaluateTripRisk(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with ID: " + tripId));

        // 1. Convert to our dedicated AI DTO instead of the Predictor DTO
        BeanOutputConverter<AiRiskAssessment> converter = new BeanOutputConverter<>(AiRiskAssessment.class);
        String format = converter.getFormat();

        String prompt = String.format("""
            You are an AI logistics expert. Evaluate the risk of delay for the following truck trip:
            - Origin: %s
            - Destination: %s
            - Cargo: %s (Weight: %s tons)
            - Vehicle: %s
            - Scheduled ETA: %s

            Analyze potential geographic, traffic, or logistics issues.
            %s
            """,
                trip.getOriginName(), trip.getDestName(), trip.getCargoType(),
                trip.getCargoWeightTons(), trip.getVehicleNumber(), trip.getScheduledEta(), format);

        String response = chatClient.prompt()
                .user(prompt)
                .call()
                .content();

        // 2. Parse into the AI DTO
        AiRiskAssessment assessment = converter.convert(response);

        // 3. Map the isolated AI data into the Predictor module's strict request DTO
        CreatePredictionRequest predictionRequest = new CreatePredictionRequest(
                trip.getId(),
                assessment.riskScore(),
                assessment.riskLevel(),
                assessment.riskFactors()
        );

        PredictionResponse savedPrediction = predictionService.createPrediction(predictionRequest);

        if (assessment.riskLevel() == RiskLevel.CRITICAL || assessment.riskLevel() == RiskLevel.HIGH) {
            alertService.createAlert(new CreateAlertRequest(
                    trip.getId(),
                    AlertType.SLA_BREACH_PREDICTED,
                    AlertSeverity.CRITICAL,
                    "AI detected high risk: " + assessment.riskFactors()
            ));
        }

        return savedPrediction;
    }
}