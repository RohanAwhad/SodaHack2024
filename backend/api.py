from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(root_path='/api/v1')

# Models

class ProductNameRequest(BaseModel):
    description: str

class ProductNameResponse(BaseModel):
    product_name: str

class DomainNameRequest(BaseModel):
    product_name: str

class DomainNameResponse(BaseModel):
    domain_name: str
    available: bool

class DomainResearchRequest(BaseModel):
    domain_name: str

class IllegalActivityResponse(BaseModel):
    illegal_activity: bool
    details: Optional[str] = None

class DomainOfferingResponse(BaseModel):
    domain_name: str
    use_case: str

class DomainAvailabilityRequest(BaseModel):
    domain_name: str

class DomainAvailabilityResponse(BaseModel):
    available: bool

# Example in-memory data (for demonstration purposes)
# Replace this with actual logic or database calls
product_name_suggestions = ["SmartHome Pro", "EcoClean 3000", "TechGenius", "EcoWear"]
domain_name_suggestions = [
    {"domain_name": "smarthomepro.com", "available": True},
    {"domain_name": "ecoclean3000.net", "available": False}
]
domain_research = {
    "smarthomepro.com": {
        "illegal_activity": False,
        "use_case": "Home automation products."
    },
    "ecoclean3000.net": {
        "illegal_activity": True,
        "details": "Domain was previously used in phishing scams.",
        "use_case": "Eco-friendly cleaning services."
    }
}

# API Endpoints

@app.post("/product-names", response_model=List[ProductNameResponse])
async def suggest_product_names(request: ProductNameRequest):
    # Logic to generate product names based on the description
    # Here we're just returning some dummy data
    response = [{"product_name": name} for name in product_name_suggestions[:10]]
    return response

@app.post("/domain-names", response_model=List[DomainNameResponse])
async def suggest_domain_names(request: DomainNameRequest):
    # Logic to generate domain names based on the product name
    # Dummy data for the response
    response = domain_name_suggestions[:10]
    return response

@app.post("/domain-research/illegal-activity", response_model=IllegalActivityResponse)
async def check_illegal_activity(request: DomainResearchRequest):
    # Check for illegal activity related to the domain name
    domain_data = domain_research.get(request.domain_name)
    if domain_data:
        return IllegalActivityResponse(
            illegal_activity=domain_data["illegal_activity"],
            details=domain_data.get("details")
        )
    raise HTTPException(status_code=404, detail="Domain not found")

@app.post("/domain-research/offering", response_model=List[DomainOfferingResponse])
async def check_domain_offering(request: DomainResearchRequest):
    # Get the previous offerings for the domain
    domain_data = domain_research.get(request.domain_name)
    if domain_data:
        return [
            DomainOfferingResponse(
                domain_name=request.domain_name,
                use_case=domain_data["use_case"]
            )
        ]
    raise HTTPException(status_code=404, detail="Domain not found")

@app.post("/domain-availability", response_model=DomainAvailabilityResponse)
async def check_domain_availability(request: DomainAvailabilityRequest):
    # Check if the domain is available
    for domain in domain_name_suggestions:
        if domain["domain_name"] == request.domain_name:
            return DomainAvailabilityResponse(available=domain["available"])
    raise HTTPException(status_code=404, detail="Domain not found")
