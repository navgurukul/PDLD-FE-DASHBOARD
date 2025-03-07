const ButtonCustom = ({ text, onClick, imageName }) => {
  return (
    <div className="flex justify-center h-11 px-4 py-2 bg-[#FFD700] rounded-lg items-center gap-2">
      <img
        src={imageName}
        alt=""
        onClick={onClick}
        className="cursor-pointer"
      />     
      <button type="button" className="" onClick={onClick} aria-label={text}>
        <span className="text-[#2f4f4f] text-lg font-bold font-['Karla'] leading-[30.60px]">
          {text}
        </span>
      </button>
    </div>
  );
};

export default ButtonCustom;
