import React from 'react';
import { Button as GluestackButton, ButtonText, ButtonIcon } from "@gluestack-ui/themed";
import { useHaptics } from '@/hooks/useHaptics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'solid' | 'outline' | 'link';
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

/**
 * Button component with haptic feedback
 * Uses Gluestack UI Button under the hood with added haptic feedback
 */
const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'solid',
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  size = 'md',
}) => {
  const { triggerImpact } = useHaptics();
  
  const handlePress = () => {
    triggerImpact('light');
    onPress();
  };

  return (
    <GluestackButton
      onPress={handlePress}
      variant={variant}
      isDisabled={disabled}
      size={size}
      w={fullWidth ? "full" : undefined}
    >
      {leftIcon && <ButtonIcon as={leftIcon} mr="$2" />}
      <ButtonText>{title}</ButtonText>
      {rightIcon && <ButtonIcon as={rightIcon} ml="$2" />}
    </GluestackButton>
  );
};

export default Button; 