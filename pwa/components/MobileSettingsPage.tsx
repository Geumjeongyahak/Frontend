"use client";

import { useCallback, useEffect, useState } from "react";
import { IconChevronLeft } from "@tabler/icons-react";
import { toast } from "react-toastify";
import styled from "styled-components";
import { useAppBackNavigation } from "@/hooks/useAppBackNavigation";
import { syncPushSubscription } from "@/pwa/lib/pushNotifications";
import { colors, radii, spacing, typography } from "@/styles/tokens";

type LocationPermissionState = PermissionState | "unsupported";

function readNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported" as const;
  }

  return Notification.permission;
}

const BROWSER_SETTINGS_GUIDE = "주소창 왼쪽 사이트 정보 → 권한에서 허용해 주세요.";

export default function MobileSettingsPage() {
  const { handleBack } = useAppBackNavigation({ fallbackHref: "/mypage" });
  const [notificationPermission, setNotificationPermission] = useState(readNotificationPermission);
  const [locationPermission, setLocationPermission] = useState<LocationPermissionState>("prompt");

  const refreshLocationPermission = useCallback(async () => {
    if (typeof navigator === "undefined" || !("permissions" in navigator)) {
      const fallbackPermission = "geolocation" in navigator ? "prompt" : "unsupported";
      setLocationPermission(fallbackPermission);
      return fallbackPermission;
    }

    const permission = await navigator.permissions.query({ name: "geolocation" }).catch(() => null);

    const nextPermission =
      permission?.state ?? ("geolocation" in navigator ? "prompt" : "unsupported");
    setLocationPermission(nextPermission);
    return nextPermission;
  }, []);

  const refreshPermissionStates = useCallback(() => {
    setNotificationPermission(readNotificationPermission());
    void refreshLocationPermission();
  }, [refreshLocationPermission]);

  useEffect(() => {
    const refreshTimer = window.setTimeout(refreshPermissionStates, 0);
    window.addEventListener("focus", refreshPermissionStates);

    return () => {
      window.clearTimeout(refreshTimer);
      window.removeEventListener("focus", refreshPermissionStates);
    };
  }, [refreshPermissionStates]);

  async function handleNotificationChange() {
    const currentPermission = readNotificationPermission();
    setNotificationPermission(currentPermission);

    if (currentPermission === "unsupported") {
      toast.error("현재 브라우저에서는 알림을 지원하지 않습니다.");
      return;
    }

    if (currentPermission === "granted") {
      toast.info(
        "알림 권한이 현재 허용되어 있습니다. 해제는 브라우저 사이트 설정에서 할 수 있습니다.",
      );
      return;
    }

    if (currentPermission === "denied") {
      toast.info(`알림 권한이 차단되어 있습니다. ${BROWSER_SETTINGS_GUIDE}`);
      return;
    }

    const requestedPermission = await Notification.requestPermission().catch(
      () => "default" as NotificationPermission,
    );
    setNotificationPermission(requestedPermission);

    if (requestedPermission === "denied") {
      toast.info(`알림 권한이 차단되었습니다. ${BROWSER_SETTINGS_GUIDE}`);
      return;
    }

    if (requestedPermission !== "granted") {
      toast.info(`알림 권한 요청이 표시되지 않았습니다. ${BROWSER_SETTINGS_GUIDE}`);
      return;
    }

    toast.success("알림 권한을 허용했습니다.");

    await syncPushSubscription().catch(() => {
      toast.error("알림 구독 설정에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    });
  }

  function handleLocationChange() {
    if (locationPermission === "granted") {
      toast.info(
        "위치 권한이 현재 허용되어 있습니다. 해제는 브라우저 사이트 설정에서 할 수 있습니다.",
      );
      return;
    }

    if (locationPermission === "denied") {
      toast.info(`위치 권한이 차단되어 있습니다. ${BROWSER_SETTINGS_GUIDE}`);
      return;
    }

    if (locationPermission === "unsupported") {
      toast.error("현재 브라우저에서는 위치 확인을 지원하지 않습니다.");
      return;
    }

    if (!("geolocation" in navigator)) {
      toast.error("현재 브라우저에서는 위치 확인을 지원하지 않습니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        void refreshLocationPermission();
        toast.success("위치 권한을 허용했습니다.");
      },
      (error) => {
        void refreshLocationPermission().then((permission) => {
          if (permission === "denied" || error.code === error.PERMISSION_DENIED) {
            toast.info(`위치 권한이 차단되었거나 요청을 닫았습니다. ${BROWSER_SETTINGS_GUIDE}`);
            return;
          }

          toast.error("위치 정보를 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.");
        });
      },
    );
  }

  return (
    <Page>
      <Header>
        <BackButton type="button" onClick={handleBack} aria-label="마이페이지로 이동">
          <IconChevronLeft size={24} stroke={1.9} />
        </BackButton>
      </Header>

      <Intro>
        <Eyebrow>마이페이지</Eyebrow>
        <Title>환경 설정</Title>
      </Intro>

      <PermissionGuide>
        알림 및 위치 권한은 브라우저 정책상 이 화면에 보이는 토글 버튼으로 직접 켜거나 끌 수
        없습니다. 이 페이지에서는 현재 권한 설정 상태만 확인할 수 있습니다. 권한을 변경하려면 토글
        버튼을 누른 뒤, 현재 권한 상태에 따라 표시되는 안내를 확인하여 주소창 왼쪽의 사이트 정보
        아이콘 혹은 브라우저 설정을 통해 권한을 변경해 주세요. PWA로 접속 중인 경우에는 설치된 PWA를 삭제한 후, 
        Chrome 등 해당 PWA를 설치한 브라우저로 geumjeongschool.com에 접속한 뒤 사이트 권한을 재설정해 주세요.
      </PermissionGuide>

      <Panel aria-label="권한 설정">
        <SettingItem>
          <SettingLabel htmlFor="notification-permission">알림 허용</SettingLabel>
          <Toggle
            id="notification-permission"
            type="checkbox"
            checked={notificationPermission === "granted"}
            onChange={handleNotificationChange}
            aria-label="알림 허용"
          />
        </SettingItem>
        <SettingItem>
          <SettingLabel htmlFor="location-permission">위치 권한 허용</SettingLabel>
          <Toggle
            id="location-permission"
            type="checkbox"
            checked={locationPermission === "granted"}
            onChange={handleLocationChange}
            aria-label="위치 권한 허용"
          />
        </SettingItem>
      </Panel>
    </Page>
  );
}

const Page = styled.main`
  min-height: 100lvh;
  padding: 3.5rem 1.5625rem 2.5rem;
  background:
    radial-gradient(circle at top right, rgba(136, 205, 90, 0.2), transparent 34%),
    linear-gradient(180deg, #f7faf4 0%, #f3f3f3 42%, #f3f3f3 100%);
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  min-height: 2.75rem;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: ${colors.text};
  cursor: pointer;
`;

const Intro = styled.header`
  display: grid;
  gap: ${spacing.space12};
  margin-top: ${spacing.space20};
  margin-bottom: 1rem;
`;

const Eyebrow = styled.p`
  color: ${colors.point};
  font-size: ${typography.fontSize14};
  font-weight: 700;
`;

const Title = styled.h1`
  color: ${colors.text};
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.25;
`;

const PermissionGuide = styled.p`
  margin: 0 0 ${spacing.space16};
  padding: ${spacing.space16};
  border-radius: ${radii.radius15};
  background: ${colors.pointSoft};
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  word-break: keep-all;
`;

const Panel = styled.section`
  display: grid;
  padding: 0 ${spacing.space16};
  border-radius: 1.5rem;
  background: ${colors.white};
  box-shadow: 0 0.75rem 2rem rgba(0, 0, 0, 0.06);
`;

const SettingItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 4.75rem;
  gap: ${spacing.space20};

  & + & {
    border-top: 1px solid #e8ece5;
  }
`;

const SettingLabel = styled.label`
  color: ${colors.text};
  font-size: ${typography.fontSize16};
  font-weight: 700;
`;

const Toggle = styled.input`
  appearance: none;
  width: 3.25rem;
  height: 1.875rem;
  margin: 0;
  flex: 0 0 auto;
  border: 0;
  border-radius: ${radii.radius999};
  background: #d8d8d8;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &::after {
    content: "";
    display: block;
    width: 1.375rem;
    height: 1.375rem;
    margin: 0.25rem;
    border-radius: 50%;
    background: ${colors.white};
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.16);
    transition: transform 0.2s ease;
  }

  &:checked {
    background: ${colors.point};
  }

  &:checked::after {
    transform: translateX(1.375rem);
  }

  &:focus-visible {
    outline: 0.1875rem solid rgba(136, 205, 90, 0.35);
    outline-offset: 0.1875rem;
  }
`;
