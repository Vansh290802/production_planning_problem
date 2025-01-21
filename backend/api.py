from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from solver import ProductionInput, SchedulingResult, solve_production_schedule

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/v1/schedule", response_model=SchedulingResult)
async def create_schedule(input_data: ProductionInput):
    try:
        result = solve_production_schedule(input_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))