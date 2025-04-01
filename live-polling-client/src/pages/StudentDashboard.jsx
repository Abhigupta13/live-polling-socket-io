import { useState, useEffect } from "react";

function StudentDashboard() {
  const [name, setName] = useState(localStorage.getItem("studentName") || "");
  const [isWaiting, setIsWaiting] = useState(true);
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [pollResults, setPollResults] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [timer, setTimer] = useState(30); // Set timer to 30 seconds for each question
  const [questionNumber, setQuestionNumber] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userName, setUserName] = useState("You"); // Assuming the user's name is "You" for this example
  const [activeTab, setActiveTab] = useState("chat"); // New state for active tab

  // Simulate waiting for a question from the teacher
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsWaiting(false);
      setQuestion({
        text: "Which planet is known as the Red Planet?",
        options: ["Mars", "Venus", "Jupiter", "Saturn"],
      });
      setParticipants(["Rahul Arora",
         "Pushpendra Rautela", 
         "Rijul Zalpuri", 
         "Nadeem N", 
         "Pushpendra Rautela", 
         "Rijul Zalpuri", 
         "Nadeem N", 
         "Pushpendra Rautela", 
         "Rijul Zalpuri", 
         "Nadeem N", 
         "Ashwin Sharma"]);
    }, 1000); // Simulate a 5-second wait

    return () => clearTimeout(timer);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isWaiting || isSubmitted) return;

    const timerInterval = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          clearInterval(timerInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isWaiting, isSubmitted]);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    // Simulate poll results after submission
    setPollResults({
      Mars: 75,
      Venus: 5,
      Jupiter: 5,
      Saturn: 15,
    });
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { sender: userName, text: newMessage }]);
      setNewMessage("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white">

      {isWaiting ? (
        <>
          <p className="text-lg mb-4">Wait for the teacher to ask questions..</p>
          <button className="bg-blue-500 text-white rounded-lg px-4 py-2 cursor-not-allowed" disabled>
            Loading...
          </button>
        </>
      ) : (
        <>
          <div className="w-full max-w-md bg-gray-100 border border-gray-300 rounded-lg p-4 shadow-md mb-4">
            <h3 className="text-lg font-semibold mb-4">
              Question {questionNumber}: {question.text}
            </h3>
            <div className="text-sm mb-4">Time Remaining: <span className="text-red-500">{timer}s</span></div>
            <div className="flex flex-col space-y-2">
              {question.options.map((option, index) => (
                <div key={option} className={`flex items-center justify-between border rounded-lg p-2 ${selectedAnswer === option ? "bg-blue-200" : ""}`}>
                  <button
                    className={`flex-1 text-left p-2 rounded-lg ${selectedAnswer === option ? "bg-blue-500 text-white" : "bg-white"}`}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={isSubmitted || timer === 0}
                  >
                    <span className="items-center p-2 me-2 justify-center rounded-full border border-gray-300">{index + 1}</span>
                    {option}
                  </button>
                  {(isSubmitted || timer === 0) && pollResults && (
                    <div className="flex items-center mt-2 w-full">
                      <div className="bg-gray-300 w-full h-4 rounded">
                        <div className="bg-blue-500 h-4" style={{ width: `${pollResults[option]}%` }}></div>
                      </div>
                      <span className="ml-2">{pollResults[option]}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {!isSubmitted && selectedAnswer && (
              <button
                className="mt-4 bg-green-500 text-white rounded-lg px-4 py-2"
                onClick={handleSubmit}
              >
                Submit
              </button>
            )}
            {isSubmitted && selectedAnswer && (
              <p className="text-lg mt-4">Your Answer: {selectedAnswer}</p>
            )}
          </div>
          {!isSubmitted && timer === 0 && (
            <p className="text-lg">Wait for the teacher to ask a new question..</p>
          )}
          {isSubmitted && (
            <p className="text-lg mt-4">Wait for the teacher to ask a new question..</p>
          )}
          <button
            className="fixed bottom-4 right-4 bg-purple-500 text-white rounded-lg px-4 py-2 flex items-center"
            onClick={() => setShowChat(!showChat)}
          >
            <span className="material-icons mr-2"></span>
            {showChat ? "Hide Chat" : "Show Chat"}
          </button>
          {showChat && (
            <div className="fixed bottom-16 right-4 bg-white border rounded-lg shadow-lg p-4 h-100 w-80 z-50">
              <div className="flex justify-between mb-2">
                <button
                  className={`flex-1 text-center py-2 ${activeTab === "chat" ? "border-b-2 border-purple-500" : ""}`}
                  onClick={() => setActiveTab("chat")}
                >
                  Chat
                </button>
                <button
                  className={`flex-1 text-center py-2 ${activeTab === "participants" ? "border-b-2 border-purple-500" : ""}`}
                  onClick={() => setActiveTab("participants")}
                >
                  Participants
                </button>
              </div>
              {activeTab === "chat" && (
                <div className="flex flex-col h-full">
                  <div className="h-64 overflow-y-auto mb-2">
                    {messages.map((msg, index) => (
                      <div key={index} className={`flex ${msg.sender === "User 1" ? "justify-start" : "justify-end"} mb-2`}>
                          <div className="flex flex-col">
                            <span className="font-semibold text-purple-900 text-sm text-end">{msg.sender}</span>
                            <div className={`p-1 rounded-lg ${msg.sender === "User 1" ? "bg-black text-white" : "bg-[#7765DA] text-white"}`}>
                              <p>{msg.text}</p>
                            </div>
                          </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center mt-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="border rounded-lg p-2 w-full"
                      placeholder="Type a message..."
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-blue-500 text-white rounded-lg px-4 py-2 ml-2"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
              {activeTab === "participants" && (
                <div className="h-72 overflow-y-auto mb-2 p-2">
                  <h4 className="font-semibold">Participants:</h4>
                  <ul>
                    {participants.map((participant) => (
                      <li key={participant} className="flex items-center p-2 mb-1 bg-gray-200 rounded-lg">
                        <span className="font-bold text-purple-600">{participant}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default StudentDashboard;
