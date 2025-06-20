"""
Machine Learning model training for SLA violation prediction and anomaly detection
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import xgboost as xgb
import joblib
import shap
import logging
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MLTrainer:
    """Machine Learning trainer for SLA prediction and anomaly detection"""
    
    def __init__(self, data_path: str = "network_dataset.csv"):
        self.data_path = data_path
        self.models = {}
        self.scalers = {}
        self.feature_names = [
            'bandwidth', 'throughput', 'congestion', 
            'packet_loss', 'latency', 'jitter'
        ]
        
    def load_and_prepare_data(self):
        """Load and prepare the dataset"""
        logger.info("Loading dataset...")
        
        # Load the dataset
        df = pd.read_csv(self.data_path)
        logger.info(f"Loaded {len(df)} records")
        
        # Generate synthetic SLA violation labels based on network conditions
        df['sla_violation'] = self._generate_sla_labels(df)
        
        # Prepare features
        X = df[self.feature_names].copy()
        y = df['sla_violation']
        
        # Handle missing values
        X = X.fillna(X.mean())
        
        logger.info(f"Features shape: {X.shape}")
        logger.info(f"SLA violation rate: {y.mean():.2%}")
        
        return X, y, df
    
    def _generate_sla_labels(self, df):
        """Generate synthetic SLA violation labels based on network conditions"""
        # Define SLA violation conditions
        conditions = (
            (df['latency'] > 15) |  # High latency
            (df['packet_loss'] > 5) |  # High packet loss
            (df['jitter'] > 3) |  # High jitter
            (df['congestion'] > 80) |  # High congestion
            ((df['throughput'] / df['bandwidth']) < 0.3)  # Low utilization efficiency
        )
        
        # Add some randomness to make it more realistic
        random_factor = np.random.random(len(df)) < 0.1  # 10% random violations
        
        return (conditions | random_factor).astype(int)
    
    def train_models(self, X, y):
        """Train multiple models and select the best one"""
        logger.info("Training models...")
        
        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        self.scalers['standard'] = scaler
        
        # Train Random Forest (baseline)
        logger.info("Training Random Forest...")
        rf_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            class_weight='balanced'
        )
        rf_model.fit(X_train, y_train)
        rf_score = roc_auc_score(y_test, rf_model.predict_proba(X_test)[:, 1])
        logger.info(f"Random Forest AUC: {rf_score:.4f}")
        
        # Train XGBoost (production model)
        logger.info("Training XGBoost...")
        xgb_model = xgb.XGBClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            random_state=42,
            eval_metric='logloss'
        )
        xgb_model.fit(X_train, y_train)
        xgb_score = roc_auc_score(y_test, xgb_model.predict_proba(X_test)[:, 1])
        logger.info(f"XGBoost AUC: {xgb_score:.4f}")
        
        # Select best model
        if xgb_score > rf_score:
            best_model = xgb_model
            best_score = xgb_score
            model_name = "XGBoost"
        else:
            best_model = rf_model
            best_score = rf_score
            model_name = "RandomForest"
        
        logger.info(f"Best model: {model_name} with AUC: {best_score:.4f}")
        
        # Store models
        self.models['sla_predictor'] = best_model
        self.models['rf_baseline'] = rf_model
        self.models['xgb_production'] = xgb_model
        
        # Generate detailed evaluation
        self._evaluate_model(best_model, X_test, y_test, model_name)
        
        # Train anomaly detection model
        self._train_anomaly_detector(X_train_scaled)
        
        # Generate SHAP explainer
        self._create_shap_explainer(best_model, X_train)
        
        return best_model, best_score
    
    def _train_anomaly_detector(self, X_train_scaled):
        """Train Isolation Forest for anomaly detection"""
        logger.info("Training Isolation Forest for anomaly detection...")
        
        # Train Isolation Forest
        iso_forest = IsolationForest(
            contamination=0.1,  # Expect 10% anomalies
            random_state=42,
            n_estimators=100
        )
        iso_forest.fit(X_train_scaled)
        
        self.models['anomaly_detector'] = iso_forest
        logger.info("Anomaly detector trained successfully")
    
    def _create_shap_explainer(self, model, X_train):
        """Create SHAP explainer for model interpretability"""
        logger.info("Creating SHAP explainer...")
        
        try:
            # Create explainer based on model type
            if hasattr(model, 'predict_proba'):
                explainer = shap.TreeExplainer(model)
                shap_values = explainer.shap_values(X_train.iloc[:100])  # Sample for efficiency
                
                self.models['shap_explainer'] = explainer
                logger.info("SHAP explainer created successfully")
            else:
                logger.warning("Model doesn't support SHAP explanation")
        except Exception as e:
            logger.error(f"Failed to create SHAP explainer: {e}")
    
    def _evaluate_model(self, model, X_test, y_test, model_name):
        """Evaluate model performance"""
        logger.info(f"Evaluating {model_name}...")
        
        # Predictions
        y_pred = model.predict(X_test)
        y_pred_proba = model.predict_proba(X_test)[:, 1] if hasattr(model, 'predict_proba') else None
        
        # Metrics
        logger.info(f"\n{model_name} Classification Report:")
        logger.info(f"\n{classification_report(y_test, y_pred)}")
        
        if y_pred_proba is not None:
            auc_score = roc_auc_score(y_test, y_pred_proba)
            logger.info(f"AUC Score: {auc_score:.4f}")
        
        # Feature importance
        if hasattr(model, 'feature_importances_'):
            importance_df = pd.DataFrame({
                'feature': self.feature_names,
                'importance': model.feature_importances_
            }).sort_values('importance', ascending=False)
            
            logger.info(f"\n{model_name} Feature Importance:")
            for _, row in importance_df.iterrows():
                logger.info(f"{row['feature']}: {row['importance']:.4f}")
    
    def save_models(self, model_dir: str = "models"):
        """Save trained models and scalers"""
        model_path = Path(model_dir)
        model_path.mkdir(exist_ok=True)
        
        logger.info(f"Saving models to {model_path}...")
        
        # Save models
        for name, model in self.models.items():
            if model is not None:
                joblib.dump(model, model_path / f"{name}.pkl")
                logger.info(f"Saved {name}")
        
        # Save scalers
        for name, scaler in self.scalers.items():
            joblib.dump(scaler, model_path / f"scaler_{name}.pkl")
            logger.info(f"Saved scaler_{name}")
        
        # Save feature names
        joblib.dump(self.feature_names, model_path / "feature_names.pkl")
        
        logger.info("All models saved successfully")
    
    def hyperparameter_tuning(self, X, y):
        """Perform hyperparameter tuning for XGBoost"""
        logger.info("Performing hyperparameter tuning...")
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # XGBoost parameter grid
        param_grid = {
            'n_estimators': [50, 100, 200],
            'max_depth': [3, 6, 9],
            'learning_rate': [0.01, 0.1, 0.2],
            'subsample': [0.8, 0.9, 1.0]
        }
        
        xgb_model = xgb.XGBClassifier(random_state=42, eval_metric='logloss')
        
        grid_search = GridSearchCV(
            xgb_model,
            param_grid,
            cv=3,
            scoring='roc_auc',
            n_jobs=-1,
            verbose=1
        )
        
        grid_search.fit(X_train, y_train)
        
        logger.info(f"Best parameters: {grid_search.best_params_}")
        logger.info(f"Best cross-validation score: {grid_search.best_score_:.4f}")
        
        return grid_search.best_estimator_

def main():
    """Main training pipeline"""
    logger.info("Starting ML training pipeline...")
    
    # Initialize trainer
    trainer = MLTrainer("network_dataset.csv")
    
    # Load and prepare data
    X, y, df = trainer.load_and_prepare_data()
    
    # Train models
    best_model, best_score = trainer.train_models(X, y)
    
    # Optional: Hyperparameter tuning
    # tuned_model = trainer.hyperparameter_tuning(X, y)
    
    # Save models
    trainer.save_models()
    
    logger.info("Training pipeline completed successfully!")
    logger.info(f"Best model AUC: {best_score:.4f}")

if __name__ == "__main__":
    main()