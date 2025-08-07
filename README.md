# EduConnect

EduConnect is a web-based parent-teacher communication portal designed to enhance engagement and transparency between schools and families. It enables schools to efficiently share updates about student performance, attendance, assignments, and upcoming events.

## Live Demo

Coming soon...

## Key Features

- Teacher Dashboard: Manage assignments, update student performance, mark attendance.
- Parent Dashboard: View student performance, attendance reports, and upcoming events.
- Event Management: School admins can create and notify parents about upcoming events or exams.
- Reports & Analytics: Track student performance and attendance trends.
- Secure Login System: Role-based login for Admins, Teachers, and Parents.
- PayPal Integration: For school subscription payments (if enabled).

## Tech Stack

| Layer       | Technologies                    |
|-------------|----------------------------------|
| Frontend    | React (with Vite), Bootstrap CSS |
| Backend     | Node.js, Express.js              |
| Database    | MySQL                            |
| Auth        | JWT (JSON Web Tokens)            |
| Payment     | PayPal API (for subscriptions)   |

##  Project Structure
EduConnect/
├── client/ # Frontend React app
│ ├── src/
│ └── ...
├── server/ # Backend Express app
│ ├── routes/
│ ├── controllers/
│ └── ...
├── database/ # MySQL scripts and ERD
└── README.md


## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/laraib-01/fy-project.git
cd fy-project

2.Set Up the Backend
cd server
npm install

Create a .env file with your database and JWT config (example below).
env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=educonnect
JWT_SECRET=your_jwt_secret

Start the server:
npm start

3.Set Up the Frontend
cd ../client
npm install
npm run dev

4. Import the Database
Use XAMPP/phpMyAdmin/MySQL Workbench
Import the .sql script located in the database/ folder

 Example Users (for testing)

| Role    | Email                                             | Password   |
| ------- | ------------------------------------------------- | ---------- |
| Admin   | [admin@example.com](mailto:admin@example.com)     | admin123   |
| Parent  | [parent@example.com](mailto:parent@example.com)   | parent123  |
| Teacher | [teacher@example.com](mailto:teacher@example.com) | teacher123 |


🚀 Future Enhancements
Student portal for assignments and performance
Push notifications for mobile users
PDF report downloads
Attendance visualization charts

⏺️Author
Developed by laraib-01
