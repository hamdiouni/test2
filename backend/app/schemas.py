"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class TelemetryBase(BaseModel):
    """Base telemetry schema"""
    bandwidth: float = Field(..., ge=0, description="Available bandwidth in Mbps")
    throughput: float = Field(..., ge=0, description="Actual throughput in Mbps")
    congestion: float = Field(..., ge=0, le=100, description="Network congestion percentage")
    packet_loss: float = Field(..., ge=0, le=100, description="Packet loss percentage")
    latency: float = Field(..., ge=0, description="Network latency in milliseconds")
    jitter: float = Field(..., ge=0, description="Network jitter in milliseconds")
    
    # Network topology
    routers: Optional[str] = Field(None, description="Router configuration")
    planned_route: Optional[str] = Field(None, description="Planned network route")
    network_measure: str = Field(..., description="Source network node")
    network_target: str = Field(..., description="Target network node")
    
    # Video/traffic specific metrics
    video_target: Optional[str] = Field(None, description="Video target configuration")
    percentage_video_occupancy: Optional[float] = Field(None, ge=0, le=100, description="Video occupancy percentage")
    bitrate_video: Optional[float] = Field(None, ge=0, description="Video bitrate")
    number_videos: Optional[int] = Field(None, ge=0, description="Number of video streams")

class TelemetryCreate(TelemetryBase):
    """Schema for creating telemetry records"""
    sla_violation: Optional[bool] = Field(None, description="SLA violation prediction")

class Telemetry(TelemetryBase):
    """Schema for telemetry responses"""
    id: int
    timestamp: datetime
    sla_violation: Optional[bool]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class PredictionRequest(BaseModel):
    """Schema for prediction requests"""
    bandwidth: float = Field(..., ge=0)
    throughput: float = Field(..., ge=0)
    congestion: float = Field(..., ge=0, le=100)
    packet_loss: float = Field(..., ge=0, le=100)
    latency: float = Field(..., ge=0)
    jitter: float = Field(..., ge=0)

class PredictionResponse(BaseModel):
    """Schema for prediction responses"""
    sla_violation: int = Field(..., description="Binary prediction (0 or 1)")
    risk_score: float = Field(..., ge=0, le=1, description="Risk probability")
    confidence: float = Field(..., ge=0, le=1, description="Model confidence")
    model_version: str = Field(..., description="Model version used")

class AnomalyResponse(BaseModel):
    """Schema for anomaly detection responses"""
    is_anomaly: bool = Field(..., description="Whether data point is anomalous")
    anomaly_score: float = Field(..., ge=0, le=1, description="Anomaly score")
    explanation: str = Field(..., description="Human-readable explanation")

class ExplanationResponse(BaseModel):
    """Schema for prediction explanation responses"""
    telemetry_id: int
    feature_importance: dict = Field(..., description="Feature importance scores")
    shap_values: list = Field(..., description="SHAP values for features")
    base_value: float = Field(..., description="Base prediction value")

class StatisticsResponse(BaseModel):
    """Schema for platform statistics"""
    total_records: int
    sla_violations: int
    violation_rate: float
    avg_latency: float
    avg_throughput: float
    anomaly_count: int
    last_updated: datetime