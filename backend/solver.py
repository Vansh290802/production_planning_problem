from pulp import *
import pandas as pd
from typing import Dict, List, Tuple

class OrderOptimizer:
    def __init__(self,
                 initial_orders: List[Dict],  # List of confirmed orders with specs
                 machines: List[str],
                 cleaning_time: float = 2.5):
        """
        Initialize optimizer with initial orders
        
        initial_orders format: [
            {
                'customer': 'A',
                'quantity': 50,
                'spec': 'Spec1',
                'deadline': 2  # days
            },
            ...
        ]
        """
        self.orders = initial_orders
        self.machines = machines
        self.cleaning_time = cleaning_time
        self.specs = list(set(order['spec'] for order in initial_orders))
        self.customers = list(set(order['customer'] for order in initial_orders))
        self.periods = range(24)  # 24 hours in a day
        
        self.model = LpProblem("Order_Optimization", LpMinimize)
        self.setup_variables()

    def setup_variables(self):
        """Setup decision variables"""
        # Production assignment variables
        self.X = LpVariable.dicts("production",
                                ((o['customer'], m, t) 
                                 for o in self.orders 
                                 for m in self.machines 
                                 for t in self.periods),
                                lowBound=0)
        
        # Machine setup variables (which spec is machine running)
        self.S = LpVariable.dicts("setup",
                                ((s, m, t) 
                                 for s in self.specs
                                 for m in self.machines 
                                 for t in self.periods),
                                cat='Binary')
        
        # Changeover variables
        self.C = LpVariable.dicts("changeover",
                                ((m, t) 
                                 for m in self.machines 
                                 for t in self.periods),
                                cat='Binary')

    def add_new_order(self, new_order: Dict):
        """
        Add a new order during ongoing production
        
        new_order format: {
            'customer': 'C',
            'quantity': 100,
            'spec': 'Spec2',
            'deadline': 1
        }
        """
        self.orders.append(new_order)
        if new_order['spec'] not in self.specs:
            self.specs.append(new_order['spec'])
        if new_order['customer'] not in self.customers:
            self.customers.append(new_order['customer'])
        
        # Reset and rebuild model with new order
        self.model = LpProblem("Order_Optimization", LpMinimize)
        self.setup_variables()

    def optimize_schedule(self):
        """Build and solve the optimization model"""
        # Objective: Minimize changeovers and completion time
        self.model += (
            lpSum(1000 * self.C[m,t] for m in self.machines for t in self.periods) +
            lpSum(t * self.X[o['customer'],m,t] 
                 for o in self.orders for m in self.machines for t in self.periods)
        )
        
        # Constraints
        
        # 1. Meet order quantities
        for order in self.orders:
            self.model += (
                lpSum(self.X[order['customer'],m,t] 
                     for m in self.machines for t in self.periods) == order['quantity']
            )
        
        # 2. Machine capacity (assuming 20 tons per hour max)
        for m in self.machines:
            for t in self.periods:
                self.model += (
                    lpSum(self.X[o['customer'],m,t] for o in self.orders) <= 20
                )
        
        # 3. Setup constraints
        for m in self.machines:
            for t in self.periods:
                # Only one spec per machine per period
                self.model += lpSum(self.S[s,m,t] for s in self.specs) <= 1
                
                # Link production to setup
                for order in self.orders:
                    self.model += (
                        self.X[order['customer'],m,t] <= 
                        1000 * self.S[order['spec'],m,t]
                    )
        
        # 4. Changeover detection
        for m in self.machines:
            for t in range(1, len(self.periods)):
                for s1 in self.specs:
                    for s2 in self.specs:
                        if s1 != s2:
                            self.model += (
                                self.S[s1,m,t-1] + self.S[s2,m,t] - 1 <= self.C[m,t]
                            )
        
        # 5. Cleaning time enforcement
        for m in self.machines:
            for t in self.periods:
                if t > 0:
                    # If changeover occurs, no production during cleaning time
                    for k in range(min(int(self.cleaning_time), len(self.periods)-t)):
                        self.model += (
                            lpSum(self.X[o['customer'],m,t+k] for o in self.orders) <= 
                            1000 * (1 - self.C[m,t])
                        )
        
        # Solve the model
        status = self.model.solve()
        
        if status == 1:
            return self._get_schedule()
        else:
            return None

    def _get_schedule(self) -> Dict:
        """Extract and format the optimized schedule"""
        schedule = []
        changeovers = []
        
        # Extract production schedule
        for order in self.orders:
            for m in self.machines:
                for t in self.periods:
                    if value(self.X[order['customer'],m,t]) > 0.1:
                        schedule.append({
                            'customer': order['customer'],
                            'machine': m,
                            'hour': t,
                            'quantity': round(value(self.X[order['customer'],m,t]), 2),
                            'spec': order['spec']
                        })
        
        # Extract changeovers
        for m in self.machines:
            for t in self.periods:
                if value(self.C[m,t]) > 0.5:
                    changeovers.append({
                        'machine': m,
                        'hour': t
                    })
        
        return {
            'schedule': pd.DataFrame(schedule),
            'changeovers': pd.DataFrame(changeovers),
            'total_cost': value(self.model.objective)
        }

def main():
    # Initial orders
    initial_orders = [
        {'customer': 'A', 'quantity': 50, 'spec': 'Spec1', 'deadline': 2},
        {'customer': 'B', 'quantity': 100, 'spec': 'Spec2', 'deadline': 2}
    ]
    
    # Create optimizer
    optimizer = OrderOptimizer(
        initial_orders=initial_orders,
        machines=['M1', 'M2'],
        cleaning_time=2.5
    )
    
    # Get initial schedule
    print("\nInitial Schedule:")
    results = optimizer.optimize_schedule()
    print(results['schedule'])
    print("\nChangeovers:")
    print(results['changeovers'])
    
    # New order arrives
    new_order = {'customer': 'C', 'quantity': 100, 'spec': 'Spec2', 'deadline': 1}
    optimizer.add_new_order(new_order)
    
    # Re-optimize schedule
    print("\nUpdated Schedule with New Order:")
    results = optimizer.optimize_schedule()
    print(results['schedule'])
    print("\nChangeovers:")
    print(results['changeovers'])

if __name__ == "__main__":
    main()