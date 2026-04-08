"use client";

import styled from "styled-components";
import HomeCard from "@/components/home/HomeCard";
import { colors, spacing, typography } from "@/styles/tokens";
import type { Notice } from "@/types/home";

type NoticeCardProps = {
  notices: Notice[];
};

export default function NoticeCard({ notices }: NoticeCardProps) {
  return (
    <Card title="공지사항" actionLabel="더보기">
      <List>
        {notices.map((notice) => (
          <ListItem key={notice.id}>
            <Title>{notice.title}</Title>
            <Date>{notice.date}</Date>
          </ListItem>
        ))}
      </List>
    </Card>
  );
}

const Card = styled(HomeCard)`
  height: 100%;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
`;

const ListItem = styled.article`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${spacing.space16};
  min-height: 3rem;
  border-bottom: 0.0625rem solid ${colors.border};
`;

const Title = styled.h3`
  overflow: hidden;
  color: ${colors.text};
  font-size: ${typography.fontSize18};
  font-weight: 400;
  line-height: ${typography.lineHeight150};
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Date = styled.time`
  color: ${colors.muted};
  font-size: ${typography.fontSize18};
  line-height: ${typography.lineHeight130};
  font-weight: 300;
  white-space: nowrap;
`;
