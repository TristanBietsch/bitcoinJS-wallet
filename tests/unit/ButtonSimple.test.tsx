/**
 * Simple Button component test
 */
import React from 'react'
import renderer, { act } from 'react-test-renderer'
import { Text, TouchableOpacity } from 'react-native'

// Button component being tested
interface ButtonProps {
  onPress: () => void;
  title: string;
  disabled?: boolean;
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

describe('Button Component Simple Tests', () => {
  it('renders correctly with the given title', () => {
    let component
    act(() => {
      component = renderer.create(<Button title="Press Me" onPress={() => {}} />)
    })
    expect(component.toJSON()).toBeTruthy()
  })

  it('has correct structure', () => {
    let instance
    act(() => {
      instance = renderer.create(<Button title="Press Me" onPress={() => {}} />)
    })
    
    // Try to find elements by test ID instead of component type
    const button = instance.root.findByProps({ testID: 'button' })
    const text = instance.root.findByProps({ testID: 'button-text' })
    
    expect(button).toBeTruthy()
    expect(text).toBeTruthy()
    expect(text.props.children).toBe('Press Me')
  })

  it('sets disabled prop correctly', () => {
    let instance
    act(() => {
      instance = renderer.create(<Button title="Press Me" onPress={() => {}} disabled={true} />)
    })
    
    const button = instance.root.findByProps({ testID: 'button' })
    expect(button.props.disabled).toBe(true)
  })
}) 