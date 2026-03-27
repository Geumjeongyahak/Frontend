import styled from "styled-components";

const Main = styled.main`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8fafc;
`;

const Section = styled.section`
  width: 100%;
  max-width: 720px;
  padding: 48px 24px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 40px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16px;
`;

const Description = styled.p`
  font-size: 18px;
  line-height: 1.6;
  color: #4b5563;
  margin-bottom: 32px;
`;

const Button = styled.button`
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  background-color: #111827;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background-color: #1f2937;
  }
`;

export default function Home() {
  return (
    <Main>
      <Section>
        <Title>Hello, Geumjeongyahak!</Title>
        <Description>
          main page
        </Description>
        <Button>click</Button>
      </Section>
    </Main>
  );
}