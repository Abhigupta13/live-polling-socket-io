# Live Polling System

## Overview
This is a **real-time polling system** built using **React, Socket.io, and Express.js**. It supports two personas:
1. **Teacher** - Can create polls and view live results.
2. **Student** - Can submit answers and view results.

## Features
### **Teacher**
- Create new polls.
- View live polling results.
- Can ask a new question only if no active poll exists or if all students have answered.

### **Student**
- Enter a **unique name** per browser tab.
- Answer a poll once the teacher asks a question.
- View **live results** after submitting an answer.
- Has **60 seconds** to answer before auto-submitting results.

## Technologies Used
- **Frontend:** React, Context store, Tailwind CSS.
- **Backend:** Express.js with Socket.io for real-time updates.
- **Database:** MongoDB (for storing past poll results).
- **Deployment:** Hosted with backend & frontend integrated.

## Additional Enhancements
- **Teacher Controls**: Configure max poll duration, remove students.
- **Chat Feature**: Popup for teacher-student interaction.
- **Poll History**: Teachers can view past results from the database.

5. **Access the App**
   - Open `http://localhost:8080` in the browser.
   
## Deployment
- The app is fully hosted (frontend + backend) for public access.
- https://live-quiz-polling-system.vercel.app/


