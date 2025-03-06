const ButtonCustom = ({ text, onClick, imageName, disabled, btnWidth }) => {
  return (
    <div
      className={`flex justify-center h-11 px-4 py-2 ${btnWidth ? `w-[${btnWidth}px]` : 'w-auto'} ${
        disabled ? 'bg-gray-300' : 'bg-[#FFD700]'
      } rounded-lg items-center gap-2 ${
        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
      }`}
      onClick={!disabled ? onClick : null}
    >
      {imageName && <img src={imageName} alt="" />}
      <span className={`text-[#2f4f4f] text-lg font-bold font-['Karla'] leading-[30.60px] ${
        disabled ? 'opacity-50' : ''
      }`}>
        {text}
      </span>
    </div>
  );
};

export default ButtonCustom;
