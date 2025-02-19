import styled from "styled-components";
import { MapContainer as MapContainerLeaflet } from "react-leaflet";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => props.theme.background};
  padding: 20px;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

export const Form = styled.form`
  width: 40vw;
  background-color: ${(props) => props.theme.white};
  padding: 50px;
  margin-top: 40px;
  border-radius: 8px;

  @media (max-width: 1024px) {
    width: 70vw;
    padding: 40px;
  }

  @media (max-width: 768px) {
    width: 90vw;
    padding: 20px;
  }
`;

export const FormTitle = styled.h2`
  color: ${(props) => props.theme.primary};
  font-size: 40px;
  padding-bottom: 30px;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

export const MapContainer = styled(MapContainerLeaflet)`
  height: 50vh;
  width: 100%;

  @media (max-width: 768px) {
    height: 40vh;
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

export const CategoryContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

export const CategoryBox = styled.div<{ isActive: boolean }>`
  background-color: ${(props) =>
    props.isActive ? props.theme.white : props.theme.background};
  border: ${(props) =>
    props.isActive ? `2px solid ${props.theme.background}` : "none"};
  border-radius: 8px;
  width: 160px;
  height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 10px;
  cursor: pointer;

  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
    margin: 5px;
  }
`;

export const CategoryImage = styled.img`
  width: 40px;
  height: 40px;

  @media (max-width: 768px) {
    width: 30px;
    height: 30px;
  }
`;

export const ButtonContainer = styled.div`
  text-align: center;
  padding-top: 20px;
`;

export const Button = styled.button`
  background-color: ${(props) => props.theme.primary};
  color: ${(props) => props.theme.white};
  height: 50px;
  border: none;
  border-radius: 5px;
  padding: 0 20px;

  &:hover {
    background-color: ${(props) => props.theme.primary}99;
  }

  @media (max-width: 768px) {
    height: 40px;
    padding: 0 15px;
  }
`;
