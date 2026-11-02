from pydantic import BaseModel, Field

class EnergyLogCreate(BaseModel):
    device_name: str = Field(..., min_length=2, max_length=100, description="Name of the electrical appliance")
    power_consumed_kwh: float = Field(..., gt=0, description="Power consumed in kWh (must be greater than 0)")

class EnergyLogResponse(EnergyLogCreate):
    id: int

    class Config:
        from_attributes = True

class MissionLifeTaskCreate(BaseModel):
    task_name: str = Field(..., min_length=3, max_length=150, description="Mission LiFE eco-action completed")
    category: str = Field(..., min_length=3, max_length=50)
    reward_points: int = Field(..., gt=0, le=500, description="Eco points between 1 and 500")

class MissionLifeTaskResponse(MissionLifeTaskCreate):
    id: int

    class Config:
        from_attributes = True