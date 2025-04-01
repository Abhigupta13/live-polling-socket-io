import { useDispatch } from "react-redux";
import { setRole } from "../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";

function RoleSelection() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    dispatch(setRole(role));
    if (role === "student") {
      navigate("/name-input");
    } else {
      navigate("/teacher");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      <h1 className="text-4xl font-bold mb-4 text-center">Welcome to the Live Polling System</h1>
      <p className="text-lg mb-8 text-center">Please select the role that best describes you to begin using the live polling system</p>
      <div className="flex flex-col md:flex-row md:space-x-4 w-full max-w-md">
        <button className="border border-blue-500 text-blue-500 rounded-lg p-4 flex-1 mb-4 md:mb-0"
          onClick={() => handleRoleSelect("student")}>
          <div>
            <span className="font-semibold">I'm a Student</span>
            <p className="text-sm text-gray-600">Participate in the live polling quiz and check where you stand.</p>
          </div>
        </button>
        <button className="border border-purple-500 text-purple-500 rounded-lg p-4 flex-1"
          onClick={() => handleRoleSelect("teacher")}>
          <div>
            <span className="font-semibold">I'm a Teacher</span>
            <p className="text-sm text-gray-600">Submit answers and view live poll results in real-time.</p>
          </div>
        </button>
      </div>
      <button className="bg-blue-500 text-white rounded-lg px-6 py-3 mt-6 w-full max-w-md"
        onClick={() => { /* Handle continue action */ }}>
        Continue
      </button>
    </div>
  );
}

export default RoleSelection;
