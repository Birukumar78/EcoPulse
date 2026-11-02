from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
import schemas
from database import engine, get_db

# Database tables create karna
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EcoPulse API",
    version="1.0",
    description="Track 1: Green Energy & Sustainability - Mission LiFE Engagement, Citizen Energy Tracking, and Gamified Carbon Footprint Platform"
)

# CORS setup taaki Next.js frontend connect ho sake
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to EcoPulse API - Track Green Energy & Mission LiFE!"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "track": "Green Energy & Sustainability"}

# 1. Energy Log Endpoints (Citizen Energy Tracking)
@app.post("/energy-logs/", response_model=schemas.EnergyLogResponse, tags=["Citizen Energy Tracking"])
def create_energy_log(log: schemas.EnergyLogCreate, db: Session = Depends(get_db)):
    db_log = models.EnergyLog(device_name=log.device_name, power_consumed_kwh=log.power_consumed_kwh)
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@app.get("/energy-logs/", response_model=list[schemas.EnergyLogResponse], tags=["Citizen Energy Tracking"])
def get_energy_logs(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return db.query(models.EnergyLog).offset(skip).limit(limit).all()

@app.delete("/energy-logs/{log_id}", tags=["Citizen Energy Tracking"])
def delete_energy_log(log_id: int, db: Session = Depends(get_db)):
    log = db.query(models.EnergyLog).filter(models.EnergyLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Energy log not found")
    db.delete(log)
    db.commit()
    return {"message": "Energy log deleted successfully"}

# 2. Mission LiFE Task Endpoints (Mission LiFE Engagement Tools)
@app.post("/mission-tasks/", response_model=schemas.MissionLifeTaskResponse, tags=["Mission LiFE Engagement"])
def create_mission_task(task: schemas.MissionLifeTaskCreate, db: Session = Depends(get_db)):
    db_task = models.MissionLifeTask(task_name=task.task_name, category=task.category, reward_points=task.reward_points)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.get("/mission-tasks/", response_model=list[schemas.MissionLifeTaskResponse], tags=["Mission LiFE Engagement"])
def get_mission_tasks(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return db.query(models.MissionLifeTask).offset(skip).limit(limit).all()

@app.delete("/mission-tasks/{task_id}", tags=["Mission LiFE Engagement"])
def delete_mission_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.MissionLifeTask).filter(models.MissionLifeTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Mission task not found")
    db.delete(task)
    db.commit()
    return {"message": "Mission task deleted successfully"}

# 3. Gamified Carbon Footprint & Leaderboard Endpoints
@app.get("/carbon-stats/", tags=["Gamified Carbon Footprint"])
def get_carbon_stats(db: Session = Depends(get_db)):
    total_kwh = db.query(func.sum(models.EnergyLog.power_consumed_kwh)).scalar() or 0.0
    total_points = db.query(func.sum(models.MissionLifeTask.reward_points)).scalar() or 0

    # India grid average emission factor: ~0.82 kg CO2 per kWh
    gross_co2_kg = round(total_kwh * 0.82, 2)
    # Estimate CO2 offset through Mission LiFE actions (0.05 kg CO2 saved per point)
    co2_offset_kg = round(total_points * 0.05, 2)
    net_co2_kg = round(max(0.0, gross_co2_kg - co2_offset_kg), 2)

    if total_points >= 200:
        badge = "🌍 LiFE Ambassador"
        next_milestone = 500
    elif total_points >= 100:
        badge = "🏆 Eco Champion"
        next_milestone = 200
    elif total_points >= 50:
        badge = "🌿 Green Guardian"
        next_milestone = 100
    else:
        badge = "🌱 Eco Beginner"
        next_milestone = 50

    return {
        "total_energy_kwh": round(total_kwh, 2),
        "gross_carbon_footprint_kg": gross_co2_kg,
        "carbon_offset_kg": co2_offset_kg,
        "net_carbon_footprint_kg": net_co2_kg,
        "total_eco_points": total_points,
        "current_badge": badge,
        "next_milestone_points": next_milestone
    }

@app.get("/leaderboard/", tags=["Gamified Carbon Footprint"])
def get_leaderboard(db: Session = Depends(get_db)):
    user_points = db.query(func.sum(models.MissionLifeTask.reward_points)).scalar() or 0
    user_co2_saved = round(user_points * 0.05, 2)

    competitors = [
        {"name": "Aarav Sharma", "eco_points": 240, "co2_saved_kg": 12.0, "badge": "🌍 LiFE Ambassador"},
        {"name": "Priya Patel", "eco_points": 165, "co2_saved_kg": 8.25, "badge": "🏆 Eco Champion"},
        {"name": "Rohan Verma", "eco_points": 90, "co2_saved_kg": 4.5, "badge": "🌿 Green Guardian"},
        {
            "name": "You (Current Citizen)",
            "eco_points": user_points,
            "co2_saved_kg": user_co2_saved,
            "badge": "🏆 Eco Champion" if user_points >= 100 else ("🌿 Green Guardian" if user_points >= 50 else "🌱 Eco Beginner")
        },
    ]

    sorted_board = sorted(competitors, key=lambda x: x["eco_points"], reverse=True)
    for idx, entry in enumerate(sorted_board):
        entry["rank"] = idx + 1

    return sorted_board