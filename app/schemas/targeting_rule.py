from pydantic import BaseModel


class TargetingRuleCreate(BaseModel):
    flag_id: int
    rule_type: str
    rule_value: str


class TargetingRuleResponse(BaseModel):
    id: int
    flag_id: int
    rule_type: str
    rule_value: str

    class Config:
        from_attributes = True