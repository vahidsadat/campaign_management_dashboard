from pydantic import BaseModel, Field, field_validator
from typing import Optional
from enum import Enum
from uuid import UUID, uuid4

class Platform(str, Enum):
    ios = "ios"
    android = "android"

class Status(str, Enum):
    active = "active"
    paused = "paused"

class CampaignModel( BaseModel ):
    id : UUID = Field(default_factory=uuid4)
    campaign_name : str
    client: str
    country_code: str = Field(min_length=2, max_length=2)
    platform: Platform
    daily_budget: float = Field(gt=0)
    bid: float = Field(gt=0)
    thumbnail: str
    status: Status = Status.active

    @field_validator('bid')
    @classmethod
    def validate_bid(cls, bid: float, class_info):
        if ("daily_budget" in class_info.data) and (bid>class_info.data["daily_budget"]):
            raise ValueError("bid must be less that daily budget")
        return bid

class CampaignModelUpdate( BaseModel ):
    campaign_name : Optional[str] = None
    client: Optional[str] = None
    country_code: Optional[str] = None
    daily_budget: Optional[float] = None
    bid:  Optional[float] = None
    thumbnail: Optional[str] = None

    
