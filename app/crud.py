"""
CRUD operations for telemetry data
"""
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime, timedelta

from . import models, schemas

def get_telemetry(db: Session, skip: int = 0, limit: int = 100) -> List[models.Telemetry]:
    """Get telemetry records with pagination"""
    return db.query(models.Telemetry).order_by(desc(models.Telemetry.timestamp)).offset(skip).limit(limit).all()

def get_telemetry_by_id(db: Session, telemetry_id: int) -> Optional[models.Telemetry]:
    """Get telemetry record by ID"""
    return db.query(models.Telemetry).filter(models.Telemetry.id == telemetry_id).first()

def create_telemetry(db: Session, telemetry: schemas.TelemetryCreate) -> models.Telemetry:
    """Create new telemetry record"""
    db_telemetry = models.Telemetry(**telemetry.dict())
    db.add(db_telemetry)
    db.commit()
    db.refresh(db_telemetry)
    return db_telemetry

def get_telemetry_by_timerange(
    db: Session, 
    start_time: datetime, 
    end_time: datetime
) -> List[models.Telemetry]:
    """Get telemetry records within time range"""
    return db.query(models.Telemetry).filter(
        models.Telemetry.timestamp >= start_time,
        models.Telemetry.timestamp <= end_time
    ).order_by(desc(models.Telemetry.timestamp)).all()

def get_telemetry_by_nodes(
    db: Session, 
    source: str, 
    target: str, 
    limit: int = 100
) -> List[models.Telemetry]:
    """Get telemetry records for specific source-target pair"""
    return db.query(models.Telemetry).filter(
        models.Telemetry.network_measure == source,
        models.Telemetry.network_target == target
    ).order_by(desc(models.Telemetry.timestamp)).limit(limit).all()

def get_sla_violations(db: Session, limit: int = 100) -> List[models.Telemetry]:
    """Get records with SLA violations"""
    return db.query(models.Telemetry).filter(
        models.Telemetry.sla_violation == True
    ).order_by(desc(models.Telemetry.timestamp)).limit(limit).all()

def get_statistics(db: Session) -> dict:
    """Get platform statistics"""
    # Total records
    total_records = db.query(models.Telemetry).count()
    
    # SLA violations
    sla_violations = db.query(models.Telemetry).filter(
        models.Telemetry.sla_violation == True
    ).count()
    
    # Violation rate
    violation_rate = (sla_violations / total_records * 100) if total_records > 0 else 0
    
    # Average metrics (last 24 hours)
    last_24h = datetime.utcnow() - timedelta(hours=24)
    recent_records = db.query(models.Telemetry).filter(
        models.Telemetry.timestamp >= last_24h
    ).all()
    
    if recent_records:
        avg_latency = sum(r.latency for r in recent_records) / len(recent_records)
        avg_throughput = sum(r.throughput for r in recent_records) / len(recent_records)
    else:
        avg_latency = 0
        avg_throughput = 0
    
    # Anomaly count (simulated - would be from anomaly detection results)
    anomaly_count = db.query(models.Telemetry).filter(
        models.Telemetry.timestamp >= last_24h,
        models.Telemetry.latency > 15  # Simple anomaly threshold
    ).count()
    
    return {
        "total_records": total_records,
        "sla_violations": sla_violations,
        "violation_rate": round(violation_rate, 2),
        "avg_latency": round(avg_latency, 2),
        "avg_throughput": round(avg_throughput, 2),
        "anomaly_count": anomaly_count,
        "last_updated": datetime.utcnow()
    }

def delete_old_records(db: Session, days: int = 30) -> int:
    """Delete records older than specified days"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    deleted_count = db.query(models.Telemetry).filter(
        models.Telemetry.timestamp < cutoff_date
    ).delete()
    db.commit()
    return deleted_count

def get_high_latency_records(db: Session, threshold: float = 10.0, limit: int = 100) -> List[models.Telemetry]:
    """Get records with high latency"""
    return db.query(models.Telemetry).filter(
        models.Telemetry.latency > threshold
    ).order_by(desc(models.Telemetry.latency)).limit(limit).all()

def get_network_summary(db: Session) -> dict:
    """Get network topology summary"""
    # Get unique source-target pairs
    connections = db.query(
        models.Telemetry.network_measure,
        models.Telemetry.network_target,
        func.count(models.Telemetry.id).label('record_count'),
        func.avg(models.Telemetry.latency).label('avg_latency'),
        func.avg(models.Telemetry.throughput).label('avg_throughput')
    ).group_by(
        models.Telemetry.network_measure,
        models.Telemetry.network_target
    ).all()
    
    return {
        "connections": [
            {
                "source": conn.network_measure,
                "target": conn.network_target,
                "record_count": conn.record_count,
                "avg_latency": round(conn.avg_latency, 2),
                "avg_throughput": round(conn.avg_throughput, 2)
            }
            for conn in connections
        ],
        "total_connections": len(connections)
    }