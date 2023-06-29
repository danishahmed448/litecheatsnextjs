import Nav from '@/components/Nav';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Logo from './Logo';

export default function Layout({ children }) {
  const [showNav, setShowNav] = useState(false);
  const { data: session } = useSession();
  if (!session) {
    return (
      <div className='bg-bgGray w-screen h-screen flex items-center'>
        <div className='text-center w-full'>
          <button onClick={() => signIn('google')} className='btn-default'>
            Login with Google
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className='bg-bgGray min-h-screen'>
      <div className='sticky z-50 top-0 bg-primary text-white block md:hidden flex items-center p-4'>
        <button onClick={() => setShowNav(true)}>
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
        </button>
        <div className='flex flex-grow justify-center  mr-6'>
          <Logo />
        </div>
      </div>
      <div className='flex w-full'>
        <Nav show={showNav} setShowNav={setShowNav} />
        <div
          className={`md:flex-4 w-full p-4 overflow-x-scroll ${
            showNav ? 'hidden md:flex' : ''
          }`}
        >
          <div className='max-w-screen-2xl mx-auto'>

          {children}
          </div>
        </div>
      </div>
    </div>
  );
}
