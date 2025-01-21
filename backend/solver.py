from pydantic import BaseModel
from typing import List, Dict, Union
from pulp import *
import time

class ProductionInput(BaseModel):
    customers: List[str]
    machines: List[str]
    specifications: List[str]
    demands: List[Dict[str, Union[str, float]]]
    machine_capacity_per_hour: Dict[str, float]
    cleaning_time: float  # hours needed for cleaning between spec changes
    hours_per_day: int  # total available hours
    changeover_cost: float
    min_run_time: int = 2
    shift_start_hour: int = 0  # when shift starts
    shift_end_hour: int = 24   # when shift ends

class ProductionScheduleEntry(BaseModel):
    customer: str
    machine: str
    hour: int
    quantity: float
    spec: str

class ChangeoverEntry(BaseModel):
    machine: str
    hour: int
    from_spec: str
    to_spec: str

class SchedulingResult(BaseModel):
    objective_value: float
    schedule: List[ProductionScheduleEntry]
    changeovers: List[ChangeoverEntry]
    computation_time: float
    status: str

def solve_production_schedule(input_data: ProductionInput) -> SchedulingResult:
    start_time = time.time()
    
    # Create the optimization problem
    prob = LpProblem("Production_Scheduling", LpMinimize)
    
    # Time periods (only during working hours)
    working_hours = range(input_data.shift_start_hour, input_data.shift_end_hour)
    
    # Production variables
    x = pulp.LpVariable.dicts(
        "production",
        ((c, m, h, s) 
         for c in input_data.customers 
         for m in input_data.machines 
         for h in working_hours 
         for s in input_data.specifications),
        cat='Binary'
    )
    
    # Changeover variables
    y = pulp.LpVariable.dicts(
        "changeover",
        ((m, h) for m in input_data.machines for h in working_hours[:-1]),
        cat='Binary'
    )

    # Objective: Minimize number of changeovers
    prob += lpSum(y[m, h] for m in input_data.machines for h in working_hours[:-1])

    # Constraints:
    # 1. One product per machine per hour during working hours
    for m in input_data.machines:
        for h in working_hours:
            prob += lpSum(x[c, m, h, s] 
                        for c in input_data.customers 
                        for s in input_data.specifications) <= 1

    # 2. Meet demand requirements
    for demand in input_data.demands:
        customer = demand["customer"]
        spec = demand["spec"]
        quantity = float(demand["quantity"])
        prob += lpSum(x[customer, m, h, spec] * input_data.machine_capacity_per_hour[m]
                    for m in input_data.machines
                    for h in working_hours) >= quantity

    # 3. Detect changeovers and enforce cleaning time
    for m in input_data.machines:
        for h in working_hours[:-1]:
            # Detect spec changes
            for s1 in input_data.specifications:
                for s2 in input_data.specifications:
                    if s1 != s2:
                        prob += y[m, h] >= (
                            lpSum(x[c, m, h, s1] for c in input_data.customers) +
                            lpSum(x[c, m, h+1, s2] for c in input_data.customers) - 1
                        )
            
            # Enforce cleaning time after changeover
            cleaning_hours = int(input_data.cleaning_time)
            for t in range(1, min(cleaning_hours + 1, len(working_hours) - h)):
                prob += lpSum(x[c, m, h+t, s] 
                            for c in input_data.customers 
                            for s in input_data.specifications) <= (1 - y[m, h])

    # Solve the problem
    prob.solve(PULP_CBC_CMD(msg=False))
    
    # Extract schedule
    schedule = []
    for c in input_data.customers:
        for m in input_data.machines:
            for h in working_hours:
                for s in input_data.specifications:
                    if value(x[c, m, h, s]) > 0.5:
                        schedule.append(ProductionScheduleEntry(
                            customer=c,
                            machine=m,
                            hour=h,
                            quantity=input_data.machine_capacity_per_hour[m],
                            spec=s
                        ))

    # Extract changeovers
    changeovers = []
    for m in input_data.machines:
        for h in working_hours[:-1]:
            if value(y[m, h]) > 0.5:
                # Find the specs before and after the changeover
                spec_before = None
                spec_after = None
                for c in input_data.customers:
                    for s in input_data.specifications:
                        if value(x[c, m, h, s]) > 0.5:
                            spec_before = s
                        if value(x[c, m, h+1, s]) > 0.5:
                            spec_after = s
                if spec_before and spec_after:
                    changeovers.append(ChangeoverEntry(
                        machine=m,
                        hour=h,
                        from_spec=spec_before,
                        to_spec=spec_after
                    ))

    computation_time = time.time() - start_time

    return SchedulingResult(
        objective_value=value(prob.objective),
        schedule=schedule,
        changeovers=changeovers,
        computation_time=computation_time,
        status=LpStatus[prob.status]
    )