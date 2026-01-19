"""
Solana Token Rug Pull Prediction Microservice
FastAPI-based ML microservice untuk memprediksi probabilitas rug pull

Author: Senior ML Engineer
Date: 2024
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import numpy as np
from datetime import datetime

# Initialize FastAPI app
app = FastAPI(
    title="Solana Rug Pull Predictor",
    description="ML-powered API untuk prediksi rug pull token Solana",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class TokenFeatures(BaseModel):
    """Input features untuk prediksi"""
    liquidity_usd: float = Field(..., description="Liquidity dalam USD", ge=0)
    market_cap_usd: float = Field(..., description="Market cap dalam USD", ge=0)
    age_hours: float = Field(..., description="Umur token dalam jam", ge=0)
    mint_auth_active: int = Field(..., description="Mint authority status (0=revoked, 1=active)", ge=0, le=1)
    freeze_auth_active: int = Field(..., description="Freeze authority status (0=disabled, 1=active)", ge=0, le=1)
    top_10_holder_percentage: float = Field(..., description="Persentase supply di top 10 holders", ge=0, le=100)
    transaction_count_1h: int = Field(..., description="Jumlah transaksi dalam 1 jam terakhir", ge=0)
    metadata_mutable: int = Field(0, description="Metadata mutable (0=immutable, 1=mutable)", ge=0, le=1)
    developer_rug_count: int = Field(0, description="Jumlah rug pull developer di masa lalu", ge=0)
    liquidity_locked: int = Field(0, description="LP locked (0=no, 1=yes)", ge=0, le=1)

    class Config:
        json_schema_extra = {
            "example": {
                "liquidity_usd": 50000.0,
                "market_cap_usd": 500000.0,
                "age_hours": 48.0,
                "mint_auth_active": 0,
                "freeze_auth_active": 0,
                "top_10_holder_percentage": 35.5,
                "transaction_count_1h": 120,
                "metadata_mutable": 0,
                "developer_rug_count": 0,
                "liquidity_locked": 1
            }
        }


class PredictionResponse(BaseModel):
    """Response model untuk prediksi"""
    rug_probability: float = Field(..., description="Probabilitas rug pull (0-100%)")
    risk_level: str = Field(..., description="Level risiko: Safe, Low, Medium, High, Critical")
    risk_factors: List[str] = Field(..., description="List faktor risiko yang terdeteksi")
    confidence_score: float = Field(..., description="Confidence score prediksi (0-100%)")
    recommendation: str = Field(..., description="Rekomendasi untuk user")
    timestamp: str = Field(..., description="Timestamp prediksi")


# ============================================================================
# RUG PULL PREDICTION ENGINE
# ============================================================================

class RugPullPredictor:
    """
    Rule-based Weighted Scoring System untuk prediksi rug pull

    Architecture:
    - Feature engineering dengan weighted scoring
    - Multi-factor risk assessment
    - Configurable weights untuk tuning
    - Ready untuk ML model replacement
    """

    def __init__(self):
        # Weight configuration untuk setiap faktor
        self.weights = {
            'liquidity': 0.25,
            'authorities': 0.30,
            'holder_concentration': 0.20,
            'developer_history': 0.15,
            'token_age': 0.10,
        }

    def predict(self, features: TokenFeatures) -> PredictionResponse:
        """
        Main prediction function

        Args:
            features: TokenFeatures object dengan data token

        Returns:
            PredictionResponse dengan probabilitas dan analisis
        """
        risk_factors = []
        risk_scores = {}

        # 1. LIQUIDITY RISK (Weight: 25%)
        liquidity_risk, liquidity_factors = self._analyze_liquidity(
            features.liquidity_usd,
            features.market_cap_usd,
            features.liquidity_locked
        )
        risk_scores['liquidity'] = liquidity_risk
        risk_factors.extend(liquidity_factors)

        # 2. AUTHORITY RISK (Weight: 30%)
        authority_risk, authority_factors = self._analyze_authorities(
            features.mint_auth_active,
            features.freeze_auth_active,
            features.metadata_mutable
        )
        risk_scores['authorities'] = authority_risk
        risk_factors.extend(authority_factors)

        # 3. HOLDER CONCENTRATION RISK (Weight: 20%)
        holder_risk, holder_factors = self._analyze_holder_concentration(
            features.top_10_holder_percentage
        )
        risk_scores['holder_concentration'] = holder_risk
        risk_factors.extend(holder_factors)

        # 4. DEVELOPER HISTORY RISK (Weight: 15%)
        dev_risk, dev_factors = self._analyze_developer_history(
            features.developer_rug_count
        )
        risk_scores['developer_history'] = dev_risk
        risk_factors.extend(dev_factors)

        # 5. TOKEN AGE RISK (Weight: 10%)
        age_risk, age_factors = self._analyze_token_age(
            features.age_hours,
            features.transaction_count_1h
        )
        risk_scores['token_age'] = age_risk
        risk_factors.extend(age_factors)

        # Calculate weighted final score
        rug_probability = self._calculate_weighted_score(risk_scores)

        # Determine risk level
        risk_level = self._determine_risk_level(rug_probability)

        # Calculate confidence
        confidence_score = self._calculate_confidence(features, risk_scores)

        # Generate recommendation
        recommendation = self._generate_recommendation(risk_level, rug_probability)

        return PredictionResponse(
            rug_probability=round(rug_probability, 2),
            risk_level=risk_level,
            risk_factors=risk_factors,
            confidence_score=round(confidence_score, 2),
            recommendation=recommendation,
            timestamp=datetime.utcnow().isoformat()
        )

    def _analyze_liquidity(self, liquidity_usd: float, market_cap_usd: float,
                          liquidity_locked: int) -> tuple[float, List[str]]:
        """Analyze liquidity risk"""
        risk = 0.0
        factors = []

        # Low liquidity is HIGH RISK
        if liquidity_usd < 1000:
            risk += 80.0
            factors.append("💀 CRITICAL: Liquidity < $1,000 - Extremely dangerous")
        elif liquidity_usd < 10000:
            risk += 60.0
            factors.append("⚠️ Very low liquidity (< $10k)")
        elif liquidity_usd < 50000:
            risk += 30.0
            factors.append("⚠️ Low liquidity (< $50k)")

        # Liquidity to Market Cap ratio
        if market_cap_usd > 0:
            liq_ratio = (liquidity_usd / market_cap_usd) * 100
            if liq_ratio < 1:
                risk += 40.0
                factors.append(f"⚠️ Very low liquidity/mcap ratio ({liq_ratio:.2f}%)")
            elif liq_ratio < 5:
                risk += 20.0
                factors.append(f"⚠️ Low liquidity/mcap ratio ({liq_ratio:.2f}%)")

        # LP locked status
        if liquidity_locked == 0:
            risk += 30.0
            factors.append("🔓 Liquidity NOT locked - Can be removed anytime")
        else:
            risk = max(0, risk - 20.0)  # Bonus for locked LP
            factors.append("✅ Liquidity is locked")

        return min(risk, 100.0), factors

    def _analyze_authorities(self, mint_active: int, freeze_active: int,
                           metadata_mutable: int) -> tuple[float, List[str]]:
        """Analyze authority risk"""
        risk = 0.0
        factors = []

        # Mint Authority - CRITICAL RISK
        if mint_active == 1:
            risk += 70.0
            factors.append("💀 CRITICAL: Mint authority ACTIVE - Can print unlimited tokens")
        else:
            factors.append("✅ Mint authority revoked")

        # Freeze Authority
        if freeze_active == 1:
            risk += 40.0
            factors.append("⚠️ Freeze authority ACTIVE - Can freeze your tokens")
        else:
            factors.append("✅ Freeze authority disabled")

        # Metadata mutable
        if metadata_mutable == 1:
            risk += 15.0
            factors.append("⚠️ Metadata is mutable - Name/symbol can change")

        return min(risk, 100.0), factors

    def _analyze_holder_concentration(self, top_10_pct: float) -> tuple[float, List[str]]:
        """Analyze holder concentration risk"""
        risk = 0.0
        factors = []

        # Whale concentration
        if top_10_pct > 80:
            risk += 80.0
            factors.append(f"💀 CRITICAL: Top 10 holders own {top_10_pct:.1f}% - Extreme concentration")
        elif top_10_pct > 60:
            risk += 60.0
            factors.append(f"⚠️ High concentration: Top 10 holders own {top_10_pct:.1f}%")
        elif top_10_pct > 40:
            risk += 35.0
            factors.append(f"⚠️ Moderate concentration: Top 10 holders own {top_10_pct:.1f}%")
        elif top_10_pct > 25:
            risk += 15.0
            factors.append(f"⚠️ Some concentration: Top 10 holders own {top_10_pct:.1f}%")
        else:
            factors.append(f"✅ Good distribution: Top 10 holders own {top_10_pct:.1f}%")

        return min(risk, 100.0), factors

    def _analyze_developer_history(self, rug_count: int) -> tuple[float, List[str]]:
        """Analyze developer history"""
        risk = 0.0
        factors = []

        if rug_count >= 3:
            risk += 100.0
            factors.append(f"💀 CRITICAL: Developer has {rug_count} rugged projects - SERIAL SCAMMER")
        elif rug_count == 2:
            risk += 70.0
            factors.append(f"⚠️ Developer has {rug_count} rugged projects - High risk")
        elif rug_count == 1:
            risk += 40.0
            factors.append(f"⚠️ Developer has 1 rugged project")
        else:
            factors.append("✅ Clean developer history")

        return min(risk, 100.0), factors

    def _analyze_token_age(self, age_hours: float, tx_count_1h: int) -> tuple[float, List[str]]:
        """Analyze token age and activity"""
        risk = 0.0
        factors = []

        # Very new tokens with low activity are suspicious
        if age_hours < 1:
            risk += 50.0
            factors.append("⚠️ Brand new token (< 1 hour old) - Extremely risky")
        elif age_hours < 6:
            risk += 30.0
            factors.append("⚠️ Very new token (< 6 hours)")
        elif age_hours < 24:
            risk += 15.0
            factors.append("⚠️ New token (< 24 hours)")

        # Low transaction count is suspicious
        if tx_count_1h < 10:
            risk += 20.0
            factors.append(f"⚠️ Very low activity ({tx_count_1h} tx/hour)")
        elif tx_count_1h < 50:
            risk += 10.0
            factors.append(f"⚠️ Low activity ({tx_count_1h} tx/hour)")

        # Established tokens get bonus
        if age_hours > 168:  # 1 week
            risk = max(0, risk - 15.0)
            factors.append(f"✅ Established token ({age_hours/24:.1f} days old)")

        return min(risk, 100.0), factors

    def _calculate_weighted_score(self, risk_scores: dict) -> float:
        """Calculate weighted average risk score"""
        total_score = 0.0

        for category, score in risk_scores.items():
            weight = self.weights.get(category, 0.0)
            total_score += score * weight

        return min(total_score, 100.0)

    def _determine_risk_level(self, probability: float) -> str:
        """Determine risk level from probability"""
        if probability >= 70:
            return "Critical"
        elif probability >= 50:
            return "High"
        elif probability >= 30:
            return "Medium"
        elif probability >= 15:
            return "Low"
        else:
            return "Safe"

    def _calculate_confidence(self, features: TokenFeatures,
                            risk_scores: dict) -> float:
        """Calculate confidence score untuk prediksi"""
        confidence = 70.0  # Base confidence

        # Higher confidence jika data lengkap
        if features.developer_rug_count > 0:
            confidence += 15.0

        if features.liquidity_usd > 10000:
            confidence += 10.0

        if features.age_hours > 24:
            confidence += 5.0

        return min(confidence, 100.0)

    def _generate_recommendation(self, risk_level: str, probability: float) -> str:
        """Generate user recommendation"""
        if risk_level == "Critical":
            return "🚨 DO NOT INVEST. This token shows multiple critical red flags. Extremely high probability of rug pull."
        elif risk_level == "High":
            return "⚠️ AVOID. High risk of rug pull detected. Not recommended for investment."
        elif risk_level == "Medium":
            return "⚠️ PROCEED WITH CAUTION. Moderate risk detected. Only invest what you can afford to lose."
        elif risk_level == "Low":
            return "✅ RELATIVELY SAFE. Low risk detected, but always DYOR before investing."
        else:
            return "✅ LOOKS GOOD. This token passes most safety checks. However, crypto is always risky - DYOR!"


# ============================================================================
# INITIALIZE PREDICTOR
# ============================================================================

predictor = RugPullPredictor()


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Solana Rug Pull Predictor",
        "status": "running",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "model": "Rule-based Weighted Scoring",
        "ready_for_ml": True,
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/predict_rug_score", response_model=PredictionResponse)
async def predict_rug_score(features: TokenFeatures):
    """
    Main prediction endpoint

    Menerima token features dan mengembalikan rug pull probability
    """
    try:
        prediction = predictor.predict(features)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/batch_predict")
async def batch_predict(tokens: List[TokenFeatures]):
    """
    Batch prediction endpoint

    Predict multiple tokens at once
    """
    try:
        predictions = []
        for token_features in tokens:
            prediction = predictor.predict(token_features)
            predictions.append(prediction)

        return {
            "predictions": predictions,
            "count": len(predictions),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
