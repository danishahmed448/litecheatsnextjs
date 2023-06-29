import React from 'react';

const SeperateItem = ({name,setShowState,showState,add,children}) => {
  return (
    <div className='my-2 bg-gray-300 rounded-md p-2'>
      <div className='flex justify-between items-center'>
        <label className='block mb-1'>{name}</label>
        <button
          type='button'
          onClick={() => {
            setShowState((prev) => !prev);
          }}
        >
          {showState ? (
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='w-6 h-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          ) : (
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='w-6 h-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'
              />
            </svg>
          )}
        </button>
      </div>
      {showState && (
        <>
          <button
            type='button'
            onClick={add}
            className='btn-default text-sm mb-2'
          >
            Add
          </button>
          {children}
        </>
      )}
    </div>
  );
};

export default SeperateItem;
