# Take-Home: Advertiser Campaign Dashboard

Use this template to create your own private repo, then share the link and invite us when you're ready to submit, be ready to demo and edit your solution in the next interview.

Assignment: Build an advertiser campaign dashboard according to the requirements outlined below. Expect to spend 4-6 hours, focus on decisions over polishing the solution.


##  Campaign data model

- id: UUID
- campaign_name: string, required
- client: string (advertiser name), required
- country_code: ISO 3166-1 alpha-2, required
- platform: enum — ios | android, required
- daily_budget: decimal USD, > 0
- bid: decimal, > 0 and <= daily_budget
- thumbnail: string (filename matching a file in the thumbnails volume)
- status: enum — active | paused, default active
- created_at / updated_at: auto-managed

Unique constraint: one campaign per (client, country, platform). Enforce at API level with a clear error.

campaigns.json — seed data. Add an easy option to reset the DB to seed data for the demo.


## API

- POST /campaigns
- GET /campaigns
- GET /campaigns/{id}
- PATCH /campaigns/{id} — partial update
- DELETE /campaigns/{id}
- GET /campaigns/stats — total budget + avg bid grouped by client


## Frontend

Campaigns Page:
- display campaigns as table
- filter the campaigns table:
    - filter for a set of country codes
    - filter for a set of platforms
    - filter for a single status
    - filter for a campaign name string (search)
- edit & delete campaigns from within the table view
    - it should be possible to edit each campaign's attributes in-place, within the table
- create campaign button
- stats element showing the /campaigns/stats aggregation
- campaign thumbnails shown in table — provided as a static volume mounted into the API container.
- no auth needed. Clean and efficient user interface, component structure and API interaction are focus.


## Requirements

- Database: MongoDB (Use a free tier cluster)
- Backend: FastAPI
- Frontend: Next.js
- docker-compose.yml — single docker compose up starts everything
- README
- Enforce strict typing in backend & frontend
