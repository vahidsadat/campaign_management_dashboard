import uvicorn
import os
from fastapi import FastAPI
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from model import CampaignModel,CampaignModelUpdate
from contextlib import asynccontextmanager
from fastapi import HTTPException
from __init__ import __version__
from database import database,campaign


@asynccontextmanager
async def lifespan(app: FastAPI):
    count = database.campaigns.count_documents({})
    if count == 0:
        print("Add campaigns information into database for the first time..")
        await database.campaigns.insert_many(campaign)
    
    yield

app = FastAPI(title="Campaign Management API",
    version=__version__,
    lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
script_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
photos_path = os.path.join(script_dir, "thumbnails")
app.mount("/images", StaticFiles(directory=photos_path), name="images")

@app.post("/campaigns/reset")
async def reset_database():

    await database.campaigns.delete_many({})
    if campaign:
        await database.campaigns.insert_many(campaign)
    return {"message": "Database reset to seed data successfully"}

@app.post('/campaigns')
async def create_campaign(campaign: CampaignModel):
    
    new_campaign = campaign.model_dump()
    new_campaign["id"] = str(new_campaign["id"])

    excisted_campaign = await database.campaigns.find_one({
        "client" : new_campaign["client"],
        "country_code" : new_campaign["country_code"],
        "platform" : new_campaign["platform"]
    },
    {"_id": 0})

    if excisted_campaign:
        raise HTTPException(status_code=400, detail= " Campaign already excisted for campaing with inserted client, country and platform")

    await database.campaigns.insert_one(new_campaign)
    return new_campaign

@app.get('/campaigns')
async def get_all_campaigns():
    campaigns = await database["campaigns"].find({}, {"_id": 0}).to_list(length=None)
    
    print(f"DEBUG: Found {len(campaigns)} campaigns") 
    
    # Use the encoder to ensure everything is "JSON-ready"
    return jsonable_encoder(campaigns)


@app.get('/campaigns/stats')
async def get_campaigns_stats():
    pipeline = [
        {
            "$group" : {
                "_id" : "$client",
                "total_budget" : {"$sum" : "$daily_budget"},
                "average_bid" : {"$avg" : "$bid"}
            }
            },
            {
                "$project": {
                    "_id": 0,            
                    "client": "$_id",     
                    "total_budget": {"$round": ["$total_budget", 2]},
                    "average_bid": {"$round": ["$average_bid", 2]}
                }
            },
        {
            "$sort": {"client": 1}
        }
        
    ]

    campaigns_stats = database.campaigns.aggregate(pipeline=pipeline)
    stats = await campaigns_stats.to_list(length=None)
    return stats

@app.get('/campaigns/{id}')
async def get_campaign_by_id(id:str):
    campaign = await database.campaigns.find_one({"id":id},{"_id":0})

    if not campaign:
        raise HTTPException(status_code=404, detail= f"There is no Campaign with id {id} in Database")
    return campaign

@app.patch('/campaigns/{id}')
async def modify_campaign_by_id(id:str, desired_data:CampaignModelUpdate):
    campaign = await database.campaigns.find_one({"id":id},{"_id":0})

    if not campaign:
        raise HTTPException(status_code=404, detail= f"There is no Campaign with id {id} in Database")
    
    desire_changes = desired_data.model_dump(exclude_unset=True)
    desired_client = desire_changes.get("client",campaign["client"])
    desired_country_code = desire_changes.get("country_code",campaign["country_code"])
    desired_platform = desire_changes.get("platform",campaign["platform"])
    excisted_campaign = await database.campaigns.find_one({
        "client" : desired_client,
        "country_code" : desired_country_code,
        "platform" : desired_platform,
        "id": {"$ne": id}
    },
    {"_id": 0})

    if excisted_campaign:
        raise HTTPException(status_code=400, detail= " Campaign already excisted for campaing with inserted client, country and platform")
   
    desired_daily_budget = desire_changes.get("daily_budget",campaign["daily_budget"])
    desired_bid = desire_changes.get("bid",campaign["bid"])
    if (desired_bid>desired_daily_budget):
            raise HTTPException(status_code=400, detail= "bid must be less that daily budget")

    
    if desire_changes:
        await database.campaigns.update_one({"id":id},{"$set": desire_changes})
    return await database.campaigns.find_one({"id":id},{"_id": 0})

@app.delete('/campaigns/{id}')
async def delete_campaign_by_id(id:str):
    campaign = await database.campaigns.find_one({"id":id},{"_id":0})
    if not campaign:
        raise HTTPException(status_code=404, detail= f"There is no Campaign with id {id} in Database")
    await database.campaigns.delete_one({"id":id})
    return f"Campaign with id {id} successfully has been deleted"

if __name__ == "__main__":
    uvicorn.run("main:app",host='0.0.0.0', port=5000, reload=True)