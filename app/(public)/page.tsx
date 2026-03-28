import MoveButton from "@/components/common/MoveButton";
import styled from "styled-components";

export default function Home() {
  return (
    <Main>
      <Section>
        <Title>Hello, Geumjeongyahak!</Title>
        <Description>main page</Description>
        <MoveButton path="/login">login</MoveButton>
      </Section>
    </Main>
  );
}

const Main = styled.main`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8fafc;
`;

const Section = styled.section`
  width: 100%;
  max-width: 45rem;
  padding: 3rem 1.5rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
`;

const Description = styled.p`
  font-size: 1.125rem;
  line-height: 1.6;
  color: #4b5563;
  margin-bottom: 2rem;
`;
