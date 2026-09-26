import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNotifications, useDismissNotification } from '../../services/store';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../services/configStore';

const slideIn = keyframes`
  from { transform: translateX(110%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
`;

const ToastWrapper = styled.div.attrs({ role: 'alert', 'aria-live': 'polite' })`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 340px;
  pointer-events: none;
`;

const ToastItem = styled.div<{ $accent: string; $bg: string; $color: string }>`
  background: color-mix(in srgb, ${({ $accent }) => $accent} 15%, ${({ $bg }) => $bg});
  border-left: 4px solid ${({ $accent }) => $accent};
  color: ${({ $color }) => $color};
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.85rem;
  animation: ${slideIn} 0.25s ease;
  pointer-events: all;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: inherit;
  opacity: 0.65;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  flex-shrink: 0;
  &:hover { opacity: 1; }
`;

const AUTO_DISMISS_MS = 5000;

interface EntryProps {
  id: string;
  messageKey: string;
  type: string;
  dismiss: (id: string) => void;
}

const ToastEntry: React.FC<EntryProps> = ({ id, messageKey, type, dismiss }) => {
  const { t } = useTranslation();
  const config = useConfigStore((state) => state.config);
  const accent = type === 'warning'
    ? config.config_toast_warning_color
    : type === 'info'
      ? config.config_toast_info_color
      : config.config_toast_error_color;

  useEffect(() => {
    const timer = setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [id, dismiss]);

  return (
    <ToastItem $accent={accent} $bg={config.config_container_background_color} $color={config.config_text_color}>
      <span>{t(messageKey, { defaultValue: messageKey })}</span>
      <CloseBtn onClick={() => dismiss(id)} aria-label="dismiss">✕</CloseBtn>
    </ToastItem>
  );
};

const Toast: React.FC = () => {
  const notifications = useNotifications();
  const dismiss = useDismissNotification();

  return (
    <ToastWrapper>
      {notifications.map((n) => (
        <ToastEntry key={n.id} id={n.id} messageKey={n.messageKey} type={n.type} dismiss={dismiss} />
      ))}
    </ToastWrapper>
  );
};

export default Toast;
