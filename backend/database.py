from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import json
import os
load_dotenv()



uri = f"mongodb+srv://{os.getenv("MONGODB_USER")}:{os.getenv("MONGODB_PASSWORD")}@cluster0.g3c5lti.mongodb.net/?appName=Cluster0"
# Create a new client and connect to the server
client = AsyncIOMotorClient(uri)
#get the json data from campaigns.json
campaign = json.load(open("./campaigns.json"))

database = client.campaign_db





