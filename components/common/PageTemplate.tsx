"use client";

import styled from "styled-components";

type PageTemplateProps = {
  title: string;
  description?: string;
};

export default function PageTemplate({ title, description }: PageTemplateProps) {
  return (
    <Main>
      <Section>
        <Title>{title}</Title>
        <Description>{description}</Description>
      </Section>
    </Main>
  );
}

const Main = styled.main`
  min-height: calc(100vh - 5.25rem);
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
  margin-bottom: 0;
`;
