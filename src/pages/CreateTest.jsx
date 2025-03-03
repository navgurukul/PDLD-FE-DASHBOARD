import createTest from "../assets/createTest.svg";
import { useNavigate } from "react-router-dom";

const CreateTest = () => {
  const navigate = useNavigate();

  const handleCreateTest = () => {
    navigate("/user");
  };
  return (
    <div className="main-page-wrapper">
      <h5 className="text-lg font-bold text-[#2F4F4F] mb-4">All Tests</h5>
      <div className="flex flex-col items-center justify-cente">
        <div className="flex flex-col items-center justify-center   p-6 w-72">
          <img src={createTest} alt="createTest" />
          <p className="text-center text-sm text-gray-600 mb-3">
            No tests yet? Create your first one now!
          </p>
          <button
            onClick={handleCreateTest}
            className="flex items-center justify-center h-12 px-6 bg-[#FFD700] text-black font-medium rounded-lg shadow-md hover:bg-yellow-500 transition"
          >
            Create Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTest;
