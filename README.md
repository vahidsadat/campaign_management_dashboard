# Campaign Management Dashboard
A Fullstack application for managing advertising campaigns. it's built with **MongoDB** for storage and database, **FastAPI** for Backend, **Next.js** for Frontend and it has been **Containerize** to ensure, it will be run in all systems.

## Docker
In case you don't have **Docker Desktop** please install and run it.
Then please follow the steps:
1. Clone the repository
2. Create a `.env` file in root folder same as `.env.example` which is provided in repository. `env` file contains:
   - **MongoDB User (MONGODB_URI)**: MongoDB uri
   - **Next API URL (NEXT_PUBLIC_API_URL)**:  Backend url.
3. Run `docker-compose.yml` file
    ```Bash
    docker-compose up --build
    ```
4. Access the Application:
    1. Frontend: `http://localhost:3000`
    2. Backend: `http://localhost:5000`
    3. API Documentation (Swagger): `http://localhost:5000/docs`

**Note**: When you run the docker for the first time, please wait approximately **2 Minutes** and then open the Frontend dashboard.

## Programming Languages Versions
- Backend:
  - Python 3.13.2
- Frontend:
  - Next.js 16.2.5
- Database:
  - MongoDB Atlas
