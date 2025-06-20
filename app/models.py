"""
SQLAlchemy ORM models for telemetry data
"""
from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean
from sqlalchemy.sql import func
from .database import Base

class Telemetry(Base):
    """Telemetry data model"""
    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Network metrics
    bandwidth = Column(Float, nullable=False, comment="Available bandwidth in Mbps")
    throughput = Column(Float, nullable=False, comment="Actual throughput in Mbps")
    congestion = Column(Float, nullable=False, comment="Network congestion percentage")
    packet_loss = Column(Float, nullable=False, comment="Packet loss percentage")
    latency = Column(Float, nullable=False, comment="Network latency in milliseconds")
    jitter = Column(Float, nullable=False, comment="Network jitter in milliseconds")
    
    # Network topology
    routers = Column(String, nullable=True, comment="Router configuration")
    planned_route = Column(String, nullable=True, comment="Planned network route")
    network_measure = Column(String, nullable=False, comment="Source network node")
    network_target = Column(String, nullable=False, comment="Target network node")
    
    # Video/traffic specific metrics
    video_target = Column(String, nullable=True, comment="Video target configuration")
    percentage_video_occupancy = Column(Float, nullable=True, comment="Video occupancy percentage")
    bitrate_video = Column(Float, nullable=True, comment="Video bitrate")
    number_videos = Column(Integer, nullable=True, comment="Number of video streams")
    
    # SLA prediction result
    sla_violation = Column(Boolean, nullable=True, comment="SLA violation prediction")
    
    # Additional metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Telemetry(id={self.id}, source={self.network_measure}, target={self.network_target}, latency={self.latency})>"