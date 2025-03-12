const BatchTestCreation = () => {
    return (
        <div className="flex justify-center items-center">
            <div className="w-full rounded-lg flex-col gap-6">
                <div className="text-[#2f4f4f] text-xl font-bold font-['Philosopher'] leading-[30px]">
                    Note: Test names will be generated automatically in the format:
                    <br />
                    <span className="text-[#2f4f4f]">Subject_Class</span>
                    (e.g., <span className="text-[#2f4f4f]">Science_Class1</span>)
                </div>
            </div>
        </div>
    );
};

export default BatchTestCreation;