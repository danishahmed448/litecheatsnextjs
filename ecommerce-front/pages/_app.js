import { createGlobalStyle } from 'styled-components';
import '../styles/global.css';
import { CartContextProvider } from '@/components/CartContext';
import Head from 'next/head';
import { NavActiveContextProvider } from '@/components/NavActiveContext';
import { SessionProvider } from 'next-auth/react';
import { SnackBarContextProvider } from '@/components/SnackbarContext';
import dynamic from 'next/dynamic';
import nProgress from 'nprogress';
import { Router } from 'next/router';




const TawkMessengerReact = dynamic(
  () => import('node_modules/@tawk.to/tawk-messenger-react'),
  { ssr: false }
);

const GlobalStyles = createGlobalStyle`

body{
  background-color: #eee;
  padding: 0;
  margin: 0;
  font-family: 'Poppins', sans-serif;
 
}
/* Make clicks pass-through */
#nprogress {
    --primary-color: #19a572;
    pointer-events: none;
  }

  #nprogress .bar {
    background: var(--primary-color);
    position: fixed;
    z-index: 1031;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
  }

  /* Fancy blur effect */
  #nprogress .peg {
    display: block;
    position: absolute;
    right: 0px;
    width: 100px;
    height: 100%;
    box-shadow: 0 0 10px var(--primary-color), 0 0 5px var(--primary-color);
    opacity: 1.0;

    -webkit-transform: rotate(3deg) translate(0px, -4px);
        -ms-transform: rotate(3deg) translate(0px, -4px);
            transform: rotate(3deg) translate(0px, -4px);
  }

  /* Remove these to get rid of the spinner */
  #nprogress .spinner {
    display: none;
    position: fixed;
    z-index: 1031;
    top: 15px;
    right: 15px;
  }

  #nprogress .spinner-icon {
    width: 18px;
    height: 18px;
    box-sizing: border-box;
    border: solid 2px transparent;
    border-top-color: var(--primary-color);
    border-left-color: var(--primary-color);
    border-radius: 50%;

    -webkit-animation: nprogress-spinner 400ms linear infinite;
            animation: nprogress-spinner 400ms linear infinite;
  }

  .nprogress-custom-parent {
    overflow: hidden;
    position: relative;
  }

  .nprogress-custom-parent #nprogress .spinner,
  .nprogress-custom-parent #nprogress .bar {
    position: absolute;
  }

  @-webkit-keyframes nprogress-spinner {
    0%   { -webkit-transform: rotate(0deg); }
    100% { -webkit-transform: rotate(360deg); }
  }
  @keyframes nprogress-spinner {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
Router.events.on('routeChangeStart', nProgress.start);
Router.events.on('routeChangeError', nProgress.done);
Router.events.on('routeChangeComplete', nProgress.done);
export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <>
      <Head>
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        />
        <link
          rel='apple-touch-icon'
          sizes='180x180'
          href='/apple-touch-icon.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='32x32'
          href='/favicon-32x32.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='16x16'
          href='/favicon-16x16.png'
        />
        <link
          rel='manifest'
          crossOrigin='use-credentials'
          href='/manifest.json'
        />
        <link rel='mask-icon' href='/safari-pinned-tab.svg' color='#555555' />
        <meta name='msapplication-TileColor' content='#ffffff' />
        <meta name='theme-color' content='#ffffff' />
      </Head>
      <GlobalStyles />
      <SnackBarContextProvider>
        <SessionProvider session={session}>
          <NavActiveContextProvider>
            <CartContextProvider>
              <TawkMessengerReact
                customStyle={{
                  visibility: {
                    desktop: {
                      yOffset: 70,
                      position: 'br', // 'br', 'bl', 'cr', 'cl', 'tr', 'tl'
                    },

                    mobile: {
                      yOffset: 70,
                      position: 'br', // 'br', 'bl', 'cr', 'cl', 'tr', 'tl'
                    },
                  },
                }}
                propertyId={process.env.NEXT_PUBLIC_TAWKTO_ID}
                widgetId={process.env.NEXT_PUBLIC_TAWKTO_WIDGET_ID}
              />

              <Component {...pageProps} />
            </CartContextProvider>
          </NavActiveContextProvider>
        </SessionProvider>
      </SnackBarContextProvider>
    </>
  );
}
