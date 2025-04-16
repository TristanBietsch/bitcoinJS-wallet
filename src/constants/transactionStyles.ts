import { StyleSheet } from 'react-native'

/**
 * Shared styles for transaction screens
 */
export const transactionStyles = StyleSheet.create({
  container : {
    flex : 1
  },
  backButton : {
    position       : 'absolute',
    top            : 60,
    left           : 20,
    width          : 40,
    height         : 40,
    borderRadius   : 20,
    alignItems     : 'center',
    justifyContent : 'center'
  },
  content : {
    flex              : 1,
    paddingHorizontal : 20,
    paddingTop        : 120,
    gap               : 32
  },
  detailRow : {
    flexDirection  : 'row',
    justifyContent : 'space-between',
    alignItems     : 'flex-start'
  },
  label : {
    fontSize : 16,
    color    : '#666'
  },
  bold : {
    fontWeight : '600'
  },
  totalRow : {
    marginTop      : 12,
    paddingTop     : 24,
    borderTopWidth : 1,
    borderTopColor : '#E5E5E5'
  }
}) 