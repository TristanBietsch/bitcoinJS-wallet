export const formatDate = (date: Date, locale: string = 'en-US'): string => {
    return date.toLocaleDateString(locale);
}; 