<div align="center">

  <img src="/frontend/public/images/backgroundImage.jpg" alt="Geo Diary Logo" width="400" height="auto" />
  <h1>Geo Diary</h1>

  <h2>
   🌟 <a href="https://geo-diary.vercel.app/">Check out the website!</a> 🌟
  </h2>

</div>

# 📔 Table of Contents


- [📔 Table of Contents](#-table-of-contents)
  - [🌟 About the Project](#-about-the-project)
    - [📓 Description](#-description)
    - [👀 Features](#-features)
    - [👾 Tech Stack](#-tech-stack)
    - [🔑 Environment Variables](#-environment-variables)
      - [Frontend](#frontend)
      - [Backend](#backend)
  - [🧰 Getting Started](#-getting-started)
    - [⚙️ Setup](#️-setup)
      - [Clone the project](#clone-the-project)
    - [🚀 Run](#-run)
      - [Frontend](#frontend-1)
      - [Backend](#backend-1)

## 🌟 About the Project

### 📓 Description

<p>
A web application designed for users to mark pins on a map and share them with other users. The pins are automatically tagged with weather information and place names. Users can then add photos and a description of the location. Users can view their own pins and those of other users they follow in a gallery, and sort pins by distance from their current position, title and date. The app offers various map options to choose from, such as winter sports and satellite views.
</p>

### 👀 Features

<ul style="list-style-type: none;">
  <li>✓ Route planner with Google Maps</li>
  <li>✓ Follow other users and see their pins</li>
  <li>✓ Google authentication</li>
  <li>✓ Several map tiles options like satellite and outdoor</li>
  <li>✓ Add title, description, category and images to the pins</li>
  <li>✓ Dark mode</li>
</ul>

### 👾 Tech Stack

 <ul style="list-style-type: none;">
    <li><a href="https://www.java.com/">→ Java</a></li>
    <li><a href="https://maven.apache.org/">→ Maven</a></li>
    <li><a href="https://nextjs.org/">→ Next.js</a></li>
    <li><a href="https://www.typescriptlang.org/">→ TypeScript</a></li>
    <li><a href="https://www.postgresql.org/">→ PostgreSQL</a></li>
    <li><a href="https://tailwindcss.com/">→ Tailwind CSS</a></li>
    <li><a href="https://spring.io/projects/spring-boot">→ Spring Boot</a></li>
  </ul>

### 🔑 Environment Variables

#### Frontend

To run this project, you will need to add the following environment variables to your .env.local file in /frontend

`GOOGLE_CLIENT_ID`

`GOOGLE_CLIENT_SECRET`

`OPEN_WEATHER_MAP_API_KEY`

`NEXT_PUBLIC_MAPTILER_API_KEY`

`GEOCODING_API_KEY`

`NEXTAUTH_SECRET`

`ALLOWED_EMAILS`

`JWT_SECRET`

`BASE_API_URL`

#### Backend

To run this project, you will need to add the following environment variables to your application.properties file in /backend/src/main/resources

`spring.datasource.url`

`spring.datasource.username`

`spring.datasource.password`

`spring.datasource.driver-class-name`

`spring.jpa.hibernate.ddl-auto`

`spring.jpa.show-sql`

`spring.jpa.properties.hibernate.format_sql`

`server.servlet.session.timeout`

`bucket.capacity`

`bucket.refill.duration`

`cors.allowed.origins`

`google.cloud.project-id`

`allowed.emails`

## 🧰 Getting Started

### ⚙️ Setup

#### Clone the project

```bash
  git clone https://github.com/nidorbRotkiv/geo-diary.git
```

### 🚀 Run

#### Frontend

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

#### Backend

Navigate to the backend directory and install dependencies:

```bash
cd ../backend
mvn install
```

Run the Spring Boot application:

```bash
mvn spring-boot:run
```
