// import { useState } from "react";

const Button = () => {
    // const [selectedSubjects, setSelectedSubjects] = useState({});

    return (
        <>
            <div className="flex justify-center">
                <button
                    className="h-12 px-4 py-2 bg-[#FFD700] rounded-lg justify-center items-center gap-2 inline-flex"
                    // disabled={Object.keys(selectedSubjects).length === 0}
                >
                    <div className="text-center text-[#2f4f4f] text-lg font-bold font-['Karla'] leading-[30.60px]">
                        Create Test
                    </div>
                </button>
            </div>
        </>
    )
}
export default Button;