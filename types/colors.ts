export type ColorKey = 'pureWhite' | 'offWhite' | 'darkBlueBlack' | 'electricBlue' | 
                       'cardBackground' | 'successGreen' | 'errorRed' | 'inactiveGray' | 'subtleBorder';

export const colors: Record<ColorKey, string> = {
    pureWhite: '#FFFFFF',         // Pure White
    offWhite: '#F9F9F9',          // Off-white
    darkBlueBlack: '#0A0B10',     // Dark Blue-Black
    electricBlue: '#0085FF',      // Electric Blue
    cardBackground: '#1E2434',     // Card Background
    successGreen: '#34D45C',      // Success Green
    errorRed: '#FF4A6E',          // Error Red
    inactiveGray: '#6F7390',      // Inactive Gray
    subtleBorder: '#3B3E4A',      // Subtle Border
}; 