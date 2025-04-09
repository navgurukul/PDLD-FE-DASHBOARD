import React from 'react';

const OutlinedButton = ({ 
  text, 
  image, 
  onClick, 
  disabled = false, 
  className = '', 
  imageClassName = '',
  textClassName = '',
  imagePosition = 'left',
  type = 'button',
  handleDisabledClick
}) => {
  const outlineColor = '#2F4F4F';
  const disabledColor = '#cccccc';
  const disabledTextColor = '#666666';
  
  return (
    <button
      type={type}
      onClick={disabled ? handleDisabledClick : onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center
        px-4 py-2
        border-2 border-solid
        rounded-lg
        transition-all duration-200
        ${disabled 
          ? `border-[${disabledColor}] text-[${disabledTextColor}] cursor-pointer` 
          : `border-[${outlineColor}] text-[${outlineColor}] hover:bg-[${outlineColor}] hover:text-white active:bg-[${outlineColor}]/10`
        }
        ${className}
      `}
      style={{
        // Using style prop because Tailwind can't dynamically interpolate colors with opacity
        '--outline-color': outlineColor,
        '--disabled-color': disabledColor,
        '--disabled-text-color': disabledTextColor
      }}
    >
      {image && imagePosition === 'left' && (
        <img 
          src={image} 
          alt="" 
          className={`h-5 w-5 mr-2 ${imageClassName}`}
        />
      )}
      
      <span className={`font-medium ${textClassName}`}>
        {text}
      </span>
      
      {image && imagePosition === 'right' && (
        <img 
          src={image} 
          alt="" 
          className={`h-5 w-5 ml-2 ${imageClassName}`}
        />
      )}
    </button>
  );
};

export default OutlinedButton;