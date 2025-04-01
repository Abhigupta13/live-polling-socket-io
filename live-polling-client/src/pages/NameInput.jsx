import { useState } from "react";
import { useNavigate } from "react-router-dom";

function NameInput() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name) {
      // Store the name in local storage or state management if needed
      localStorage.setItem("studentName", name);
      navigate("/student-dashboard"); // Navigate to the Student Dashboard
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      <h1 className="text-4xl font-bold mb-4 text-center">Let's Get Started</h1>
      <p className="text-lg mb-8 text-center">
        If you're a student, you'll be able to <strong>submit your answers</strong>, participate in live<br/> polls, and see how your responses compare with your classmates.
      </p>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <label className="block text-sm font-medium mb-2" htmlFor="name">
          Enter your Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded-lg p-2 w-full mb-4"
          placeholder="Enter your name"
          required
        />
        <button type="submit" className="bg-blue-500 text-white rounded-lg px-6 py-3 w-full">
          Continue
        </button>
      </form>
    </div>
  );
}

export default NameInput; 