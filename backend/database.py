from motor.motor_asyncio import AsyncIOMotorClient
import urllib.parse
from dotenv import load_dotenv
import json
import os
load_dotenv()



db_user = os.getenv("MONGODB_USER")
db_pass = os.getenv("MONGODB_PASSWORD")
db_cluster = os.getenv("MONGODB_CLUSTER")
safe_user = urllib.parse.quote_plus(db_user)
safe_pass = urllib.parse.quote_plus(db_pass)
safe_cluster = urllib.parse.quote_plus(db_cluster)
uri = f"mongodb+srv://{safe_user}:{safe_pass}@{safe_cluster}/?appName=Cluster0"
if not uri:
    raise ValueError("MONGODB_URL not found in environment variables!")
# Create a new client and connect to the server
client = AsyncIOMotorClient(uri)
#get the json data from campaigns.json
campaign = json.load(open("./campaigns.json"))

database = client.campaign_db





