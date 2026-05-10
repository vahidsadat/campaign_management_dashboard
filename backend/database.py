from motor.motor_asyncio import AsyncIOMotorClient
import urllib.parse
from dotenv import load_dotenv
import json
import os
load_dotenv()


uri = os.getenv("MONGODB_URI")
if not uri:
    raise ValueError("MONGODB_URI not found in environment variables!")
# Create a new client and connect to the server
client = AsyncIOMotorClient(uri)
#get the json data from campaigns.json
campaign = json.load(open("./campaigns.json"))

database = client.campaign_db





