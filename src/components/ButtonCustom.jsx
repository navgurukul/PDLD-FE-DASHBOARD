const ButtonCustom = ({ text, onClick, imageName, disabled, btnWidth }) => {
  // Create a style object for the width
  const buttonStyle = btnWidth ? { width: `${btnWidth}px` } : {};

  return (
    <div className="flex">
      <button
        className={`flex justify-center h-12 px-4 py-2 ${
          disabled ? "bg-gray-300" : "bg-[#FFD700] hover:bg-[#CCAC00]"
        } rounded-lg items-center gap-2 ${
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        }`}
        style={buttonStyle} // Apply width using inline style
        onClick={!disabled ? onClick : null}
        disabled={disabled}
        type="button"
      >
        {imageName && <img src={imageName} alt="" />}
        <span
          className={`text-[#2F4F4F] text-[18px] font-semibold font-['Work_Sans'] leading-[30.6px]] ${
            disabled ? "opacity-50" : ""
          }`}
        >
          {text}
        </span>
      </button>
    </div>
  );
};

export default ButtonCustom;
