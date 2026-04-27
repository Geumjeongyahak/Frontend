"use client";

import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import HomeCard from "@/components/home/HomeCard";
import { colors, spacing, typography } from "@/styles/tokens";
import type { Notice } from "@/types/home";
import { getPosts } from "@/api/post/post.api";

type NoticeCardProps = {
  notices: Notice[];
};

export default function NoticeCard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["posts", "notice", "top12"],
    queryFn: () =>
      getPosts({
        postType: "NOTICE",
        page: 0,
        size: 12,
      }),
  });

  const notices = data?.content ?? [];

  return (
    <Card title="공지사항" actionLabel="더보기">
      <List>
        {isLoading && <Fallback>공지사항 불러오는 중...</Fallback>}
        {isError && <Fallback>공지사항을 불러오지 못했습니다.</Fallback>}
        {!isLoading && !isError && notices.length === 0 && (
          <Fallback>공지사항이 없습니다.</Fallback>
        )}
        {!isLoading &&
          !isError &&
          notices.map((notice) => (
            <ListItem key={notice.id}>
              <Title>{notice.title}</Title>
              {/* <Date>{notice.date}</Date> */} {/*TODO*/}
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

const Fallback = styled.p`
  color: ${colors.muted};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  padding: ${spacing.space8} 0;
`;
