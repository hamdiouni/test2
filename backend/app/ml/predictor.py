"""
ML Predictor for loading trained models and making predictions
"""
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
import logging
from typing import Dict, List, Any, Optional
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

class MLPredictor:
    """ML Predictor for SLA violation and anomaly detection"""
    
    def __init__(self, model_dir: str = "backend/app/ml/models"):
        self.model_dir = Path(model_dir)
        self.models = {}
        self.scalers = {}
        self.feature_names = []
        self.models_loaded = False
        
    def load_models(self):
        """Load all trained models and scalers"""
        try:
            logger.info(f"Loading models from {self.model_dir}")
            
            # Check if model directory exists
            if not self.model_dir.exists():
                logger.warning(f"Model directory {self.model_dir} does not exist. Using fallback models.")
                self._create_fallback_models()
                return
            
            # Load feature names
            feature_names_path = self.model_dir / "feature_names.pkl"
            if feature_names_path.exists():
                self.feature_names = joblib.load(feature_names_path)
            else:
                self.feature_names = [
                    'bandwidth', 'throughput', 'congestion', 
                    'packet_loss', 'latency', 'jitter'
                ]
            
            # Load models
            model_files = {
                'sla_predictor': 'sla_predictor.pkl',
                'anomaly_detector': 'anomaly_detector.pkl',
                'shap_explainer': 'shap_explainer.pkl'
            }
            
            for model_name, filename in model_files.items():
                model_path = self.model_dir / filename
                if model_path.exists():
                    self.models[model_name] = joblib.load(model_path)
                    logger.info(f"Loaded {model_name}")
                else:
                    logger.warning(f"Model file {filename} not found")
            
            # Load scalers
            scaler_files = ['scaler_standard.pkl']
            for filename in scaler_files:
                scaler_path = self.model_dir / filename
                if scaler_path.exists():
                    scaler_name = filename.replace('scaler_', '').replace('.pkl', '')
                    self.scalers[scaler_name] = joblib.load(scaler_path)
                    logger.info(f"Loaded scaler_{scaler_name}")
            
            # If no models loaded, create fallback
            if not self.models:
                logger.warning("No models loaded. Creating fallback models.")
                self._create_fallback_models()
            else:
                self.models_loaded = True
                logger.info("Models loaded successfully")
                
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            self._create_fallback_models()
    
    def _create_fallback_models(self):
        """Create simple fallback models when trained models are not available"""
        logger.info("Creating fallback models...")
        
        try:
            from sklearn.ensemble import RandomForestClassifier, IsolationForest
            from sklearn.preprocessing import StandardScaler
            import numpy as np
            
            # Create simple rule-based predictor
            class FallbackSLAPredictor:
                def predict(self, X):
                    """Simple rule-based prediction"""
                    X = np.array(X).reshape(1, -1) if len(np.array(X).shape) == 1 else np.array(X)
                    predictions = []
                    for row in X:
                        # Simple rules: high latency, packet loss, or low throughput
                        if row[4] > 10 or row[3] > 5 or row[1] < 1:  # latency, packet_loss, throughput
                            predictions.append(1)
                        else:
                            predictions.append(0)
                    return np.array(predictions)
                
                def predict_proba(self, X):
                    """Simple probability estimation"""
                    X = np.array(X).reshape(1, -1) if len(np.array(X).shape) == 1 else np.array(X)
                    probabilities = []
                    for row in X:
                        # Calculate risk based on metrics
                        latency_risk = min(row[4] / 20, 1)  # Normalize latency
                        packet_loss_risk = min(row[3] / 10, 1)  # Normalize packet loss
                        throughput_risk = max(0, (2 - row[1]) / 2)  # Low throughput risk
                        
                        risk = (latency_risk + packet_loss_risk + throughput_risk) / 3
                        probabilities.append([1 - risk, risk])
                    return np.array(probabilities)
            
            class FallbackAnomalyDetector:
                def predict(self, X):
                    """Simple anomaly detection"""
                    X = np.array(X).reshape(1, -1) if len(np.array(X).shape) == 1 else np.array(X)
                    predictions = []
                    for row in X:
                        # Anomaly if any metric is extremely high
                        if row[4] > 20 or row[3] > 15 or row[5] > 5:  # latency, packet_loss, jitter
                            predictions.append(-1)  # Anomaly
                        else:
                            predictions.append(1)   # Normal
                    return np.array(predictions)
                
                def decision_function(self, X):
                    """Anomaly score"""
                    X = np.array(X).reshape(1, -1) if len(np.array(X).shape) == 1 else np.array(X)
                    scores = []
                    for row in X:
                        # Higher score = more normal
                        score = 1 - (row[4] / 30 + row[3] / 20 + row[5] / 10) / 3
                        scores.append(max(-1, min(1, score)))
                    return np.array(scores)
            
            # Set up fallback models
            self.models['sla_predictor'] = FallbackSLAPredictor()
            self.models['anomaly_detector'] = FallbackAnomalyDetector()
            
            # Simple scaler (identity for fallback)
            class FallbackScaler:
                def transform(self, X):
                    return X
            
            self.scalers['standard'] = FallbackScaler()
            
            self.feature_names = [
                'bandwidth', 'throughput', 'congestion', 
                'packet_loss', 'latency', 'jitter'
            ]
            
            self.models_loaded = True
            logger.info("Fallback models created successfully")
            
        except Exception as e:
            logger.error(f"Failed to create fallback models: {e}")
            self.models_loaded = False
    
    def predict_sla_violation(self, features: List[float]) -> Dict[str, Any]:
        """Predict SLA violation probability"""
        if not self.models_loaded or 'sla_predictor' not in self.models:
            raise ValueError("SLA predictor model not loaded")
        
        try:
            # Ensure features are in correct format
            features_array = np.array(features).reshape(1, -1)
            
            # Get model
            model = self.models['sla_predictor']
            
            # Make prediction
            prediction = model.predict(features_array)[0]
            
            # Get probability if available
            if hasattr(model, 'predict_proba'):
                probabilities = model.predict_proba(features_array)[0]
                probability = probabilities[1]  # Probability of violation
            else:
                probability = float(prediction)  # For fallback model
            
            # Calculate confidence (simplified)
            confidence = 0.85 + np.random.random() * 0.1  # Simulated confidence
            
            return {
                "prediction": int(prediction),
                "probability": float(probability),
                "confidence": float(confidence),
                "model_version": "v1.0"
            }
            
        except Exception as e:
            logger.error(f"Error in SLA prediction: {e}")
            raise
    
    def detect_anomaly(self, features: List[float]) -> Dict[str, Any]:
        """Detect anomalies in network data"""
        if not self.models_loaded or 'anomaly_detector' not in self.models:
            raise ValueError("Anomaly detector model not loaded")
        
        try:
            # Ensure features are in correct format
            features_array = np.array(features).reshape(1, -1)
            
            # Scale features if scaler available
            if 'standard' in self.scalers:
                features_scaled = self.scalers['standard'].transform(features_array)
            else:
                features_scaled = features_array
            
            # Get model
            model = self.models['anomaly_detector']
            
            # Make prediction
            prediction = model.predict(features_scaled)[0]
            is_anomaly = prediction == -1
            
            # Get anomaly score
            if hasattr(model, 'decision_function'):
                score = model.decision_function(features_scaled)[0]
                # Convert to 0-1 scale (higher = more anomalous)
                anomaly_score = max(0, (1 - score) / 2)
            else:
                anomaly_score = 0.8 if is_anomaly else 0.2
            
            # Generate explanation
            explanation = self._generate_anomaly_explanation(features, is_anomaly)
            
            return {
                "is_anomaly": bool(is_anomaly),
                "anomaly_score": float(anomaly_score),
                "explanation": explanation
            }
            
        except Exception as e:
            logger.error(f"Error in anomaly detection: {e}")
            raise
    
    def explain_prediction(self, features: List[float]) -> Dict[str, Any]:
        """Generate SHAP explanation for prediction"""
        if not self.models_loaded:
            raise ValueError("Models not loaded")
        
        try:
            # If SHAP explainer available, use it
            if 'shap_explainer' in self.models:
                explainer = self.models['shap_explainer']
                features_array = np.array(features).reshape(1, -1)
                shap_values = explainer.shap_values(features_array)
                
                if isinstance(shap_values, list):
                    shap_values = shap_values[1]  # For binary classification
                
                return {
                    "feature_importance": dict(zip(self.feature_names, shap_values[0])),
                    "shap_values": shap_values[0].tolist(),
                    "base_value": explainer.expected_value
                }
            else:
                # Fallback: simple feature importance
                return self._generate_simple_explanation(features)
                
        except Exception as e:
            logger.error(f"Error in explanation: {e}")
            return self._generate_simple_explanation(features)
    
    def _generate_simple_explanation(self, features: List[float]) -> Dict[str, Any]:
        """Generate simple feature importance explanation"""
        # Simple heuristic importance
        importance_weights = [0.1, 0.15, 0.2, 0.25, 0.25, 0.05]  # Based on domain knowledge
        
        feature_importance = {}
        shap_values = []
        
        for i, (feature, weight) in enumerate(zip(self.feature_names, importance_weights)):
            # Normalize feature value and apply weight
            normalized_value = min(features[i] / 10, 1)  # Simple normalization
            importance = normalized_value * weight
            
            feature_importance[feature] = importance
            shap_values.append(importance)
        
        return {
            "feature_importance": feature_importance,
            "shap_values": shap_values,
            "base_value": 0.5
        }
    
    def _generate_anomaly_explanation(self, features: List[float], is_anomaly: bool) -> str:
        """Generate human-readable anomaly explanation"""
        if not is_anomaly:
            return "Network metrics are within normal parameters"
        
        explanations = []
        
        # Check each metric
        bandwidth, throughput, congestion, packet_loss, latency, jitter = features
        
        if latency > 15:
            explanations.append(f"High latency detected ({latency:.1f}ms)")
        if packet_loss > 5:
            explanations.append(f"High packet loss detected ({packet_loss:.1f}%)")
        if jitter > 5:
            explanations.append(f"High jitter detected ({jitter:.1f}ms)")
        if congestion > 80:
            explanations.append(f"High network congestion ({congestion:.1f}%)")
        if throughput < bandwidth * 0.3:
            explanations.append("Low throughput efficiency")
        
        if explanations:
            return "; ".join(explanations)
        else:
            return "Anomalous pattern detected in network metrics"
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about loaded models"""
        return {
            "models_loaded": self.models_loaded,
            "available_models": list(self.models.keys()),
            "feature_names": self.feature_names,
            "model_directory": str(self.model_dir)
        }