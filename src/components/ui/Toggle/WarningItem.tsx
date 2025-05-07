import React from 'react'
import { ToggleItem } from './ToggleItem'

interface WarningItemProps {
  text: string;
  isToggled: boolean;
  onToggle: (value: boolean) => void;
}

export const WarningItem: React.FC<WarningItemProps> = ({
  text,
  isToggled,
  onToggle
}) => {
  return (
    <ToggleItem 
      text={text}
      isToggled={isToggled}
      onToggle={onToggle}
    />
  )
} 