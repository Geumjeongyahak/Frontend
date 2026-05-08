"use client";

import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { getPosts } from "@/api/post/post.api";
import HomeCard from "@/components/home/HomeCard";
import { queryKeys } from "@/lib/queryKeys";
import { colors, spacing, typography } from "@/styles/tokens";

export default function NoticeCard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.posts.noticeTop12(),
    queryFn: () =>
      getPosts({
        channelType: "NOTICE",
        page: 0,
        size: 12,
      }),
    retry: false,
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
          notices.map((notice, index) => (
            <ListItem key={`${notice.id ?? "notice"}-${index}`}>
              <Title>{notice.title ?? "제목 없음"}</Title>
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

const Fallback = styled.p`
  color: ${colors.muted};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  padding: ${spacing.space8} 0;
`;
