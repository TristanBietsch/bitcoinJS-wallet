import React from 'react';
import {
  Modal as GluestackModal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  CloseIcon,
  Icon,
  Heading
} from "@gluestack-ui/themed";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Modal component using Gluestack UI
 * Provides a consistent modal experience across the app
 */
const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  footer
}) => {
  return (
    <GluestackModal isOpen={visible} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent>
        {title && (
          <ModalHeader>
            <Heading size="md">{title}</Heading>
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
        )}
        <ModalBody>
          {children}
        </ModalBody>
        {footer && (
          <ModalFooter>
            {footer}
          </ModalFooter>
        )}
      </ModalContent>
    </GluestackModal>
  );
};

export default Modal; 