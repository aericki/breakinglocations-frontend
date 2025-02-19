import {
  Container,
  Title,
  SubTitle,
  ButtonBox,
  Button,
  LeftContainer,
  RightContainer,
  Footer,
  RouteCard,
} from "./styles";
import { Link } from "react-router-dom";
import { MapPin, Search } from "lucide-react";

export default function Home() {
  return (
    <Container>
      <LeftContainer>
        <Title>BREAKING LOCATIONS</Title>
        <SubTitle>Encontre um local para treinar</SubTitle>
        <RouteCard>
          <Link to="/register">
            <Button onClick={() => {}}>
              <ButtonBox>
                <MapPin />
              </ButtonBox>
              Cadastre um local
            </Button>
          </Link>
          <Link to="/localization">
            <Button onClick={() => {}}>
              <ButtonBox>
                <Search />
              </ButtonBox>
              Encontre um local de treino.
            </Button>
          </Link>
        </RouteCard>
        <Footer>
          <p>Desenvolvido por Aéricki Ferreira</p>
          <p>
            Copyright © 2023 BreakingLocations. Todos os direitos reservados.
          </p>
        </Footer>
      </LeftContainer>
      <RightContainer />
    </Container>
  );
}
