/**
 * Example React Native component test 
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'
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

describe('Button Component', () => {
  it('renders correctly with the given title', () => {
    render(<Button title="Press Me" onPress={() => {}} />)
    
    const buttonText = screen.getByTestId('button-text')
    expect(buttonText).toBeTruthy()
    expect(buttonText.props.children).toBe('Press Me')
  })

  it('calls onPress handler when pressed', () => {
    const onPressMock = jest.fn()
    render(<Button title="Press Me" onPress={onPressMock} />)
    
    const button = screen.getByTestId('button')
    fireEvent.press(button)
    
    expect(onPressMock).toHaveBeenCalledTimes(1)
  })

  it('does not call onPress when disabled', () => {
    const onPressMock = jest.fn()
    render(<Button title="Press Me" onPress={onPressMock} disabled={true} />)
    
    const button = screen.getByTestId('button')
    fireEvent.press(button)
    
    expect(onPressMock).not.toHaveBeenCalled()
  })
}) 