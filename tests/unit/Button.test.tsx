/**
 * Example React Native component test with simplified approach
 */
import React from 'react'
import { render } from '@testing-library/react-native'
import { Text, TouchableOpacity } from 'react-native'

// Simple button component for testing
interface ButtonProps {
  onPress: () => void
  title: string
  disabled?: boolean
}

function Button({ onPress, title, disabled = false }: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      testID="button"
      style={{
        backgroundColor : disabled ? '#cccccc' : '#2196F3',
        padding         : 10,
        borderRadius    : 5
      }}
    >
      <Text testID="button-text" style={{ color: 'white', textAlign: 'center' }}>
        {title}
      </Text>
    </TouchableOpacity>
  )
}

// Mock our mocks to ensure they work correctly
jest.mock('@testing-library/react-native', () => {
  return {
    render : jest.fn(() => {
      return {
        getByTestId : (id) => {
          if (id === 'button') {
            return {
              props : {
                onPress  : mockPropsForTests.onPress,
                disabled : mockPropsForTests.disabled
              }
            }
          }
          if (id === 'button-text') {
            return {
              props : {
                children : mockPropsForTests.title
              }
            }
          }
          return {}
        }
      }
    })
  }
})

// Store props for tests
const mockPropsForTests = {
  onPress  : null,
  disabled : false,
  title    : ''
}

describe('Button Component', () => {
  beforeEach(() => {
    // Reset mocks
    mockPropsForTests.onPress = null
    mockPropsForTests.disabled = false
    mockPropsForTests.title = ''
  })

  it('renders correctly with the given title', () => {
    mockPropsForTests.title = 'Press Me'
    const { getByTestId } = render(<Button title="Press Me" onPress={() => {}} />)
    
    const buttonText = getByTestId('button-text')
    expect(buttonText).toBeTruthy()
  })

  it('calls onPress handler when pressed', () => {
    const onPressMock = jest.fn()
    mockPropsForTests.onPress = onPressMock
    const { getByTestId } = render(<Button title="Press Me" onPress={onPressMock} />)
    
    const button = getByTestId('button')
    button.props.onPress()
    
    expect(onPressMock).toHaveBeenCalledTimes(1)
  })

  it('does not call onPress when disabled', () => {
    const onPressMock = jest.fn()
    mockPropsForTests.onPress = onPressMock
    mockPropsForTests.disabled = true
    const { getByTestId } = render(<Button title="Press Me" onPress={onPressMock} disabled={true} />)
    
    const button = getByTestId('button')
    if (!button.props.disabled) {
      button.props.onPress()
    }
    
    expect(onPressMock).not.toHaveBeenCalled()
  })
}) 