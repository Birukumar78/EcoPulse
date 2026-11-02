from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from database import Base

class EnergyLog(Base):
    __tablename__ = "energy_logs"

    id = Column(Integer, primary_key=True, index=True)
    device_name = Column(String, index=True)
    power_consumed_kwh = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
   
class MissionLifeTask(Base):
    __tablename__ = "mission_life_tasks"

    id = Column(Integer, primary_key=True, index=True)
    task_name = Column(String, index=True)
    category = Column(String)  # e.g., Water Saving, Energy Efficiency
    reward_points = Column(Integer)
    is_completed = Column(Integer, default=0) # 0 for pending, 1 for completed