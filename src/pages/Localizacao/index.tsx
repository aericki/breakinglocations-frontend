import  LocationMap from "@/components/LocationMap/index.tsx";
import { Container,  Section , LeftContainer} from "./styles";

export default function Localizacao() {
  return (
    <Container>
      <LeftContainer>
        <Section >
          <LocationMap />
        </Section>
      </LeftContainer>
    </Container>
  )
}