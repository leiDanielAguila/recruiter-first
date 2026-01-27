from pydantic import BaseModel
from typing import List


class HealthCheckResponse(BaseModel):
    """Health check response model"""
    status: str
    message: str


class WelcomeResponse(BaseModel):
    """Welcome message response model"""
    name: str
    version: str
    description: str
    endpoints: List[str]
