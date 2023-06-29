import { useSession } from 'next-auth/react';

const HomeHeader = () => {
  const { data: session } = useSession();
  return (
    <div className='text-blue-900 flex justify-between'>
      <div className='flex gap-2 items-center'>
        <img src={session?.user?.image} alt='' className='w-7 h-7 rounded-md sm:hidden' />
        <h2>
          Hello, <b>{session?.user?.name}</b>
        </h2>
      </div>
      <div className='items-center bg-gray-300 gap-1 text-black rounded-lg overflow-hidden hidden sm:flex'>
        <img src={session?.user?.image} alt='' className='w-7 h-7' />
        <span className='px-2 '>{session?.user?.name}</span>
      </div>
    </div>
  );
};

export default HomeHeader;
