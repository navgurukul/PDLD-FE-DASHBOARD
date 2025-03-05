import Button from "./Button";
import SubjectsSelector from "../components/SubjectsSelector"

const BatchTestCreation = () => {
    return (
        <>
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-[592px] h-[1190px] rounded-lg flex-col gap-6 inline-flex">
                    <div className="text-[#2f4f4f] text-xl font-bold font-['Philosopher'] leading-[30px]">
                        Note: Test names will be generated automatically in the format:
                        <br />
                        <span className="text-[#2f4f4f]">Subject_Class</span>
                        (e.g., <span className="text-[#2f4f4f]">Science_Class1</span>)
                    </div>
                    <SubjectsSelector />
                    <Button />
                </div>
            </div>
        </>
    );
};

export default BatchTestCreation;
