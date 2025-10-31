from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
import os

# Use same JWT secret key & algorithm as in auth.py
SECRET_KEY = os.getenv("SECRET_KEY", "secret")
ALGORITHM = "HS256"

# This defines how the token will be read from requests
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Function to decode JWT token
def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload  # Returns {'sub': email, 'role': role}
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Reusable dependency to get current user from token
def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    return payload
