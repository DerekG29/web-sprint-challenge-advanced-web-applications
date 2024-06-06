// Import the Spinner component into this file and test
// that it renders what it should for the different props it can take.
import React from 'react'
import { render, screen } from '@testing-library/react'
import Spinner from "./Spinner"

test('sanity', () => {
  expect(true).toBe(true)
})

describe('Testing Spinner', () => {
  test('Spinner works as expected', async () => {
    const { rerender } = render(<Spinner on={true} />)
    await screen.findByText('Please wait...')
    rerender(<Spinner on={false} />)
    expect(screen.queryByText('Please wait...')).toBeNull()
  })
}) 
