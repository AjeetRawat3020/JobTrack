# JobTrack — Job Application Tracking System

JobTrack is a full-stack web application that helps users organize, track, and manage their job applications in one place.

Instead of maintaining job applications manually, users can manage application statuses, schedule interviews, receive reminders, and monitor their job search progress through a centralized dashboard.

## Features

### Authentication & Security
- User registration and login
- JWT-based authentication
- User-specific application data
- Secure access to protected APIs

### Job Application Management
- Add, view, edit, and delete job applications
- Track application status:
    - Applied
    - Interview
    - Offer
    - Rejected
    - Saved
- Search applications by keyword
- Filter applications by status
- Pagination for application records

### Dashboard
- Total applications overview
- Application status statistics
- Centralized application tracking

### Interview Management
- Schedule interviews
- Edit and delete interviews
- Track interview rounds and status
- Calendar-based interview view
- Upcoming interview reminders
- Automatic 24-hour and 1-hour reminders

### Notifications
- In-app notification center
- Interview creation notifications
- Interview completion notifications
- Mark notifications as read
- Delete notifications

### Application Status History
- Track application status changes
- View previous and current statuses
- Timeline-based history

### User Interface
- Responsive desktop and mobile design
- Dark mode and light mode
- Interactive dashboard

## Technology Stack

**Frontend**
- React
- TypeScript
- Vite
- Tailwind CSS
- CSS

**Backend**
- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- JWT Authentication
- Maven

**Database**
- MySQL

**Tools**
- IntelliJ IDEA
- Visual Studio Code
- Git & GitHub
- Postman / Swagger

## Project Structure

```text
JobTrackApp/
├── backend/
│   ├── src/
│   ├── pom.xml
│   └── mvnw
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
│
└── .gitignore
```

## Getting Started

### Prerequisites

Install the following:

- Java 21 or compatible JDK
- Maven (or use the included Maven wrapper)
- Node.js and npm
- MySQL 8+

### 1. Clone the Repository

```bash
git clone https://github.com/AjeetRawat3020/JobTrack.git
cd JobTrack
```

### 2. Create the Database

Open MySQL and execute:

```sql
CREATE DATABASE jobtrack_db;
```

### 3. Configure Backend Environment Variables

Set the following environment variables before starting the backend:

```text
DB_URL=jdbc:mysql://localhost:3306/jobtrack_db
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_secure_jwt_secret
```

Do not commit actual passwords or JWT secrets to GitHub.

### 4. Run the Backend

Open a terminal:

```bash
cd backend
```

Windows:

```bash
mvnw.cmd spring-boot:run
```

The backend will start at:

`http://localhost:8080`

### 5. Run the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at:

`http://localhost:5173`

## API Documentation

Swagger UI is available at:

`http://localhost:8080/swagger-ui.html`

## Future Improvements

- Production deployment
- Automated testing expansion
- Advanced analytics and reporting
- Additional dashboard improvements

## Author

**Ajeet Rawat**

GitHub: https://github.com/AjeetRawat3020

---

If you find this project useful, feel free to explore the repository and share feedback.

**Built with Java, Spring Boot, React, TypeScript and MySQL.**