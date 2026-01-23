from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/auth/login")
async def login(request: LoginRequest):
    """
    Simple hardcoded admin login
    """
    if request.username == "admin" and request.password == "Admin":
        return {
            "token": "fake-jwt-token-for-admin",
            "user": {
                "username": "admin",
                "role": "admin"
            },
            "message": "Login successful"
        }
    
    raise HTTPException(status_code=401, detail="Invalid credentials")
