/**
 * Custom hook for loading application fonts
 */
import { useFonts } from 'expo-font'
import { 
  Inter_400Regular, 
  Inter_500Medium, 
  Inter_700Bold 
} from '@expo-google-fonts/inter'
import { 
  IBMPlexMono_400Regular, 
  IBMPlexMono_700Bold 
} from '@expo-google-fonts/ibm-plex-mono'

/**
 * Hook to load all required app fonts
 * @returns [fontsLoaded, error]
 */
export const useAppFonts = (): [boolean, Error | null] => {
  const [ fontsLoaded, error ] = useFonts({
    'Inter-Regular'       : Inter_400Regular,
    'Inter-Medium'        : Inter_500Medium,
    'Inter-Bold'          : Inter_700Bold,
    'IBMPlexMono-Regular' : IBMPlexMono_400Regular,
    'IBMPlexMono-Bold'    : IBMPlexMono_700Bold,
  })
  
  return [ fontsLoaded, error ]
} 