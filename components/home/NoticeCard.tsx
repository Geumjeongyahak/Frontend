"use client";

import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import HomeCard from "@/components/home/HomeCard";
import { notices as fallbackNotices } from "@/mocks/home";
import { colors, spacing, typography } from "@/styles/tokens";
import { getPosts } from "@/api/post/post.api";

export default function NoticeCard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["posts", "notice", "top12"],
    queryFn: () =>
      getPosts({
        postType: "NOTICE",
        page: 0,
        size: 12,
      }),
    retry: false,
  });

  const notices = data?.content && data.content.length > 0 ? data.content : fallbackNotices;

  return (
    <Card title="공지사항" actionLabel="더보기">
      <List>
        {!isLoading && !isError && notices.length === 0 && (
          <Fallback>공지사항이 없습니다.</Fallback>
        )}
        {notices.map((notice) => (
          <ListItem key={notice.id ?? notice.title}>
            <Title>{notice.title ?? ""}</Title>
            <Date>00.00.00</Date>
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
  min-height: 2.625rem;
  border-bottom: 0.0625rem solid ${colors.border};

  @media (min-width: 120rem) {
    min-height: 3.6875rem;
  }
`;

const Title = styled.h3`
  min-width: 0;
  overflow: hidden;
  color: ${colors.text};
  font-size: ${typography.fontSize16};
  font-weight: 400;
  line-height: ${typography.lineHeight150};
  white-space: nowrap;
  text-overflow: ellipsis;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize24};
  }
`;

const Date = styled.time`
  color: ${colors.muted};
  font-size: ${typography.fontSize16};
  line-height: ${typography.lineHeight130};
  font-weight: 300;
  white-space: nowrap;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize24};
  }
`;

const Fallback = styled.p`
  color: ${colors.muted};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  padding: ${spacing.space8} 0;
`;
