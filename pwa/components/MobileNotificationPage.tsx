"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { IconChevronLeft } from "@tabler/icons-react";
import styled from "styled-components";
import { useAppBackNavigation } from "@/hooks/useAppBackNavigation";
import { useNotificationInbox } from "@/pwa/hooks/useNotificationInbox";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

function formatDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "날짜 정보 없음";
  }

  return `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}.${String(date.getFullYear()).slice(2)}`;
}

export default function MobileNotificationPage() {
  const router = useRouter();
  const { handleBack } = useAppBackNavigation({ fallbackHref: "/" });
  const { notifications, markAllAsRead } = useNotificationInbox();

  useEffect(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  const groupedNotifications = useMemo(() => {
    const grouped = new Map<string, typeof notifications>();

    notifications.forEach((notification) => {
      const key = formatDateLabel(notification.receivedAt);
      const current = grouped.get(key) ?? [];
      current.push(notification);
      grouped.set(key, current);
    });

    return [...grouped.entries()];
  }, [notifications]);

  return (
    <Page>
      <Header>
        <BackButton type="button" onClick={handleBack}>
          <IconChevronLeft size={26} stroke={1.8} />
        </BackButton>
      </Header>

      <Content>
        {groupedNotifications.length === 0 ? (
          <EmptyState>아직 수신된 알림이 없습니다.</EmptyState>
        ) : (
          groupedNotifications.map(([dateLabel, records]) => (
            <DateGroup key={dateLabel}>
              <DateLabel>{dateLabel}</DateLabel>
              <CardList>
                {records.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    type="button"
                    onClick={() => router.push(notification.targetUrl)}
                  >
                    <Category>{notification.category}</Category>
                    <Message>{notification.body || notification.title}</Message>
                  </NotificationCard>
                ))}
              </CardList>
            </DateGroup>
          ))
        )}
      </Content>
    </Page>
  );
}

const Page = styled.main`
  min-height: 100vh;
  background: ${colors.background};
  padding-bottom: 2rem;

  @media (min-width: ${layout.breakpointMobile}) {
    max-width: 24.375rem;
    margin: 0 auto;
  }
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  min-height: 7.8125rem;
  padding: 3.75rem ${spacing.space24} ${spacing.space16};
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: ${colors.text};
  padding: 0;
  cursor: pointer;
`;

const Content = styled.section`
  display: grid;
  gap: ${spacing.space16};
  padding: 0 ${spacing.space24};
`;

const EmptyState = styled.p`
  padding: ${spacing.space24};
  border-radius: ${radii.radius20};
  background: ${colors.white};
  color: ${colors.muted};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
`;

const DateGroup = styled.section`
  display: grid;
  gap: ${spacing.space12};
`;

const DateLabel = styled.p`
  color: ${colors.muted};
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
`;

const CardList = styled.div`
  display: grid;
  gap: ${spacing.space12};
`;

const NotificationCard = styled.button`
  display: grid;
  gap: ${spacing.space20};
  width: 100%;
  padding: 0.9375rem;
  border: 0;
  border-radius: ${radii.radius12};
  background: ${colors.white};
  text-align: left;
  cursor: pointer;
`;

const Category = styled.p`
  color: ${colors.point};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
`;

const Message = styled.p`
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
`;
