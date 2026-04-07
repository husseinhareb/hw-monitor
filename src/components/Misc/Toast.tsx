import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNotifications, useDismissNotification } from '../../services/store';
import { useTranslation } from 'react-i18next';

const slideIn = keyframes`
  from { transform: translateX(110%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
`;

const ToastWrapper = styled.div`
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

const typeStyles: Record<string, { bg: string; border: string }> = {
  error:   { bg: '#3a1212', border: '#c0392b' },
  warning: { bg: '#3a2e12', border: '#e67e22' },
  info:    { bg: '#12243a', border: '#3498db' },
};

const ToastItem = styled.div<{ $type: string }>`
  background: ${({ $type }) => (typeStyles[$type] ?? typeStyles.error).bg};
  border-left: 4px solid ${({ $type }) => (typeStyles[$type] ?? typeStyles.error).border};
  color: #fff;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.85rem;
  animation: ${slideIn} 0.25s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  pointer-events: all;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  flex-shrink: 0;
  &:hover { color: #fff; }
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

  useEffect(() => {
    const timer = setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [id, dismiss]);

  return (
    <ToastItem $type={type}>
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
