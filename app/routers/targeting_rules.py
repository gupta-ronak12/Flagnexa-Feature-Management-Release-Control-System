from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.targeting_rule import TargetingRule
from app.models.feature_flag import FeatureFlag
from app.schemas.targeting_rule import (
    TargetingRuleCreate,
    TargetingRuleResponse
)


router = APIRouter(
    prefix="/targeting-rules",
    tags=["Targeting Rules"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Create a targeting rule
@router.post("/", response_model=TargetingRuleResponse)
def create_targeting_rule(
    data: TargetingRuleCreate,
    db: Session = Depends(get_db)
):
    flag = db.query(FeatureFlag).filter(
        FeatureFlag.id == data.flag_id
    ).first()

    if not flag:
        raise HTTPException(
            status_code=404,
            detail="Feature flag not found"
        )

    rule = TargetingRule(
        flag_id=data.flag_id,
        rule_type=data.rule_type,
        rule_value=data.rule_value
    )

    db.add(rule)
    db.commit()
    db.refresh(rule)

    return rule


# Get all targeting rules
@router.get("/", response_model=list[TargetingRuleResponse])
def get_targeting_rules(
    db: Session = Depends(get_db)
):
    return db.query(TargetingRule).all()


# Get targeting rules for a specific flag
@router.get(
    "/flag/{flag_id}",
    response_model=list[TargetingRuleResponse]
)
def get_flag_targeting_rules(
    flag_id: int,
    db: Session = Depends(get_db)
):
    flag = db.query(FeatureFlag).filter(
        FeatureFlag.id == flag_id
    ).first()

    if not flag:
        raise HTTPException(
            status_code=404,
            detail="Feature flag not found"
        )

    return db.query(TargetingRule).filter(
        TargetingRule.flag_id == flag_id
    ).all()


# Get a single targeting rule
@router.get(
    "/{rule_id}",
    response_model=TargetingRuleResponse
)
def get_targeting_rule(
    rule_id: int,
    db: Session = Depends(get_db)
):
    rule = db.query(TargetingRule).filter(
        TargetingRule.id == rule_id
    ).first()

    if not rule:
        raise HTTPException(
            status_code=404,
            detail="Targeting rule not found"
        )

    return rule


# Delete a targeting rule
@router.delete("/{rule_id}")
def delete_targeting_rule(
    rule_id: int,
    db: Session = Depends(get_db)
):
    rule = db.query(TargetingRule).filter(
        TargetingRule.id == rule_id
    ).first()

    if not rule:
        raise HTTPException(
            status_code=404,
            detail="Targeting rule not found"
        )

    db.delete(rule)
    db.commit()

    return {
        "message": "Targeting rule deleted successfully"
    }