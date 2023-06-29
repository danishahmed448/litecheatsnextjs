import Link from 'next/link';
import styled, { css } from 'styled-components';
import Center from './Center';
import { useContext, useState } from 'react';
import { CartContext } from './CartContext';
import BarsIcon from './icons/Bars';
import CloseIcon from './icons/Close';
import { NavActiveContext } from './NavActiveContext';
import SearchIcon from './icons/Search';
import { useRouter } from 'next/router';

const StyledHeader = styled.header`
  background-color: #222;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
`;

const Logo = styled(Link)`
  color: #fff;
  text-decoration: none;
  position: relative;
  z-index: 3;
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px 0;
  align-items: center;
`;
const StyledNav = styled.nav`
  ${(props) =>
    props.mobileNavActive
      ? css`
          display: block;
        `
      : css`
          display: none;
        `}

  gap: 15px;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 70px 20px 20px;
  background-color: #222;
  @media screen and (min-width: 768px) {
    display: flex;
    position: static;
    padding: 0px;
  }
`;
const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  color: #aaa;
  text-decoration: none;
  padding: 10px 0;
  min-width: 30px;
  transition: all 0.2s ease;
  &:hover {
    color: white;
  }
  svg {
    height: 20px;
  }
  @media screen and (min-width: 768px) {
    padding: 0;
  }
`;
const NavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  width: 30px;
  height: 30px;
  border: 0;
  color: white;
  cursor: pointer;
  position: relative;
  z-index: 3;
  padding: 0;
  @media screen and (min-width: 768px) {
    display: none;
  }
  svg {
    width: auto;
    height: 100%;
  }
  ${(props) =>
    props.reducesize &&
    css`
      svg {
        width: auto;
        height: 22px;
      }
      @media screen and (min-width: 768px) {
        display: flex;
      }
    `}
`;

const SideIcons = styled.div`
  display: flex;
  gap: 5px;
`;
const Header = () => {
  const { cartProducts } = useContext(CartContext);
  const { mobileNavActive, setMobileNavActive } = useContext(NavActiveContext);
  const router = useRouter();

  return (
    <StyledHeader>
      <Center>
        <Wrapper>
          <Logo href={'/'} onClick={() => setMobileNavActive(false)}>
            Flavors Of Kalimpong
          </Logo>
          <StyledNav mobileNavActive={mobileNavActive}>
            <NavLink
              href={'/products'}
              onClick={() => setMobileNavActive(false)}
            >
              Products
            </NavLink>
            <NavLink
              href={'/categories'}
              onClick={() => setMobileNavActive(false)}
            >
              Categories
            </NavLink>
            <NavLink href={'/blog'} onClick={() => setMobileNavActive(false)}>
              Blog
            </NavLink>
            <NavLink
              href={'/account'}
              onClick={() => setMobileNavActive(false)}
            >
              Account
            </NavLink>
            <NavLink
              href={'/track-order'}
              onClick={() => setMobileNavActive(false)}
            >
              Track
            </NavLink>
            <NavLink href={'/cart'} onClick={() => setMobileNavActive(false)}>
              Cart ({cartProducts.length})
            </NavLink>
          </StyledNav>
          <SideIcons>
            <NavButton
              aria-label='search'
              reducesize
              onClick={() => router.push('/search')}
            >
              <SearchIcon />
            </NavButton>
            <NavButton onClick={() => setMobileNavActive((prev) => !prev)}>
              {mobileNavActive ? <CloseIcon /> : <BarsIcon />}
            </NavButton>
          </SideIcons>
        </Wrapper>
      </Center>
    </StyledHeader>
  );
};

export default Header;
