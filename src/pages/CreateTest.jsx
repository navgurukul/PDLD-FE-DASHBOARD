const CreateTest = () => {
  return (
    <div className="flex flex-col items-center justify-cente">
      <h2 className="text-lg font-bold text-[#2F4F4F] mb-4">Tests</h2>
      <div className="flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg p-6 w-64">
        <div className="w-16 h-16 bg-gray-300 rounded-md mb-2"></div>
        <p className="text-center text-sm text-gray-600 mb-3">
          Start by creating the first test
        </p>
        <button className="flex items-center justify-center h-12 px-6 bg-[#FFD700] text-black font-medium rounded-lg shadow-md hover:bg-yellow-500 transition">
          Create Test
        </button>
      </div>
    </div>
  );
};

export default CreateTest;
