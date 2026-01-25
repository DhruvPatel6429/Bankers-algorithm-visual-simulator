from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


# ============================================
# Banker's Algorithm Models and Endpoints
# ============================================

class BankerState(BaseModel):
    """Banker's algorithm state representation"""
    numProcesses: int
    numResources: int
    allocation: List[List[int]]
    max: List[List[int]]
    available: List[int]
    need: Optional[List[List[int]]] = None
    safetyResult: Optional[Dict[str, Any]] = None

class ComparisonRequest(BaseModel):
    """Request to compare two banker states"""
    scenarioA: BankerState
    scenarioB: BankerState

class ComparisonMetrics(BaseModel):
    """Comparative metrics between two states"""
    utilization_a: float
    utilization_b: float
    utilization_diff: float
    safety_margin_a: float
    safety_margin_b: float
    safety_margin_diff: float
    resource_slack_a: float
    resource_slack_b: float
    resource_slack_diff: float
    is_safe_a: bool
    is_safe_b: bool
    total_divergence_score: float

class ValidationResult(BaseModel):
    """Validation result for banker state"""
    is_valid: bool
    errors: List[str]
    warnings: List[str]

class MistakeDetection(BaseModel):
    """Detected mistake with explanation"""
    mistake_type: str
    severity: str  # 'error', 'warning', 'info'
    location: str  # e.g., 'allocation[2][1]'
    message: str
    suggestion: str


@api_router.post("/banker/compare", response_model=ComparisonMetrics)
async def compare_banker_states(request: ComparisonRequest):
    """Compare two Banker's Algorithm states and return metrics"""
    
    def calculate_utilization(state: BankerState) -> float:
        """Calculate resource utilization efficiency"""
        total_allocated = sum(sum(row) for row in state.allocation)
        total_max = sum(sum(row) for row in state.max)
        return (total_allocated / total_max * 100) if total_max > 0 else 0.0
    
    def calculate_safety_margin(state: BankerState) -> float:
        """Calculate safety margin (available vs need)"""
        avg_available = sum(state.available) / state.numResources if state.numResources > 0 else 0
        
        # Calculate need if not provided
        need = state.need if state.need else [
            [state.max[i][j] - state.allocation[i][j] 
             for j in range(state.numResources)]
            for i in range(state.numProcesses)
        ]
        
        total_need = sum(sum(row) for row in need)
        avg_need = total_need / (state.numProcesses * state.numResources) if (state.numProcesses * state.numResources) > 0 else 0
        
        return (avg_available / avg_need * 100) if avg_need > 0 else 100.0
    
    def calculate_resource_slack(state: BankerState) -> float:
        """Calculate unused resource capacity"""
        total_available = sum(state.available)
        total_max = sum(sum(row) for row in state.max)
        return (total_available / total_max * 100) if total_max > 0 else 0.0
    
    # Calculate metrics for both states
    util_a = calculate_utilization(request.scenarioA)
    util_b = calculate_utilization(request.scenarioB)
    
    margin_a = calculate_safety_margin(request.scenarioA)
    margin_b = calculate_safety_margin(request.scenarioB)
    
    slack_a = calculate_resource_slack(request.scenarioA)
    slack_b = calculate_resource_slack(request.scenarioB)
    
    safe_a = request.scenarioA.safetyResult.get('isSafe', False) if request.scenarioA.safetyResult else False
    safe_b = request.scenarioB.safetyResult.get('isSafe', False) if request.scenarioB.safetyResult else False
    
    # Calculate divergence score (0-100, higher = more different)
    util_div = abs(util_b - util_a)
    margin_div = abs(margin_b - margin_a)
    slack_div = abs(slack_b - slack_a)
    safety_div = 50.0 if safe_a != safe_b else 0.0
    
    total_divergence = (util_div + margin_div + slack_div + safety_div) / 4.0
    
    return ComparisonMetrics(
        utilization_a=round(util_a, 2),
        utilization_b=round(util_b, 2),
        utilization_diff=round(util_b - util_a, 2),
        safety_margin_a=round(margin_a, 2),
        safety_margin_b=round(margin_b, 2),
        safety_margin_diff=round(margin_b - margin_a, 2),
        resource_slack_a=round(slack_a, 2),
        resource_slack_b=round(slack_b, 2),
        resource_slack_diff=round(slack_b - slack_a, 2),
        is_safe_a=safe_a,
        is_safe_b=safe_b,
        total_divergence_score=round(total_divergence, 2)
    )


@api_router.post("/banker/validate", response_model=List[MistakeDetection])
async def validate_banker_state(state: BankerState):
    """Validate a Banker's Algorithm state and detect common mistakes"""
    mistakes = []
    
    # Calculate need matrix
    need = [
        [state.max[i][j] - state.allocation[i][j] 
         for j in range(state.numResources)]
        for i in range(state.numProcesses)
    ]
    
    # Check 1: Allocation should not exceed Max
    for i in range(state.numProcesses):
        for j in range(state.numResources):
            if state.allocation[i][j] > state.max[i][j]:
                mistakes.append(MistakeDetection(
                    mistake_type="allocation_exceeds_max",
                    severity="error",
                    location=f"allocation[{i}][{j}]",
                    message=f"Process P{i} has allocated {state.allocation[i][j]} of resource R{j}, but max is {state.max[i][j]}",
                    suggestion=f"Set allocation[{i}][{j}] to a value ≤ {state.max[i][j]}"
                ))
    
    # Check 2: Need should not be negative
    for i in range(state.numProcesses):
        for j in range(state.numResources):
            if need[i][j] < 0:
                mistakes.append(MistakeDetection(
                    mistake_type="negative_need",
                    severity="error",
                    location=f"need[{i}][{j}]",
                    message=f"Process P{i} has negative need ({need[i][j]}) for resource R{j}",
                    suggestion=f"Reduce allocation[{i}][{j}] to match max[{i}][{j}]"
                ))
    
    # Check 3: Warn if available resources seem too low
    for j in range(state.numResources):
        total_need = sum(need[i][j] for i in range(state.numProcesses))
        if state.available[j] < total_need * 0.2:  # Less than 20% of total need
            mistakes.append(MistakeDetection(
                mistake_type="low_available_resources",
                severity="warning",
                location=f"available[{j}]",
                message=f"Resource R{j} availability ({state.available[j]}) is low compared to total need ({total_need})",
                suggestion="Consider increasing available resources or reducing process requirements"
            ))
    
    # Check 4: Warn if a process has zero max but non-zero allocation
    for i in range(state.numProcesses):
        for j in range(state.numResources):
            if state.max[i][j] == 0 and state.allocation[i][j] > 0:
                mistakes.append(MistakeDetection(
                    mistake_type="allocation_without_max",
                    severity="warning",
                    location=f"P{i}, R{j}",
                    message=f"Process P{i} has allocation but max is 0 for resource R{j}",
                    suggestion="Either increase max or reduce allocation to 0"
                ))
    
    # Check 5: Info if all processes have completed (allocation = max)
    all_completed = all(
        state.allocation[i][j] == state.max[i][j]
        for i in range(state.numProcesses)
        for j in range(state.numResources)
    )
    if all_completed:
        mistakes.append(MistakeDetection(
            mistake_type="all_processes_completed",
            severity="info",
            location="system",
            message="All processes have reached their maximum allocation",
            suggestion="System is at completion state. Consider terminating processes or starting new scenario."
        ))
    
    return mistakes