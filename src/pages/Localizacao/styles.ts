import styled from "styled-components";

export const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: ${(props) => props.theme.background};
  display: flex;

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
  }
`;

export const Title = styled.h1`
  font-size: 54px;
  color: ${(props) => props.theme.primary};
  padding-bottom: 50px;
  text-align: center;
  max-width: 500px;

  @media (max-width: 768px) {
    font-size: 36px;
    padding-bottom: 30px;
  }
`;

export const SubTitle = styled.p`
  font-size: 24px;
  padding-bottom: 50px;
  text-align: center;
  max-width: 500px;

  @media (max-width: 768px) {
    font-size: 18px;
    padding-bottom: 20px;
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

  @media (max-width: 768px) {
    height: 40px;
    width: 35px;
    font-size: 24px;
  }
`;

export const Section = styled.div`
  color: ${(props) => props.theme.primary};
  font-size: 20px;
  padding-bottom: 30px;
  padding-top: 30px;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 18px;
  }
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

  @media (max-width: 768px) {
    height: 40px;
    padding-left: 40px;
    padding-right: 8px;
  }
`;

export const LeftContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;