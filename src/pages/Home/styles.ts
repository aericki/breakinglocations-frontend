import styled from "styled-components";

export const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: ${(props) => props.theme.background};
  display: flex;

  @media (max-width: 768px) {
    flex-direction: column;
    padding-bottom: 5rem;
  }
`;

export const Title = styled.h1`
  font-size: 54px;
  color: ${(props) => props.theme.primary};
  padding-bottom: 50px;
  text-align: center;
  font-weight: bold;
  max-width: 500px;
  @media (max-width: 768px) {
    padding-bottom: 22px;
  }
`;

export const SubTitle = styled.p`
  font-size: 24px;
  padding-bottom: 50px;
  text-align: center;
  max-width: 500px;
  font-weight: bold;
  @media (max-width: 768px) {
    padding-bottom: 22px;
  }
`;

export const ButtonBox = styled.div`
  background-color: ${(props) => props.theme.secondary};
  color: ${(props) => props.theme.white};
  height: 50px;
  width: 40px;
  font-size: 30px;
  position: absolute;
  left: 0;
  top: 0;
  border-radius: 5px;

  display: flex;
  justify-content: center;
  align-items: center;
  
`;

export const Button = styled.button`
  background-color: ${(props) => props.theme.primary};
  color: ${(props) => props.theme.white};
  height: 50px;
  border: none;
  border-radius: 5px;
  position: relative;
  padding-left: 50px;
  padding-right: 10px;

  &:hover {
    filter: opacity(0.9);
  }
`;

export const LeftContainer = styled.div`

  display: flex;
  flex: 1;
  padding-top: 16rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    padding-top: 4rem;
    padding-bottom: 1rem;
  }
`;

export const RightContainer = styled.div`
  flex: 1;
  background-image: url("/home-background.svg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat ;
  border-top-left-radius: 30px;
  border-bottom-left-radius: 30px;
  width: 100%;
  height: 100%;

  @media (max-width: 768px) {
    border-top-right-radius: 30px;
    border-bottom-left-radius: 0;
    
    }
`;

export const Footer = styled.footer`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
  padding: 1rem;
  width: 100%;
  background-color: #f5f5f5;
  text-align: center;
  font-size: 0.9rem;
  color: #666;

  a {
    color: #6c63ff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
  @media (max-width: 768px) {
    position: absolute;
    bottom: 0;
    z-index: 50;

  }
`;

export const RouteCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  justify-content: center;
`;


export const Image = styled.img.attrs(() => ({
  src: "home-image.svg",
}))`
  width: 50%;
`;