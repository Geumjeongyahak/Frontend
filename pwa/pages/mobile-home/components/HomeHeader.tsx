"use client";

import { IconBellFilled, IconBellPlusFilled, IconUserFilled } from "@tabler/icons-react";
import styled, { keyframes } from "styled-components";
import {
  MOBILE_HOME_CARD_SHADOW,
  MOBILE_HOME_ICON_BUTTON_SIZE,
  MOBILE_HOME_INLINE_SPACE,
  mobileHomeTone,
} from "@/pwa/pages/mobile-home/constants";
import AuthStatusSpinner from "@/pwa/pages/mobile-home/components/AuthStatusSpinner";

type HomeHeaderProps = {
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  userName: string;
  unreadCount: number;
  showPushOptIn: boolean;
  onProfileClick: () => void;
  onNotificationClick: () => void;
  onPushOptInClick: () => void;
  onLoginClick: () => void;
};

export default function HomeHeader({
  isAuthLoading,
  isAuthenticated,
  userName,
  unreadCount,
  showPushOptIn,
  onProfileClick,
  onNotificationClick,
  onPushOptInClick,
  onLoginClick,
}: HomeHeaderProps) {
  if (isAuthLoading) {
    return (
      <Header>
        <LoadingSlot>
          <AuthStatusSpinner />
        </LoadingSlot>
      </Header>
    );
  }

  return (
    <Header>
      <LeftSlot>
        {isAuthenticated ? (
          <GreetingBlock>
            <GreetingText>안녕하세요,</GreetingText>
            <GreetingName>{userName} 선생님</GreetingName>
          </GreetingBlock>
        ) : (
          <LoginButton type="button" onClick={onLoginClick}>
            로그인
          </LoginButton>
        )}
      </LeftSlot>
      <Actions>
        <IconButton type="button" onClick={onProfileClick} aria-label="프로필로 이동">
          <IconUserFilled size={20} stroke={0} />
        </IconButton>
        {showPushOptIn ? (
          <IconButton type="button" onClick={onPushOptInClick} aria-label="푸시 알림 받기">
            <IconBellPlusFilled size={20} stroke={0} />
          </IconButton>
        ) : null}
        <IconButton type="button" onClick={onNotificationClick} aria-label="알림함 열기">
          <IconBellFilled size={20} stroke={0} />
          {unreadCount > 0 ? <UnreadBadge>{Math.min(unreadCount, 9)}</UnreadBadge> : null}
        </IconButton>
      </Actions>
    </Header>
  );
}

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(0.625rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Header = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-inline: ${MOBILE_HOME_INLINE_SPACE};
  padding-top: 10lvw;
  min-height: calc(10lvw + 4.5625rem);
`;

const LeftSlot = styled.div`
  display: flex;
  align-items: flex-end;
  min-height: 4.5625rem;
`;

const LoadingSlot = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 4.5625rem;
`;

const GreetingBlock = styled.div`
  display: grid;
  align-items: end;
`;

const GreetingText = styled.p`
  color: ${mobileHomeTone.text};
  font-size: clamp(1.25rem, 5vw, 1.5rem);
  line-height: 1.2;
  animation: ${fadeUp} 2s ease both;
`;

const GreetingName = styled.h1`
  margin-top: 0.25rem;
  color: ${mobileHomeTone.strong};
  font-size: clamp(1.5rem, 6vw, 2rem);
  font-weight: 800;
  line-height: 1.2;
  word-break: keep-all;
  animation: ${fadeUp} 4s ease 1s both;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 2vw;
`;

const IconButton = styled.button`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${MOBILE_HOME_ICON_BUTTON_SIZE};
  height: ${MOBILE_HOME_ICON_BUTTON_SIZE};
  min-width: 2.5rem;
  min-height: 2.5rem;
  border: 0;
  border-radius: 50%;
  background: ${mobileHomeTone.white};
  box-shadow: ${MOBILE_HOME_CARD_SHADOW};
  color: ${mobileHomeTone.text};
`;

const UnreadBadge = styled.span`
  position: absolute;
  top: -0.125rem;
  right: -0.125rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1rem;
  height: 1rem;
  padding: 0 0.25rem;
  border-radius: 999px;
  background: #da3a30;
  color: ${mobileHomeTone.white};
  font-size: 0.6875rem;
  font-weight: 700;
  line-height: 1;
`;

const LoginButton = styled.button`
  min-height: 2.75rem;
  padding: 0 1.5rem;
  border: 0;
  border-radius: 999px;
  background: ${mobileHomeTone.successGradient};
  color: ${mobileHomeTone.white};
  font-size: ${mobileHomeTone.typography.fontSize16};
  font-weight: 700;
  align-self: flex-end;
`;
