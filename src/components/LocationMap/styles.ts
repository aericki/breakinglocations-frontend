import styled from "styled-components";
import { MapContainer as MapContainerLeaflet } from "react-leaflet";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 80vh;
  width: 90vw;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => props.theme.background};
`;

export const Form = styled.form`
  width: 40vw;
  background-color: ${(props) => props.theme.white};
  padding: 50px;
  margin-top: 40px;
  border-radius: 8px;

  @media (max-width: 1024px) {
    width: 70vw;
  }
`;

export const FormTitle = styled.h2`
  color: ${(props) => props.theme.primary};
  font-size: 40px;

  padding-bottom: 30px;
`;

export const MapContainer = styled(MapContainerLeaflet)`
  height: 50vh;
`;

export const Section = styled.div`
  color: ${(props) => props.theme.primary};
  font-size: 20px;

  padding-bottom: 30px;
  padding-top: 30px;
  font-weight: 700;
`;

export const ButtonContainer = styled.div`
  text-align: center;
  padding-top: 20px;
`;

export const Title = styled.h1`
  font-size: 54px;
  color: ${(props) => props.theme.primary};
  padding-bottom: 50px;
  text-align: center;

  max-width: 500px;
`;

export const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => props.theme.primary};
  color: ${(props) => props.theme.white};
  padding: 8px;
  font-size: small;
  height: 36px;
  border: none;
  border-radius: 5px;
  &:hover {
    background-color: ${(props) => props.theme.primary}99;
  }
`;

export const ButtonBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => props.theme.secondary};
  color: ${(props) => props.theme.white};
  height: 50px;
  width: 40px;
  font-size: 30px;
  position: absolute;
  left: 0;
  top: 0;
  border-radius: 5px;

`;