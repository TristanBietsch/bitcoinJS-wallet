import { useState, useMemo } from 'react'

interface ToggleStates {
  [ key: string ]: boolean;
}

interface UseToggleStatesReturn {
  toggleStates: ToggleStates;
  setToggleState: (key: string, value: boolean) => void;
  areAllTogglesOn: boolean;
}

export function useToggleStates(initialStates: ToggleStates): UseToggleStatesReturn {
  const [ toggleStates, setToggleStates ] = useState<ToggleStates>(initialStates)
  
  const setToggleState = (key: string, value: boolean) => {
    setToggleStates(prev => ({
      ...prev,
      [ key ] : value
    }))
  }
  
  const areAllTogglesOn = useMemo(() => {
    return Object.values(toggleStates).every(value => value === true)
  }, [ toggleStates ])
  
  return {
    toggleStates,
    setToggleState,
    areAllTogglesOn
  }
} 