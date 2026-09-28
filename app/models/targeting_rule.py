from sqlalchemy import Column, Integer, String, ForeignKey
from app.database.database import Base


class TargetingRule(Base):
    __tablename__ = "targeting_rules"

    id = Column(Integer, primary_key=True, index=True)

    flag_id = Column(
        Integer,
        ForeignKey("feature_flags.id"),
        nullable=False
    )

    rule_type = Column(
        String(20),
        nullable=False
    )

    rule_value = Column(
        String(255),
        nullable=False
    )